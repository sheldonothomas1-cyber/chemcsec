// Builds what the learner actually sees: study sessions and blueprint-matched mock papers.
import { fmt, GENERATORS, GENERATORS_BY_OBJ, mulberry32, type Generator, type Rng } from '../content/generators';
import { ITEMS, ITEMS_BY_OBJ, type McqItem } from '../content/items';
import { ALL_OBJECTIVES, TOPICS, TOPIC_BY_ID, type Profile } from '../content/syllabus';
import type { AppState } from '../store';
import { dueObjectives, isReady, objN, objP, topicMastery } from './select';

export interface ServedQ {
  key: string;
  itemId: string;
  obj: string;
  profile: Profile;
  kind: 'mcq' | 'num';
  stem: string;
  options?: string[];
  correctIndex?: number;
  answer?: number;
  unit?: string;
  exact?: boolean;
  signed?: boolean;
  why: string;
  steps?: string[];
  tag?: 'review' | 'new' | 'challenge';
}

let serial = 0;
const newKey = () => `q${Date.now().toString(36)}-${serial++}`;

function shuffle<T>(xs: T[], rng: Rng): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function serveItem(item: McqItem, rng: Rng): ServedQ {
  const order = shuffle([0, 1, 2, 3], rng);
  return {
    key: newKey(), itemId: item.id, obj: item.obj, profile: item.profile, kind: 'mcq',
    stem: item.stem, options: order.map((i) => item.options[i]), correctIndex: order.indexOf(0), why: item.why,
  };
}

export function serveGenerator(g: Generator, rng: Rng, asMcq: boolean): ServedQ {
  const inst = g.make(rng);
  const base = {
    key: newKey(), itemId: g.id, obj: g.obj, profile: g.profile, stem: inst.stem,
    why: inst.steps[inst.steps.length - 1], steps: inst.steps,
  };
  if (asMcq) {
    const label = (x: number) => `${fmt(x, inst.signed)}${inst.unit ? ' ' + inst.unit : ''}`;
    const order = shuffle([0, 1, 2, 3], rng);
    const all = [inst.answer, ...inst.distractors].map(label);
    return { ...base, kind: 'mcq', options: order.map((i) => all[i]), correctIndex: order.indexOf(0) };
  }
  return { ...base, kind: 'num', answer: inst.answer, unit: inst.unit, exact: inst.exact, signed: inst.signed };
}

