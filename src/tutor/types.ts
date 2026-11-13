// Shared by every tutor provider (Gemini, Claude): what a turn costs and what it returns.

export interface TutorModel {
  id: string;
  label: string;
  note: string;
  /** USD per million tokens; 0 on a free tier. */
  inPrice: number;
  outPrice: number;
  /** Claude only: the API itself can retry a declined request on another model. */
  serverFallback?: boolean;
}

export interface Usage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}
export const ZERO_USAGE: Usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
export const addUsage = (a: Usage, b: Usage): Usage => ({
  input: a.input + b.input, output: a.output + b.output, cacheRead: a.cacheRead + b.cacheRead, cacheWrite: a.cacheWrite + b.cacheWrite,
});

/** Approximate cost in USD: cache reads bill at a tenth of the input price, cache writes at 1.25x. */
export function costUsd(u: Usage, model: TutorModel): number {
  return ((u.input + u.cacheRead * 0.1 + u.cacheWrite * 1.25) * model.inPrice + u.output * model.outPrice) / 1_000_000;
}

export interface TurnResult {
  text: string;
  usage: Usage;
  status: 'ok' | 'declined' | 'cut_off';
}
export interface TurnCallbacks {
  onText?: (delta: string) => void;
  onTool?: (summary: string) => void;
}

/** One conversation with one provider. It remembers the exchange between calls. */
export interface TutorSession {
  send(notes: string, question: string, callbacks?: TurnCallbacks, signal?: AbortSignal): Promise<TurnResult>;
}

/** How many model requests one learner question may use (each tool round is one request). */
export const MAX_STEPS = 6;
