import type Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';
import { calculate } from './calc';
import { buildParams, costUsd, modelById, MODELS, runTutorTurn, type StreamLike, type TutorClient } from './claude';
import { TUTOR_SYSTEM } from './prompt';
import { lessonNotes, search } from './retrieve';
import { runTool, TUTOR_TOOLS } from './tools';

type Message = Anthropic.Beta.BetaMessage;
type Block = Anthropic.Beta.BetaContentBlock;

describe('calculate', () => {
  it('follows the usual order of operations', () => {
    expect(calculate('2 + 3 * 4')).toBe(14);
    expect(calculate('(2 + 3) * 4')).toBe(20);
    expect(calculate('2 ^ 3 ^ 2')).toBe(512);
    expect(calculate('-2 ^ 2')).toBe(-4);
    expect(calculate('10 - 4 - 3')).toBe(3);
  });
  it('handles the numbers chemistry uses', () => {
    expect(calculate('0.100 * 25.0 / 1000')).toBeCloseTo(0.0025, 12);
    expect(calculate('6.02e23 * 0.5')).toBeCloseTo(3.01e23, -18);
    expect(calculate('(28 / 80) × 100')).toBeCloseTo(35, 10);
    expect(calculate('1930 ÷ 96500')).toBeCloseTo(0.02, 12);
    expect(calculate('-log(1e-3)')).toBeCloseTo(3, 12);
    expect(calculate('sqrt(16) + abs(-2)')).toBe(6);
  });
  it('refuses anything that is not arithmetic', () => {
    for (const bad of ['', '2 +', '1 / 0', 'alert(1)', 'window.location', '2 ** 3', '(1 + 2', '3 $ 4', 'constructor', '1e999 * 10']) {
      expect(() => calculate(bad), bad).toThrow();
    }
  });
});

describe('tutor tools', () => {
  it('compute with the chemistry engine', () => {
    expect(JSON.parse(runTool('formula_mass', { formula: 'CaCO3' }).content).formula_mass).toBe(100);
    expect(JSON.parse(runTool('balance_equation', { equation: 'Fe2O3 + CO -> Fe + CO2' }).content).balanced).toBe('Fe2O3 + 3CO -> 2Fe + 3CO2');
    expect(JSON.parse(runTool('check_equation', { equation: 'H2 + O2 -> H2O' }).content)).toMatchObject({ balanced: false, left: { H: 2, O: 2 }, right: { H: 2, O: 1 } });
    expect(JSON.parse(runTool('check_equation', { equation: 'Cu^2+ + 2e- -> Cu' }).content).balanced).toBe(true);
    expect(JSON.parse(runTool('calculate', { expression: '5.0 / 100 * 44' }).content).result).toBeCloseTo(2.2, 10);
    expect(JSON.parse(runTool('element_data', { symbol: 'Na' }).content)).toMatchObject({ atomic_number: 11, electron_arrangement: [2, 8, 1] });
  });
  it('reject malformed or truncated input instead of running', () => {
    for (const input of [undefined, null, {}, { formula: 42 }, { wrong: 'CaCO3' }, { formula: '' }, 'CaCO3']) {
      const out = runTool('formula_mass', input);
      expect(out.isError, JSON.stringify(input)).toBe(true);
    }
    expect(runTool('formula_mass', { formula: 'Xx9' }).isError).toBe(true);
    expect(runTool('no_such_tool', { a: 'b' }).isError).toBe(true);
    expect(runTool('calculate', { expression: 'fetch(1)' }).isError).toBe(true);
  });
  it('every tool takes exactly one required string and streams its input', () => {
    for (const t of TUTOR_TOOLS) {
      expect(t.input_schema.required).toHaveLength(1);
      expect(t.eager_input_streaming).toBe(true);
    }
  });
});

describe('lesson grounding', () => {
  it('finds the relevant lesson for a plain-language question', () => {
    expect(search('why does graphite conduct electricity')[0].topic).toBe('A5');
    expect(search('anode cathode products brine')[0].topic).toBe('A9');
    expect(search('')).toEqual([]);
  });
  it('includes the chosen topic, mastery and common mistakes', () => {
    const notes = lessonNotes('how do I do mole ratio questions', 'A6', 35);
    expect(notes).toContain('The mole and equations');
    expect(notes).toContain('35%');
    expect(notes).toContain('Coefficients compare MOLES');
  });
});

// ---------- the conversation loop, against a scripted model ----------
const usage = { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } as Message['usage'];
const reply = (content: unknown[], stop_reason: Message['stop_reason']): Message =>
  ({ id: 'msg', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: content as Block[], stop_reason, stop_sequence: null, usage }) as Message;
const text = (t: string) => ({ type: 'text', text: t, citations: null });
const toolUse = (id: string, name: string, input: unknown) => ({ type: 'tool_use', id, name, input });

function scripted(replies: (Message | Error)[]) {
  const requests: Parameters<TutorClient['stream']>[0][] = [];
  const client: TutorClient = {
    stream(params) {
      // Snapshot: the caller keeps appending to the same messages array.
      requests.push(JSON.parse(JSON.stringify(params)));
      const next = replies.shift();
      let listener: (d: string) => void = () => {};
      const stream: StreamLike = {
        on: (_e, l) => (listener = l),
        abort: () => {},
        async finalMessage() {
          if (!next) throw new Error('script exhausted');
          if (next instanceof Error) throw next;
          for (const b of next.content) if (b.type === 'text') listener(b.text);
          return next;
        },
      };
      return stream;
    },
  };
  return { client, requests };
}

