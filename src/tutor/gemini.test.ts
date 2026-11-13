import type { Content, GenerateContentResponse, Part } from '@google/genai';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGeminiSession, geminiConfig, GEMINI_MODELS, runGeminiTurn, type ChatFactory } from './gemini';
import { TUTOR_SYSTEM } from './prompt';
import { loadSettings, PROVIDERS, saveSettings } from './providers';
import { TUTOR_TOOLS } from './tools';

const chunk = (parts: Part[], finishReason?: string, usage?: Record<string, number>): GenerateContentResponse =>
  ({ candidates: [{ content: { role: 'model', parts }, finishReason }], usageMetadata: usage }) as unknown as GenerateContentResponse;
const blockedChunk = () => ({ promptFeedback: { blockReason: 'SAFETY' } }) as unknown as GenerateContentResponse;
const call = (id: string, name: string, args: Record<string, unknown>): Part => ({ functionCall: { id, name, args } });

/** A stand-in for the SDK's chat object that replays scripted streams and records what was sent. */
function scripted(replies: (GenerateContentResponse[] | Error)[]) {
  const sent: Part[][] = [];
  const startedFrom: Content[][] = [];
  const makeChat: ChatFactory = (history) => {
    startedFrom.push(history);
    const h: Content[] = [...history];
    return {
      getHistory: () => h,
      async sendMessageStream({ message }) {
        sent.push(message);
        const next = replies.shift();
        if (!next) throw new Error('script exhausted');
        if (next instanceof Error) throw next;
        h.push({ role: 'user', parts: message });
        h.push({ role: 'model', parts: next.flatMap((c) => c.candidates?.[0]?.content?.parts ?? []) });
        return (async function* () {
          for (const c of next) yield c;
        })();
      },
    };
  };
  return { makeChat, sent, startedFrom };
}

describe('Gemini tutor turn', () => {
  it('streams a direct answer and skips thought parts', async () => {
    const { makeChat } = scripted([[
      chunk([{ text: 'planning...', thought: true }]),
      chunk([{ text: 'Ions must be ' }]),
      chunk([{ text: 'free to move.' }], 'STOP', { promptTokenCount: 900, candidatesTokenCount: 12, thoughtsTokenCount: 30 }),
    ]]);
    const state = { chat: makeChat([]) };
    const seen: string[] = [];
    const out = await runGeminiTurn(makeChat, state, [{ text: 'Why does molten NaCl conduct?' }], { onText: (d) => seen.push(d) });
    expect(out).toMatchObject({ status: 'ok', text: 'Ions must be free to move.' });
    expect(seen).toEqual(['Ions must be ', 'free to move.']);
    expect(out.usage).toMatchObject({ input: 900, output: 42 });
  });

  it('runs tools with the chemistry engine and answers each call by id in one message', async () => {
    const { makeChat, sent } = scripted([
      [chunk([call('c1', 'formula_mass', { formula: 'CaCO3' }), call('c2', 'calculate', { expression: '5.0 / 100' })], 'STOP')],
      [chunk([{ text: '5.0 g is 0.05 mol.' }], 'STOP')],
    ]);
    const state = { chat: makeChat([]) };
    const tools: string[] = [];
    const out = await runGeminiTurn(makeChat, state, [{ text: 'Moles in 5.0 g of CaCO3?' }], { onTool: (s) => tools.push(s) });

    expect(out).toMatchObject({ status: 'ok', text: '5.0 g is 0.05 mol.' });
    expect(tools).toEqual(['Formula mass of [[CaCO3]] = 100', '5.0 / 100 = 0.05']);
    expect(sent).toHaveLength(2);
    const responses = sent[1].map((p) => p.functionResponse!);
    expect(responses.map((r) => r.id)).toEqual(['c1', 'c2']);
    expect(responses.map((r) => r.name)).toEqual(['formula_mass', 'calculate']);
    expect((responses[0].response!.output as { formula_mass: number }).formula_mass).toBe(100);
  });

  it('returns a bad tool call to the model as an error', async () => {
    const { makeChat, sent } = scripted([
      [chunk([call('c1', 'formula_mass', { formula: 'Xx9' })], 'STOP')],
      [chunk([{ text: 'Let me correct that.' }], 'STOP')],
    ]);
    await runGeminiTurn(makeChat, { chat: makeChat([]) }, [{ text: 'q' }]);
    expect(sent[1][0].functionResponse!.response).toHaveProperty('error');
  });

  it('restores the conversation when a turn is declined, cut off mid-call or fails', async () => {
    const earlier: Content[] = [{ role: 'user', parts: [{ text: 'earlier' }] }, { role: 'model', parts: [{ text: 'earlier reply' }] }];
    const cases: [(GenerateContentResponse[] | Error)[], string][] = [
      [[[blockedChunk()]], 'declined'],
      [[[chunk([], 'SAFETY')]], 'declined'],
      [[[chunk([call('c1', 'calculate', { expression: '1+1' })], 'MAX_TOKENS')]], 'cut_off'],
      [[[chunk([], 'MALFORMED_FUNCTION_CALL')]], 'cut_off'],
    ];
    for (const [replies, status] of cases) {
      const { makeChat, sent } = scripted(replies);
      const state = { chat: makeChat(earlier) };
      const tools: string[] = [];
      const out = await runGeminiTurn(makeChat, state, [{ text: 'q' }], { onTool: (s) => tools.push(s) });
      expect(out.status, status).toBe(status);
      expect(tools).toEqual([]);
      expect(sent).toHaveLength(1);
      expect(state.chat.getHistory(true)).toEqual(earlier);
    }
    const { makeChat } = scripted([new Error('network down')]);
    const state = { chat: makeChat(earlier) };
    await expect(runGeminiTurn(makeChat, state, [{ text: 'q' }])).rejects.toThrow('network down');
    expect(state.chat.getHistory(true)).toEqual(earlier);
  });

  it('stops a model that keeps calling tools', async () => {
    const loop = Array.from({ length: 10 }, (_, i) => [chunk([call(`c${i}`, 'calculate', { expression: '1+1' })], 'STOP')]);
    const { makeChat, sent } = scripted(loop);
    const out = await runGeminiTurn(makeChat, { chat: makeChat([]) }, [{ text: 'q' }]);
    expect(out.status).toBe('cut_off');
    expect(sent).toHaveLength(6);
  });

  it('a session sends lesson notes and the question as separate parts and remembers the chat', async () => {
    const { makeChat, sent } = scripted([[chunk([{ text: 'A.' }], 'STOP')], [chunk([{ text: 'B.' }], 'STOP')]]);
    const session = createGeminiSession('unused', GEMINI_MODELS[0], makeChat);
    await session.send('note text', 'first question');
    await session.send('', 'second question');
    expect(sent[0]).toEqual([{ text: '<lesson_notes>\nnote text\n</lesson_notes>' }, { text: 'first question' }]);
    expect(sent[1]).toEqual([{ text: 'second question' }]);
  });
});

