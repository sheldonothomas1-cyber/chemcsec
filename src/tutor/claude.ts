// The tutor's connection to Claude. The learner supplies their own API key, which is kept
// only in this browser and sent only to Anthropic. Requests are streamed, and the model
// calls the app's chemistry tools in a loop until it has an answer.
import Anthropic from '@anthropic-ai/sdk';
import { TUTOR_SYSTEM } from './prompt';
import { runTool, TUTOR_TOOLS } from './tools';
import { costUsd, MAX_STEPS, ZERO_USAGE, type TurnCallbacks, type TurnResult, type TutorModel, type TutorSession, type Usage } from './types';

export { costUsd };

type Message = Anthropic.Beta.BetaMessage;
type MessageParam = Anthropic.Beta.BetaMessageParam;
type StreamParams = Parameters<Anthropic['beta']['messages']['stream']>[0];

// Prices are Anthropic's published API rates as of November 2026.
export const MODELS: TutorModel[] = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5', note: 'Most capable. Roughly 3 to 6 US cents a question.', inPrice: 4, outPrice: 20, serverFallback: true },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', note: 'Fast and strong. Roughly 2 to 3 US cents a question.', inPrice: 2, outPrice: 10, serverFallback: true },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5', note: 'Cheapest by far. Well under 1 US cent a question.', inPrice: 0.1, outPrice: 0.5, serverFallback: false },
];
export const modelById = (id: string): TutorModel => MODELS.find((m) => m.id === id) ?? MODELS[0];

// ---------- the loop ----------
export interface StreamLike {
  on(event: 'text', listener: (delta: string) => void): unknown;
  finalMessage(): Promise<Message>;
  abort(): void;
}
export interface TutorClient {
  stream(params: StreamParams, options?: { signal?: AbortSignal }): StreamLike;
}

/** A real client. The SDK must be told it is running in a browser with a user-supplied key. */
export function createClient(apiKey: string): TutorClient {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 });
  return { stream: (params, options) => client.beta.messages.stream(params, options) };
}

const MAX_TOKENS = 16000;

export function buildParams(model: TutorModel, messages: MessageParam[]): StreamParams {
  return {
    model: model.id,
    max_tokens: MAX_TOKENS,
    // Thinking is adaptive by default on these models; effort is stated because defaults differ.
    output_config: { effort: 'medium' },
    // The system prompt and tool list never change, so they are cached; the top-level
    // marker also caches the growing conversation.
    system: [{ type: 'text', text: TUTOR_SYSTEM, cache_control: { type: 'ephemeral' } }],
    cache_control: { type: 'ephemeral' },
    tools: TUTOR_TOOLS,
    messages,
    ...(model.serverFallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
  };
}

/**
 * Send one learner turn. `history` is the conversation as the API saw it and is only ever
 * appended to (assistant content, including thinking blocks, is passed back unchanged).
 * If the turn fails or is declined, everything this turn added is removed again.
 */
export async function runTutorTurn(
  client: TutorClient,
  model: TutorModel,
  history: MessageParam[],
  userContent: string | Anthropic.Beta.BetaContentBlockParam[],
  callbacks: TurnCallbacks = {},
  signal?: AbortSignal,
): Promise<TurnResult> {
  const start = history.length;
  history.push({ role: 'user', content: userContent });
  const usage: Usage = { ...ZERO_USAGE };
  let text = '';
  let jsonRetries = 0;

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const stream = client.stream(buildParams(model, history), { signal });
      const before = text;
      stream.on('text', (delta) => {
        text += delta;
        callbacks.onText?.(delta);
      });

      let message: Message;
      try {
        message = await stream.finalMessage();
        jsonRetries = 0;
      } catch (err) {
        // With streamed tool inputs, unparseable JSON rejects here. Retry that case only;
        // API errors (bad key, rate limit, network) go to the caller.
        if (err instanceof Anthropic.APIError || signal?.aborted || jsonRetries++ >= 2) throw err;
        text = before;
        step--;
        continue;
      }

      usage.input += message.usage.input_tokens;
      usage.output += message.usage.output_tokens;
      usage.cacheRead += message.usage.cache_read_input_tokens ?? 0;
      usage.cacheWrite += message.usage.cache_creation_input_tokens ?? 0;

      // A refusal can cut a tool call off mid-input, so nothing from that turn is run.
      if (message.stop_reason === 'refusal') {
        history.length = start;
        return { text: '', usage, status: 'declined' };
      }

      const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use');

      if (message.stop_reason === 'max_tokens') {
        // Truncated tool input usually still parses, so never run tools from a cut-off turn.
        if (toolUses.length) {
          history.length = start;
          return { text, usage, status: 'cut_off' };
        }
        history.push({ role: 'assistant', content: message.content });
        return { text, usage, status: 'cut_off' };
      }

      history.push({ role: 'assistant', content: message.content });
      if (message.stop_reason === 'pause_turn') continue;
      if (!toolUses.length) return { text, usage, status: 'ok' };

      // All results go back together in one user message.
      const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((call) => {
        const outcome = runTool(call.name, call.input);
        if (outcome.summary) callbacks.onTool?.(outcome.summary);
        return { type: 'tool_result', tool_use_id: call.id, content: outcome.content, is_error: outcome.isError };
      });
      history.push({ role: 'user', content: results });
      if (text && !text.endsWith('\n')) {
        text += '\n\n';
        callbacks.onText?.('\n\n');
      }
    }
    return { text, usage, status: 'cut_off' };
  } catch (err) {
    history.length = start;
    throw err;
  }
}

/** Turn an SDK error into a sentence a learner can act on. */
/** A conversation with Claude: lesson notes and the question go in as separate text blocks. */
export function createClaudeSession(apiKey: string, model: TutorModel, client: TutorClient = createClient(apiKey)): TutorSession {
  const history: MessageParam[] = [];
  return {
    send(notes, question, callbacks, signal) {
      const content: Anthropic.Beta.BetaContentBlockParam[] = [
        ...(notes ? [{ type: 'text' as const, text: `<lesson_notes>
${notes}
</lesson_notes>` }] : []),
        { type: 'text' as const, text: question },
      ];
      return runTutorTurn(client, model, history, content, callbacks, signal);
    },
  };
}

export function explainClaudeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return 'Anthropic rejected the API key. Check that you copied the whole key, or create a new one, then save it again below.';
  if (err instanceof Anthropic.PermissionDeniedError) return 'This API key is not allowed to use that model. Choose a different model in the tutor settings, or check the key in the Anthropic Console.';
  if (err instanceof Anthropic.NotFoundError) return 'That model is not available on this key. Choose a different model in the tutor settings.';
  if (err instanceof Anthropic.RateLimitError) return 'Too many requests for now. Wait a minute and send your question again.';
  // Includes "credit balance is too low": Anthropic's own wording is the clearest explanation.
  if (err instanceof Anthropic.BadRequestError) return `Anthropic did not accept the request: ${err.message}`;
  if (err instanceof Anthropic.APIUserAbortError) return 'Stopped.';
  if (err instanceof Anthropic.APIConnectionError) return 'Could not reach Anthropic. The tutor needs an internet connection; everything else in the app works offline.';
  if (err instanceof Anthropic.APIError) return err.status && err.status >= 500 ? 'Anthropic is having trouble right now. Try again in a minute.' : `Something went wrong (${err.message}).`;
  return 'Something went wrong. Try again.';
}