describe('tutor turn', () => {
  const opus = modelById('claude-opus-5-5');

  it('answers directly when no tool is needed', async () => {
    const { client, requests } = scripted([reply([text('Ions must be free to move.')], 'end_turn')]);
    const history: Anthropic.Beta.BetaMessageParam[] = [];
    const seen: string[] = [];
    const out = await runTutorTurn(client, opus, history, 'Why does molten NaCl conduct?', { onText: (d) => seen.push(d) });
    expect(out).toMatchObject({ status: 'ok', text: 'Ions must be free to move.' });
    expect(seen.join('')).toBe(out.text);
    expect(history.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(requests).toHaveLength(1);
  });

  it('runs tools with the chemistry engine and returns all results in one message', async () => {
    const { client, requests } = scripted([
      reply([{ type: 'thinking', thinking: '', signature: 'sig' }, toolUse('t1', 'formula_mass', { formula: 'CaCO3' }), toolUse('t2', 'calculate', { expression: '5.0 / 100' })], 'tool_use'),
      reply([text('The formula mass is 100, so 5.0 g is 0.05 mol.')], 'end_turn'),
    ]);
    const history: Anthropic.Beta.BetaMessageParam[] = [];
    const tools: string[] = [];
    const out = await runTutorTurn(client, opus, history, 'Moles in 5.0 g of CaCO3?', { onTool: (s) => tools.push(s) });

    expect(out.status).toBe('ok');
    expect(tools).toEqual(['Formula mass of [[CaCO3]] = 100', '5.0 / 100 = 0.05']);
    expect(history.map((m) => m.role)).toEqual(['user', 'assistant', 'user', 'assistant']);
    // The assistant turn, thinking block included, is passed back exactly as received.
    expect((history[1].content as Block[])[0]).toMatchObject({ type: 'thinking', signature: 'sig' });
    const results = history[2].content as Anthropic.Beta.BetaToolResultBlockParam[];
    expect(results.map((r) => r.tool_use_id)).toEqual(['t1', 't2']);
    expect(JSON.parse(results[0].content as string).formula_mass).toBe(100);
    expect(results.every((r) => r.is_error === false)).toBe(true);
    // The second request carries the tool results.
    expect(requests[1].messages).toHaveLength(3);
    expect(out.usage).toMatchObject({ input: 200, output: 40 });
  });

  it('reports a bad tool call to the model as an error result instead of running it', async () => {
    const { client } = scripted([
      reply([toolUse('t1', 'formula_mass', { formula: 12 })], 'tool_use'),
      reply([text('Let me try that again.')], 'end_turn'),
    ]);
    const history: Anthropic.Beta.BetaMessageParam[] = [];
    await runTutorTurn(client, opus, history, 'x');
    const [result] = history[2].content as Anthropic.Beta.BetaToolResultBlockParam[];
    expect(result.is_error).toBe(true);
    expect(result.content).toContain('INVALID_JSON');
  });

  it('never runs tools from a declined or cut-off turn, and leaves the history as it was', async () => {
    for (const stop of ['refusal', 'max_tokens'] as const) {
      const { client, requests } = scripted([reply([toolUse('t1', 'calculate', { expression: '1+1' })], stop)]);
      const history: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: 'earlier' }, { role: 'assistant', content: 'earlier reply' }];
      const tools: string[] = [];
      const out = await runTutorTurn(client, opus, history, 'q', { onTool: (s) => tools.push(s) });
      expect(out.status).toBe(stop === 'refusal' ? 'declined' : 'cut_off');
      expect(tools).toEqual([]);
      expect(history).toHaveLength(2);
      expect(requests).toHaveLength(1);
    }
  });

  it('rolls the history back when the request fails', async () => {
    const { client } = scripted([new Error('network down')]);
    const history: Anthropic.Beta.BetaMessageParam[] = [];
    await expect(runTutorTurn(client, opus, history, 'q')).rejects.toThrow();
    expect(history).toHaveLength(0);
  });

  it('stops a model that keeps calling tools', async () => {
    const loop = Array.from({ length: 10 }, (_, i) => reply([toolUse(`t${i}`, 'calculate', { expression: '1+1' })], 'tool_use'));
    const { client, requests } = scripted(loop);
    const out = await runTutorTurn(client, opus, [], 'q');
    expect(out.status).toBe('cut_off');
    expect(requests).toHaveLength(6);
  });
});

describe('request shape', () => {
  it('caches the fixed prompt, states effort, and never forces a tool or disables thinking', () => {
    for (const m of MODELS) {
      const p = buildParams(m, [{ role: 'user', content: 'hi' }]) as unknown as Record<string, unknown>;
      expect(p.model).toBe(m.id);
      expect(p.system).toEqual([{ type: 'text', text: TUTOR_SYSTEM, cache_control: { type: 'ephemeral' } }]);
      expect(p.output_config).toEqual({ effort: 'medium' });
      expect(p).not.toHaveProperty('thinking');
      expect(p).not.toHaveProperty('tool_choice');
      expect(p).not.toHaveProperty('temperature');
      expect(p.fallbacks).toBe(m.serverFallback ? 'default' : undefined);
    }
  });
  it('the fixed prompt contains nothing that changes between requests', () => {
    expect(TUTOR_SYSTEM).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(buildParams(MODELS[0], []).system).toEqual(buildParams(MODELS[0], []).system);
  });
  it('estimates cost from token counts', () => {
    expect(costUsd({ input: 1_000_000, output: 0, cacheRead: 0, cacheWrite: 0 }, modelById('claude-haiku-5-5'))).toBeCloseTo(0.1, 10);
    expect(costUsd({ input: 0, output: 1_000_000, cacheRead: 1_000_000, cacheWrite: 0 }, modelById('claude-opus-5-5'))).toBeCloseTo(20.4, 10);
  });
});