describe('Gemini request shape', () => {
  it('declares the same tools and instructions as the Claude tutor', () => {
    const cfg = geminiConfig();
    expect(cfg.systemInstruction).toBe(TUTOR_SYSTEM);
    const decls = cfg.tools![0] as { functionDeclarations: { name: string; parametersJsonSchema: { required: string[] } }[] };
    expect(decls.functionDeclarations.map((d) => d.name)).toEqual(TUTOR_TOOLS.map((t) => t.name));
    for (const d of decls.functionDeclarations) expect(d.parametersJsonSchema.required).toHaveLength(1);
  });
  it('lists only free models', () => {
    for (const m of GEMINI_MODELS) expect(m.inPrice + m.outPrice).toBe(0);
  });
});

describe('tutor settings', () => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  afterEach(() => store.clear());

  it('defaults to the free provider', () => {
    const s = loadSettings();
    expect(s.provider).toBe('gemini');
    expect(PROVIDERS[0]).toMatchObject({ id: 'gemini', free: true });
    expect(s.keys).toEqual({ gemini: '', claude: '' });
  });
  it('keeps a key saved before Gemini was added', () => {
    store.set('chemcsec:tutor', JSON.stringify({ apiKey: 'old-claude-key', model: 'claude-haiku-5-5' }));
    const s = loadSettings();
    expect(s).toMatchObject({ provider: 'claude', keys: { claude: 'old-claude-key', gemini: '' }, models: { claude: 'claude-haiku-5-5' } });
  });
  it('round-trips and repairs unknown model ids', () => {
    saveSettings({ provider: 'gemini', keys: { gemini: 'g', claude: 'c' }, models: { gemini: 'retired-model', claude: 'claude-sonnet-5-5' } });
    const s = loadSettings();
    expect(s.keys).toEqual({ gemini: 'g', claude: 'c' });
    expect(s.models).toEqual({ gemini: GEMINI_MODELS[0].id, claude: 'claude-sonnet-5-5' });
  });
});
