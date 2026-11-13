import { createEmptyCard, fsrs, Rating, type Card, type Grade, type State } from 'ts-fsrs';

// FSRS spaced-review scheduling with the research spec's 0.90 target retention.
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false });

export interface StoredCard {
  due: number;
  stability: number;
  difficulty: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: number;
}

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';
const GRADE: Record<ReviewGrade, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

const toCard = (s: StoredCard): Card => ({
  ...s,
  state: s.state as State,
  due: new Date(s.due),
  last_review: s.last_review ? new Date(s.last_review) : undefined,
});

const toStored = (c: Card): StoredCard => ({
  due: c.due.getTime(),
  stability: c.stability,
  difficulty: c.difficulty,
  scheduled_days: c.scheduled_days,
  learning_steps: c.learning_steps,
  reps: c.reps,
  lapses: c.lapses,
  state: c.state,
  last_review: c.last_review ? c.last_review.getTime() : undefined,
});

export function review(card: StoredCard | undefined, grade: ReviewGrade, now = Date.now()): StoredCard {
  const current = card ? toCard(card) : createEmptyCard(new Date(now));
  return toStored(scheduler.next(current, new Date(now), GRADE[grade]).card);
}

/** Turn an answered question into a review grade: slow-but-right counts as "hard". */
export function gradeFromAnswer(correct: boolean, ms: number): ReviewGrade {
  if (!correct) return 'again';
  return ms > 90_000 ? 'hard' : 'good';
}

export const isDue = (card: StoredCard, now = Date.now()) => card.due <= now;

export function dayKey(t = Date.now()): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
