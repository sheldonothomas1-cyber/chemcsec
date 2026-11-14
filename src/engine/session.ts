// Builds what the learner actually sees: study sessions and blueprint-matched mock papers.
// Questions come from three sources: the written bank (items), calculation generators
// (fresh numbers each time) and question templates (fresh wording and data each time).
import { fmt, GENERATOR_BY_ID, GENERATORS, GENERATORS_BY_OBJ, mulberry32, type Generator, type Rng } from '../content/generators';
import { ITEMS, ITEMS_BY_OBJ, type McqItem } from '../content/items';
import { ALL_OBJECTIVES, TOPICS, TOPIC_BY_ID, type Profile } from '../content/syllabus';
import { FOCUS_BY_ID, FOCUS_OBJECTIVES } from '../content/focus';
import { TEMPLATE_BY_ID, TEMPLATES, TEMPLATES_BY_OBJ, type Template } from '../content/templates';
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
  tolerance?: number;
  why: string;
  steps?: string[];
  tag?: 'review' | 'new' | 'challenge';
}

let serial = 0;
const newKey = () => `q${Date.now().toString(36)}-${serial++}`;
const ITEM_BY_ID: Record<string, McqItem> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

function shuffle<T>(xs: T[], rng: Rng): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function serveOptions(id: string, obj: string, profile: Profile, stem: string, options: string[], why: string, rng: Rng, steps?: string[]): ServedQ {
  const order = shuffle([0, 1, 2, 3], rng);
  return { key: newKey(), itemId: id, obj, profile, kind: 'mcq', stem, options: order.map((i) => options[i]), correctIndex: order.indexOf(0), why, steps };
}

export const serveItem = (item: McqItem, rng: Rng): ServedQ => serveOptions(item.id, item.obj, item.profile, item.stem, item.options, item.why, rng);

export function serveTemplate(t: Template, rng: Rng): ServedQ {
  const inst = t.make(rng);
  return serveOptions(t.id, t.obj, t.profile, inst.stem, inst.options, inst.why, rng);
}

export function serveGenerator(g: Generator, rng: Rng, asMcq: boolean): ServedQ {
  const inst = g.make(rng);
  const why = inst.steps[inst.steps.length - 1];
  if (asMcq) {
    const label = (x: number) => `${fmt(x, inst.signed)}${inst.unit ? ' ' + inst.unit : ''}`;
    return serveOptions(g.id, g.obj, g.profile, inst.stem, [inst.answer, ...inst.distractors].map(label), why, rng, inst.steps);
  }
  return { key: newKey(), itemId: g.id, obj: g.obj, profile: g.profile, kind: 'num', stem: inst.stem, why, steps: inst.steps, answer: inst.answer, unit: inst.unit, exact: inst.exact, signed: inst.signed, tolerance: inst.tolerance };
}

