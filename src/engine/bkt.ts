// Bayesian Knowledge Tracing: a two-state model of "does the learner know this objective?"
// Parameters follow the research spec and are deliberately explainable.
export interface BktParams {
  prior: number;
  transit: number;
  slip: number;
  guess: number;
}

export const BKT_DEFAULT: BktParams = { prior: 0.15, transit: 0.15, slip: 0.15, guess: 0.2 };

/** A typed answer is far harder to guess than a four-option multiple choice. */
export function guessFor(kind: 'mcq' | 'num' | 'self'): number {
  return kind === 'mcq' ? 0.25 : kind === 'num' ? 0.05 : 0.15;
}

export function bktUpdate(p: number, correct: boolean, params: Partial<BktParams> = {}): number {
  const { transit, slip, guess } = { ...BKT_DEFAULT, ...params };
  const posterior = correct
    ? (p * (1 - slip)) / (p * (1 - slip) + (1 - p) * guess)
    : (p * slip) / (p * slip + (1 - p) * (1 - guess));
  const next = posterior + (1 - posterior) * transit;
  return Math.min(0.995, Math.max(0.01, next));
}

export type Band = 'new' | 'learning' | 'nearly' | 'mastered';

export function band(p: number, evidence: number): Band {
  if (evidence === 0) return 'new';
  if (p >= 0.85) return 'mastered';
  if (p >= 0.6) return 'nearly';
  return 'learning';
}

export const BAND_LABEL: Record<Band, string> = {
  new: 'Not started',
  learning: 'Learning',
  nearly: 'Nearly there',
  mastered: 'Mastered',
};

/** Objectives unlock when what they build on reaches this mastery. */
export const READY_THRESHOLD = 0.6;
