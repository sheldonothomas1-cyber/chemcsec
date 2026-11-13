// The free tutor: Google Gemini through Google's official SDK, on the Gemini API free tier.
// Same tools, prompt and lesson grounding as the Claude tutor; only the wire format differs.
// The SDK's chat object keeps the conversation and passes the model's turns back unchanged,
// which is what Gemini's thought signatures require.
import { ApiError, FinishReason, GoogleGenAI, type Content, type FunctionCall, type GenerateContentConfig, type GenerateContentResponse, type Part } from '@google/genai';
import { TUTOR_SYSTEM } from './prompt';
import { runTool, TUTOR_TOOLS } from './tools';
import { MAX_STEPS, ZERO_USAGE, type TurnCallbacks, type TurnResult, type TutorModel, type TutorSession, type Usage } from './types';

// Models with a free tier on the Gemini API, checked against Google's pricing page in November 2026.
export const GEMINI_MODELS: TutorModel[] = [
  { id: 'gemini-4-hydrogen', label: 'Gemini 4 Hydrogen', note: 'Google\'s current everyday model. Free.', inPrice: 0, outPrice: 0 },
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', note: 'Previous-generation Flash, very capable. Free.', inPrice: 0, outPrice: 0 },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite', note: 'Fastest and lightest. Free. Try this if you hit the daily limit on the others.', inPrice: 0, outPrice: 0 },
];

/** The tool list in Gemini's format. Gemini takes the JSON Schema as it is. */
export function geminiConfig(): GenerateContentConfig {
  return {
    systemInstruction: TUTOR_SYSTEM,
    tools: [{
      functionDeclarations: TUTOR_TOOLS.map((t) => ({
        name: t.name,
        description: t.description,
        parametersJsonSchema: { type: 'object', properties: t.input_schema.properties, required: t.input_schema.required },
      })),
    }],
  };
}

export interface GeminiChatLike {
  sendMessageStream(params: { message: Part[]; config?: GenerateContentConfig }): Promise<AsyncGenerator<GenerateContentResponse>>;
  getHistory(curated?: boolean): Content[];
}
/** Makes a chat that starts from the given history (empty for a new conversation). */
export type ChatFactory = (history: Content[]) => GeminiChatLike;

export function createChatFactory(apiKey: string, model: TutorModel): ChatFactory {
  const ai = new GoogleGenAI({ apiKey });
  return (history) => ai.chats.create({ model: model.id, config: geminiConfig(), history });
}

const DECLINED = new Set<string>([
  FinishReason.SAFETY, FinishReason.RECITATION, FinishReason.BLOCKLIST, FinishReason.PROHIBITED_CONTENT, FinishReason.SPII, FinishReason.LANGUAGE,
]);

/**
 * Send one learner turn and run the tool loop. `state.chat` holds the conversation; if the
 * turn fails, is declined or is cut off mid tool call, the chat is rebuilt from how it stood
 * before the turn, so a broken exchange never stays in the history.
 */
export async function runGeminiTurn(
  makeChat: ChatFactory,
  state: { chat: GeminiChatLike },
  parts: Part[],
  callbacks: TurnCallbacks = {},
  signal?: AbortSignal,
): Promise<TurnResult> {
  const before = structuredClone(state.chat.getHistory(true));
  const rollback = () => {
    state.chat = makeChat(before);
  };
  // A per-request config replaces the chat's config rather than extending it, so send it whole.
  const config: GenerateContentConfig = { ...geminiConfig(), abortSignal: signal };
  const usage: Usage = { ...ZERO_USAGE };
  let text = '';
  let message = parts;

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const stream = await state.chat.sendMessageStream({ message, config });
      const calls: FunctionCall[] = [];
      let finish: string | undefined;
      let blocked = false;
      let last: GenerateContentResponse['usageMetadata'];

      for await (const chunk of stream) {
        if (chunk.promptFeedback?.blockReason) blocked = true;
        const candidate = chunk.candidates?.[0];
        for (const part of candidate?.content?.parts ?? []) {
          if (part.functionCall) calls.push(part.functionCall);
          else if (part.text && !part.thought) {
            text += part.text;
            callbacks.onText?.(part.text);
          }
        }
        if (candidate?.finishReason) finish = candidate.finishReason;
        if (chunk.usageMetadata) last = chunk.usageMetadata;
      }

      const cached = last?.cachedContentTokenCount ?? 0;
      usage.input += Math.max(0, (last?.promptTokenCount ?? 0) - cached);
      usage.cacheRead += cached;
      usage.output += (last?.candidatesTokenCount ?? 0) + (last?.thoughtsTokenCount ?? 0);

      if (blocked || (finish && DECLINED.has(finish))) {
        rollback();
        return { text: '', usage, status: 'declined' };
      }
      // Never run tools from a turn that was cut off or whose call could not be parsed.
      if (finish === FinishReason.MAX_TOKENS || finish === FinishReason.MALFORMED_FUNCTION_CALL) {
        if (calls.length || finish === FinishReason.MALFORMED_FUNCTION_CALL) rollback();
        return { text, usage, status: 'cut_off' };
      }
      if (!calls.length) return { text, usage, status: 'ok' };

      // Every result goes back together, matched to its call by id.
      message = calls.map((call) => {
        const outcome = runTool(call.name ?? '', call.args);
        if (outcome.summary) callbacks.onTool?.(outcome.summary);
        const data = JSON.parse(outcome.content) as Record<string, unknown>;
        return { functionResponse: { id: call.id, name: call.name, response: outcome.isError ? { error: data } : { output: data } } };
      });
      if (text && !text.endsWith('\n')) {
        text += '\n\n';
        callbacks.onText?.('\n\n');
      }
    }
    rollback();
    return { text, usage, status: 'cut_off' };
  } catch (err) {
    rollback();
    throw err;
  }
}

export function createGeminiSession(apiKey: string, model: TutorModel, makeChat: ChatFactory = createChatFactory(apiKey, model)): TutorSession {
  const state = { chat: makeChat([]) };
  return {
    send(notes, question, callbacks, signal) {
      const parts: Part[] = [...(notes ? [{ text: `<lesson_notes>\n${notes}\n</lesson_notes>` }] : []), { text: question }];
      return runGeminiTurn(makeChat, state, parts, callbacks, signal);
    },
  };
}

/** Turn a Gemini API error into a sentence a learner can act on. */
export function explainGeminiError(err: unknown, aborted = false): string {
  if (aborted || (err instanceof Error && err.name === 'AbortError')) return 'Stopped.';
  if (err instanceof ApiError) {
    switch (err.status) {
      case 400: return 'Google did not accept the request. If you have just saved the key, check that you copied all of it; otherwise start a new chat.';
      case 401:
      case 403: return 'Google rejected the API key, or it is not allowed to use this model. Check the key in Google AI Studio, or choose another model in the tutor settings.';
      case 404: return 'That model is not available on this key. Choose another model in the tutor settings.';
      case 429: return 'You have reached the free limit for this model for now. Wait a minute and try again. If it keeps happening, the daily allowance is used up: switch to another free model in the tutor settings or come back tomorrow.';
      default: return err.status >= 500 ? 'Google\'s service is having trouble right now. Try again in a minute.' : `Something went wrong (error ${err.status}).`;
    }
  }
  if (err instanceof TypeError) return 'Could not reach Google. The tutor needs an internet connection; everything else in the app works offline.';
  return 'Something went wrong. Try again.';
}