/** Is a typed answer right? Whole-number answers must match; others get a 2% tolerance. */
export function checkTyped(q: ServedQ, raw: string): boolean | null {
  const cleaned = raw.replace(/,/g, '').replace(/[−–]/g, '-').trim();
  const m = cleaned.match(/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
  if (!m || q.answer === undefined) return null;
  const x = parseFloat(m[0]);
  if (q.exact) return x === q.answer;
  if (q.tolerance !== undefined) return Math.abs(x - q.answer) <= q.tolerance;
  return Math.abs(x - q.answer) <= Math.max(Math.abs(q.answer) * 0.02, 1e-9);
}

/**
 * Choose a question for an objective. Unseen questions come first, then ones answered badly,
 * and the difficulty follows the learner: easier while the objective is new, harder once it is secure.
 */
function pickFor(s: AppState, obj: string, rng: Rng, used: Set<string>, asMcq = false): ServedQ | null {
  const p = objP(s, obj);
  const target = p < 0.4 ? 1 : p < 0.75 ? 2 : 3;
  const fit = (diff: number) => Math.abs(diff - target) * 0.9;
  type Cand = { score: number; make: () => ServedQ; id: string };
  const cands: Cand[] = [];
  for (const item of ITEMS_BY_OBJ[obj] ?? []) {
    if (used.has(item.id)) continue;
    const [seen, right] = s.itemStats[item.id] ?? [0, 0];
    const base = seen === 0 ? 0 : right / seen < 0.6 ? 1 : 3;
    cands.push({ score: base + fit(item.diff) + rng(), id: item.id, make: () => serveItem(item, rng) });
  }
  for (const t of TEMPLATES_BY_OBJ[obj] ?? []) {
    cands.push({ score: 1 + (used.has(t.id) ? 2 : 0) + fit(t.diff) + rng(), id: t.id, make: () => serveTemplate(t, rng) });
  }
  for (const g of GENERATORS_BY_OBJ[obj] ?? []) {
    cands.push({ score: 1.2 + (used.has(g.id) ? 2 : 0) + fit(g.diff) + rng(), id: g.id, make: () => serveGenerator(g, rng, asMcq) });
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
  // Within the untouched objectives, the focus areas come first.
  const untouched = pool.flatMap((t) => t.objectives).filter((o) => objN(s, o.id) === 0).map((o) => o.id)
    .sort((a, b) => Number(FOCUS_OBJECTIVES.has(b)) - Number(FOCUS_OBJECTIVES.has(a)));
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

/** Questions whose most recent answer was wrong, newest first. */
export function mistakeIds(s: AppState): string[] {
  const latest = new Map<string, boolean>();
  for (let i = s.attempts.length - 1; i >= 0; i--) {
    const a = s.attempts[i];
    if (!latest.has(a.item)) latest.set(a.item, a.ok);
  }
  return [...latest].filter(([, ok]) => !ok).map(([id]) => id);
}

/** A session made only of questions the learner last got wrong (or fresh versions of them). */
export function buildMistakes(s: AppState, n = 10): ServedQ[] {
  const rng = mulberry32(seedNow());
  const out: ServedQ[] = [];
  for (const id of mistakeIds(s)) {
    if (out.length >= n) break;
    if (ITEM_BY_ID[id]) out.push(serveItem(ITEM_BY_ID[id], rng));
    else if (TEMPLATE_BY_ID[id]) out.push(serveTemplate(TEMPLATE_BY_ID[id], rng));
    else if (GENERATOR_BY_ID[id]) out.push(serveGenerator(GENERATOR_BY_ID[id], rng, false));
  }
  return out;
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

export type Level = 1 | 2 | 3;
export const LEVELS: Record<Level, { name: string; note: string }> = {
  1: { name: 'Standard', note: 'Mostly recall and one-step questions, like the easier half of Paper 01.' },
  2: { name: 'Harder', note: 'More application and calculation questions.' },
  3: { name: 'Hardest', note: 'Mostly multi-step calculations and questions that need you to work something out.' },
};
/** How strongly each test level favours questions of difficulty 1, 2 and 3. */
const LEVEL_WEIGHT: Record<Level, [number, number, number]> = { 1: [3, 2, 0.4], 2: [1, 3, 2], 3: [0.3, 2, 4.5] };

/** The level to suggest next: move up after 70% or better, down after less than 40%. */
export function recommendedLevel(s: AppState, focusId?: string): Level {
  const last = (s.mocks ?? []).filter((m) => (m.focus ?? undefined) === focusId).pop();
  if (!last) return 1;
  const level = (last.level ?? 1) as Level;
  const pct = last.score / last.size;
  return (pct >= 0.7 ? Math.min(3, level + 1) : pct < 0.4 ? Math.max(1, level - 1) : level) as Level;
}

/**
 * A Paper 01-style mock: multiple choice only, topic counts fixed by the blueprint.
 * Every paper is different: questions are drawn at random with weights that follow the level,
 * templates and generators write new versions each time, and `avoid` (questions from the
 * learner's recent papers) are made much less likely to appear again.
 */
export function buildMock(size: number, level: Level = 1, seed = seedNow(), avoid: ReadonlySet<string> = new Set()): ServedQ[] {
  const rng = mulberry32(seed);
  const counts = blueprintCounts(size);
  const w = LEVEL_WEIGHT[level];
  const out: ServedQ[] = [];
  for (const t of TOPICS) {
    const inTopic = (obj: string) => obj.startsWith(t.id + '.');
    type Entry = { weight: number; make: () => ServedQ };
    const pool: Entry[] = [
      ...ITEMS.filter((i) => inTopic(i.obj)).map((i) => ({ weight: w[i.diff - 1] * (avoid.has(i.id) ? 0.15 : 1), make: () => serveItem(i, rng) })),
      // A template or generator may appear twice in one paper, since each use is a different question.
      ...TEMPLATES.filter((x) => inTopic(x.obj)).flatMap((x) => [0, 1].map((k) => ({ weight: w[x.diff - 1] * (k ? 0.5 : 1), make: () => serveTemplate(x, rng) }))),
      ...GENERATORS.filter((g) => inTopic(g.obj)).flatMap((g) => [0, 1].map((k) => ({ weight: w[g.diff - 1] * (k ? 0.4 : 0.9), make: () => serveGenerator(g, rng, true) }))),
    ];
    // Weighted sampling without replacement: the largest keys win.
    const chosen = pool.map((e) => ({ e, key: Math.pow(rng(), 1 / e.weight) })).sort((a, b) => b.key - a.key).slice(0, counts[t.id]);
    out.push(...shuffle(chosen.map((c) => c.e), rng).map((e) => e.make()));
  }
  return out;
}

export const MOCK_MINUTES = (size: number) => Math.round((size * 75) / 60);

// ---------------------------------------------------------------- focus areas
/**
 * A drill on one focus area: the weakest objectives get the most questions, and the
 * difficulty follows the learner's mastery (or is pushed up when `harder` is set).
 */
export function buildFocusSession(s: AppState, focusId: string, n = 12, harder = false): ServedQ[] {
  const area = FOCUS_BY_ID[focusId];
  const rng = mulberry32(seedNow());
  const used = new Set<string>();
  // A copy of the learner's state with mastery nudged up, so pickFor chooses harder questions.
  const view: AppState = harder
    ? { ...s, mastery: Object.fromEntries(area.objectives.map((o) => [o, { p: 0.9, n: 1, ok: 1, last: 0 }])) }
    : s;
  const order = [...area.objectives].sort((a, b) => objP(s, a) - objP(s, b));
  // Weakest objectives appear twice in the rotation.
  const rotation = [...order, ...order.slice(0, Math.ceil(order.length / 2))];
  const out: ServedQ[] = [];
  for (let i = 0; out.length < n && i < n * 4; i++) {
    const q = pickFor(view, rotation[i % rotation.length], rng, used);
    if (q) out.push(q);
  }
  return shuffle(out, rng);
}

/** A timed multiple-choice paper drawn only from one focus area, spread across its objectives. */
export function buildFocusMock(focusId: string, size: number, level: Level = 1, seed = seedNow()): ServedQ[] {
  const area = FOCUS_BY_ID[focusId];
  const rng = mulberry32(seed);
  const w = LEVEL_WEIGHT[level];
  const per = Math.ceil(size / area.objectives.length);
  const out: ServedQ[] = [];
  for (const obj of area.objectives) {
    type Entry = { weight: number; make: () => ServedQ };
    const pool: Entry[] = [
      ...(ITEMS_BY_OBJ[obj] ?? []).map((i) => ({ weight: w[i.diff - 1], make: () => serveItem(i, rng) })),
      ...(TEMPLATES_BY_OBJ[obj] ?? []).flatMap((x) => [0, 1, 2].map(() => ({ weight: w[x.diff - 1] * 0.7, make: () => serveTemplate(x, rng) }))),
      ...(GENERATORS_BY_OBJ[obj] ?? []).flatMap((g) => [0, 1, 2].map(() => ({ weight: w[g.diff - 1] * 0.7, make: () => serveGenerator(g, rng, true) }))),
    ];
    const chosen = pool.map((e) => ({ e, key: Math.pow(rng(), 1 / e.weight) })).sort((a, b) => b.key - a.key).slice(0, per);
    out.push(...chosen.map((c) => c.e.make()));
  }
  return shuffle(out, rng).slice(0, size);
}
