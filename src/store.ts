// All learner data lives on the device (localStorage). Nothing is sent anywhere.
import { useSyncExternalStore } from 'react';
import { BKT_DEFAULT, bktUpdate, guessFor } from './engine/bkt';
import { dayKey, gradeFromAnswer, review, type ReviewGrade, type StoredCard } from './engine/scheduler';
import type { Profile } from './content/syllabus';

export interface Attempt {
  t: number;
  obj: string;
  item: string;
  ok: boolean;
  ms: number;
  profile: Profile;
  mode: 'session' | 'topic' | 'challenge' | 'review' | 'mock';
}

export interface MockResult {
  t: number;
  size: number;
  score: number;
  /** Difficulty level 1-3 (older results have none and count as 1). */
  level?: number;
  /** Question ids used, so the next papers can avoid repeating them. */
  items?: string[];
  /** Set for a focus-area paper; these are kept out of the overall grade estimate. */
  focus?: string;
  minutes: number;
  bySection: Record<string, [right: number, total: number]>;
  byProfile: Record<string, [right: number, total: number]>;
  byTopic: Record<string, [right: number, total: number]>;
}

export interface AppState {
  v: 1;
  name: string;
  examDate: string | null;
  onboarded: boolean;
  mastery: Record<string, { p: number; n: number; ok: number; last: number }>;
  cards: Record<string, StoredCard>;
  attempts: Attempt[];
  itemStats: Record<string, [seen: number, right: number]>;
  days: Record<string, [questions: number, right: number, ms: number]>;
  lessons: Record<string, number>;
  mocks: MockResult[];
  p2: Record<string, { score: number; max: number; t: number }>;
  sba: Record<string, boolean>;
}

const KEY = 'chemcsec:v1';
const MAX_ATTEMPTS = 3000;

const fresh = (): AppState => ({
  v: 1, name: '', examDate: null, onboarded: false,
  mastery: {}, cards: {}, attempts: [], itemStats: {}, days: {}, lessons: {}, mocks: [], p2: {}, sba: {},
});

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v === 1) return { ...fresh(), ...parsed };
    }
  } catch {
    // Private mode or corrupted data: start clean rather than crash.
  }
  return fresh();
}

let state: AppState = typeof localStorage === 'undefined' ? fresh() : load();
const listeners = new Set<() => void>();

function commit(next: AppState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: keep working in memory.
  }
  listeners.forEach((l) => l());
}

export const getState = () => state;
export function useStore(): AppState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

export interface AnswerEvent {
  obj: string;
  item: string;
  kind: 'mcq' | 'num';
  profile: Profile;
  ok: boolean;
  ms: number;
  mode: Attempt['mode'];
}

/** One answered question: updates mastery (BKT), the review schedule (FSRS), stats and streak. */
export function recordAnswers(events: AnswerEvent[], now = Date.now()) {
  if (!events.length) return;
  const s = state;
  const mastery = { ...s.mastery };
  const cards = { ...s.cards };
  const itemStats = { ...s.itemStats };
  const days = { ...s.days };
  const attempts = [...s.attempts];
  for (const e of events) {
    const m = mastery[e.obj] ?? { p: BKT_DEFAULT.prior, n: 0, ok: 0, last: 0 };
    mastery[e.obj] = {
      p: bktUpdate(m.p, e.ok, { guess: guessFor(e.kind) }),
      n: m.n + 1,
      ok: m.ok + (e.ok ? 1 : 0),
      last: now,
    };
    cards[e.obj] = review(cards[e.obj], gradeFromAnswer(e.ok, e.ms), now);
    const st = itemStats[e.item] ?? [0, 0];
    itemStats[e.item] = [st[0] + 1, st[1] + (e.ok ? 1 : 0)];
    const d = days[dayKey(now)] ?? [0, 0, 0];
    days[dayKey(now)] = [d[0] + 1, d[1] + (e.ok ? 1 : 0), d[2] + Math.min(e.ms, 5 * 60_000)];
    attempts.push({ t: now, obj: e.obj, item: e.item, ok: e.ok, ms: e.ms, profile: e.profile, mode: e.mode });
  }
  commit({ ...s, mastery, cards, itemStats, days, attempts: attempts.slice(-MAX_ATTEMPTS) });
}

/** The learner rates their own answer to a lesson's recall question. */
export function rateLessonCheck(topic: string, grade: ReviewGrade, now = Date.now()) {
  const id = `check:${topic}`;
  commit({
    ...state,
    cards: { ...state.cards, [id]: review(state.cards[id], grade, now) },
    lessons: { ...state.lessons, [topic]: now },
  });
}

export const saveMock = (m: MockResult) => commit({ ...state, mocks: [...state.mocks, m] });
export const saveP2 = (id: string, score: number, max: number) =>
  commit({ ...state, p2: { ...state.p2, [id]: { score, max, t: Date.now() } } });
export const setProfile = (patch: Partial<Pick<AppState, 'name' | 'examDate' | 'onboarded'>>) => commit({ ...state, ...patch });
export const toggleSba = (id: string) => commit({ ...state, sba: { ...state.sba, [id]: !state.sba[id] } });

export const exportData = () => JSON.stringify(state, null, 2);
export function importData(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || parsed.v !== 1 || typeof parsed.mastery !== 'object') return false;
    commit({ ...fresh(), ...parsed });
    return true;
  } catch {
    return false;
  }
}
export const resetAll = () => commit(fresh());