/** Is a typed answer right? Whole-number answers must match; others get a 2% tolerance. */
export function checkTyped(q: ServedQ, raw: string): boolean | null {
  const cleaned = raw.replace(/,/g, '').replace(/[−–]/g, '-').trim();
  const m = cleaned.match(/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
  if (!m || q.answer === undefined) return null;
  const x = parseFloat(m[0]);
  if (q.exact) return x === q.answer;
  return Math.abs(x - q.answer) <= Math.max(Math.abs(q.answer) * 0.02, 1e-9);
}

/** Choose a question for an objective, preferring ones not yet seen, then ones answered badly. */
function pickFor(s: AppState, obj: string, rng: Rng, used: Set<string>, asMcq = false): ServedQ | null {
  type Cand = { score: number; make: () => ServedQ; id: string };
  const cands: Cand[] = [];
  for (const item of ITEMS_BY_OBJ[obj] ?? []) {
    if (used.has(item.id)) continue;
    const [seen, right] = s.itemStats[item.id] ?? [0, 0];
    const score = seen === 0 ? 0 : right / seen < 0.6 ? 1 : 3;
    cands.push({ score: score + rng(), id: item.id, make: () => serveItem(item, rng) });
  }
  for (const g of GENERATORS_BY_OBJ[obj] ?? []) {
    const reuse = used.has(g.id) ? 2 : 0;
    cands.push({ score: 1.2 + reuse + rng(), id: g.id, make: () => serveGenerator(g, rng, asMcq) });
  }
  if (!cands.length) return null;
  const best = cands.sort((a, b) => a.score - b.score)[0];
  used.add(best.id);
  return best.make();
}

const seedNow = () => (Date.now() ^ (Math.random() * 2 ** 31)) >>> 0;

/** Objectives to learn next: shaky ones first, then untouched ones from ready topics in syllabus order. */
function learningQueue(s: AppState): string[] {
  const ready = TOPICS.filter((t) => isReady(s, t));
  const pool = (ready.length ? ready : TOPICS).filter((t) => topicMastery(s, t) < 0.85);
  const shaky = pool.flatMap((t) => t.objectives).filter((o) => objN(s, o.id) > 0 && objP(s, o.id) < 0.6)
    .sort((a, b) => objP(s, a.id) - objP(s, b.id)).map((o) => o.id);
  const untouched = pool.flatMap((t) => t.objectives).filter((o) => objN(s, o.id) === 0).map((o) => o.id);
  const growing = pool.flatMap((t) => t.objectives).filter((o) => objN(s, o.id) > 0 && objP(s, o.id) >= 0.6 && objP(s, o.id) < 0.85).map((o) => o.id);
  return [...shaky, ...untouched.slice(0, 6), ...growing, ...untouched.slice(6)];
}

/** The daily session: about 60% due reviews, 30% new or weak objectives, 10% mixed challenge. */
export function buildSmartSession(s: AppState, n = 10): ServedQ[] {
  const rng = mulberry32(seedNow());
  const used = new Set<string>();
  const out: ServedQ[] = [];
  const add = (obj: string, tag: ServedQ['tag']) => {
    const q = pickFor(s, obj, rng, used);
    if (q) out.push({ ...q, tag });
    return !!q;
  };

  const due = dueObjectives(s);
  for (const obj of due.slice(0, Math.round(n * 0.6))) add(obj, 'review');

  const challengeSlots = Math.max(1, Math.round(n * 0.1));
  const queue = learningQueue(s).filter((o) => !due.slice(0, Math.round(n * 0.6)).includes(o));
  let i = 0;
  while (out.length < n - challengeSlots && queue.length) {
    add(queue[i % queue.length], 'new');
    i++;
    if (i > queue.length * 3) break;
  }

  const seenTopics = new Set(Object.keys(s.mastery).map((o) => o.split('.')[0]));
  const gens = GENERATORS.filter((g) => seenTopics.has(g.obj.split('.')[0]));
  const challengePool = shuffle(gens.length ? gens : GENERATORS.filter((g) => g.diff === 1), rng);
  for (let k = 0; out.length < n && k < challengePool.length; k++) {
    out.push({ ...serveGenerator(challengePool[k], rng, false), tag: 'challenge' });
  }
  // Top up if anything was short.
  for (const o of shuffle(ALL_OBJECTIVES.map((x) => x.id), rng)) {
    if (out.length >= n) break;
    add(o, 'new');
  }
  return shuffle(out, rng).slice(0, n);
}

export function buildTopicSession(s: AppState, topicId: string, n = 9): ServedQ[] {
  const rng = mulberry32(seedNow());
  const used = new Set<string>();
  const objs = TOPIC_BY_ID[topicId].objectives.map((o) => o.id);
  const out: ServedQ[] = [];
  for (let i = 0; out.length < n && i < n * 3; i++) {
    const q = pickFor(s, objs[i % objs.length], rng, used);
    if (q) out.push(q);
  }
  return out;
}

/** Mixed calculation practice: different skills back to back, typed answers only. */
export function buildChallenge(n = 8): ServedQ[] {
  const rng = mulberry32(seedNow());
  const order = shuffle(GENERATORS, rng);
  return Array.from({ length: n }, (_, i) => ({ ...serveGenerator(order[i % order.length], rng, false), tag: 'challenge' as const }));
}

export function buildReview(s: AppState, max = 15): ServedQ[] {
  const rng = mulberry32(seedNow());
  const used = new Set<string>();
  return dueObjectives(s).slice(0, max).map((obj) => pickFor(s, obj, rng, used)).filter((q): q is ServedQ => !!q)
    .map((q) => ({ ...q, tag: 'review' as const }));
}

/** How many of a `size`-item paper each topic gets, scaled from the 60-item blueprint. */
export function blueprintCounts(size: number): Record<string, number> {
  const exact = TOPICS.map((t) => ({ id: t.id, x: (t.weight * size) / 60 }));
  const counts: Record<string, number> = Object.fromEntries(exact.map((e) => [e.id, Math.floor(e.x)]));
  let left = size - Object.values(counts).reduce((a, b) => a + b, 0);
  for (const e of [...exact].sort((a, b) => (b.x % 1) - (a.x % 1))) {
    if (left <= 0) break;
    counts[e.id]++;
    left--;
  }
  return counts;
}

/** A Paper 01-style mock: multiple choice only, topic counts fixed by the blueprint. */
export function buildMock(size: number, seed = seedNow()): ServedQ[] {
  const rng = mulberry32(seed);
  const counts = blueprintCounts(size);
  const out: ServedQ[] = [];
  for (const t of TOPICS) {
    const authored = shuffle(ITEMS.filter((i) => i.obj.startsWith(t.id + '.')), rng).map((i) => () => serveItem(i, rng));
    const generated = shuffle(GENERATORS.filter((g) => g.obj.startsWith(t.id + '.')), rng).map((g) => () => serveGenerator(g, rng, true));
    // About a third of a calculation-heavy topic's questions use fresh numbers.
    const nGen = Math.min(generated.length, Math.floor(counts[t.id] / 3));
    const makers = [...generated.slice(0, nGen), ...authored].slice(0, counts[t.id]);
    out.push(...shuffle(makers, rng).map((make) => make()));
  }
  return out;
}

export const MOCK_MINUTES = (size: number) => Math.round((size * 75) / 60);
