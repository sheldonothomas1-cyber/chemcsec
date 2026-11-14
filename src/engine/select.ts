// Read-only views over the learner's data: mastery per topic, what is due, what to do next.
import { ALL_OBJECTIVES, TOPICS, TOPIC_BY_ID, topicOf, type Profile, type Topic } from '../content/syllabus';
import type { AppState } from '../store';
import { band, READY_THRESHOLD, type Band } from './bkt';
import { dayKey } from './scheduler';

export const objP = (s: AppState, obj: string): number => (s.mastery[obj]?.n ? s.mastery[obj].p : 0);
export const objN = (s: AppState, obj: string): number => s.mastery[obj]?.n ?? 0;

/** Topic mastery 0-1: the mean over its objectives, counting untouched objectives as 0. */
export function topicMastery(s: AppState, topic: Topic): number {
  return topic.objectives.reduce((sum, o) => sum + objP(s, o.id), 0) / topic.objectives.length;
}
export const topicEvidence = (s: AppState, topic: Topic): number => topic.objectives.reduce((sum, o) => sum + objN(s, o.id), 0);
export const topicBand = (s: AppState, topic: Topic): Band => band(topicMastery(s, topic), topicEvidence(s, topic));

/** A topic is ready when everything it builds on has reached the readiness threshold. */
export function isReady(s: AppState, topic: Topic): boolean {
  return topic.prereqs.every((id) => topicMastery(s, TOPIC_BY_ID[id]) >= READY_THRESHOLD);
}
export const blockers = (s: AppState, topic: Topic): Topic[] =>
  topic.prereqs.map((id) => TOPIC_BY_ID[id]).filter((p) => topicMastery(s, p) < READY_THRESHOLD);

export function overallMastery(s: AppState): number {
  return TOPICS.reduce((sum, t) => sum + topicMastery(s, t) * t.weight, 0) / 60;
}

export function dueObjectives(s: AppState, now = Date.now()): string[] {
  return Object.entries(s.cards)
    .filter(([id, c]) => !id.startsWith('check:') && c.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
}
export function dueChecks(s: AppState, now = Date.now()): string[] {
  return Object.entries(s.cards)
    .filter(([id, c]) => id.startsWith('check:') && c.due <= now)
    .map(([id]) => id.slice(6));
}

/** Reviews falling due on each of the next `days` days (index 0 = today, including overdue). */
export function dueByDay(s: AppState, days = 7, now = Date.now()): number[] {
  const out = Array<number>(days).fill(0);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  for (const c of Object.values(s.cards)) {
    const idx = Math.max(0, Math.floor((c.due - start.getTime()) / 86_400_000));
    if (idx < days) out[idx]++;
  }
  return out;
}

export function streak(s: AppState, now = Date.now()): number {
  let n = 0;
  const d = new Date(now);
  if (!s.days[dayKey(d.getTime())]) d.setDate(d.getDate() - 1); // today not studied yet: streak still alive
  while (s.days[dayKey(d.getTime())]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function todayStats(s: AppState, now = Date.now()) {
  const [questions, right, ms] = s.days[dayKey(now)] ?? [0, 0, 0];
  return { questions, right, minutes: Math.round(ms / 60_000) };
}

/** Recent accuracy on each exam profile (KC, UK, XS), or null until there is enough evidence. */
export function profileAccuracy(s: AppState): Record<Profile, { pct: number | null; n: number }> {
  const out = {} as Record<Profile, { pct: number | null; n: number }>;
  for (const p of ['KC', 'UK', 'XS'] as Profile[]) {
    const recent = s.attempts.filter((a) => a.profile === p).slice(-60);
    out[p] = { n: recent.length, pct: recent.length >= 5 ? recent.filter((a) => a.ok).length / recent.length : null };
  }
  return out;
}

export interface Weakness {
  obj: string;
  text: string;
  topic: Topic;
  p: number;
  risk: number;
  rootCause?: Topic;
}

/** Objectives ranked by marks at stake: mastery deficit × the topic's share of the paper. */
export function weaknesses(s: AppState, limit = 8): Weakness[] {
  return ALL_OBJECTIVES.filter((o) => objN(s, o.id) > 0 && objP(s, o.id) < 0.85)
    .map((o) => {
      const topic = topicOf(o.id);
      const p = objP(s, o.id);
      return {
        obj: o.id, text: o.text, topic, p,
        risk: (1 - p) * (topic.weight / topic.objectives.length),
        rootCause: blockers(s, topic).sort((a, b) => topicMastery(s, a) - topicMastery(s, b))[0],
      };
    })
    .sort((a, b) => b.risk - a.risk)
    .slice(0, limit);
}

/** The next topic to study: an unfinished, ready topic, in syllabus order. */
export function nextTopic(s: AppState): Topic {
  const open = TOPICS.filter((t) => topicMastery(s, t) < 0.85);
  return open.find((t) => isReady(s, t) && topicEvidence(s, t) > 0 && topicMastery(s, t) < READY_THRESHOLD)
    ?? open.find((t) => isReady(s, t))
    ?? open[0]
    ?? TOPICS[0];
}

export interface GradeEstimate {
  grade: string;
  range: string;
  pct: number;
}
const GRADES = ['I', 'II', 'III', 'IV', 'V', 'VI'];

/**
 * A rough grade band from the last mocks and overall mastery. CXC does not publish fixed
 * grade boundaries, so this is an estimate and is always shown with a range.
 */
export function predictedGrade(s: AppState): GradeEstimate | null {
  const full = s.mocks.filter((m) => !m.focus);
  if (full.length < 2) return null;
  const last = full.slice(-2);
  const mockPct = last.reduce((sum, m) => sum + m.score / m.size, 0) / last.length;
  const pct = 0.65 * mockPct + 0.35 * overallMastery(s);
  const cuts = [0.75, 0.6, 0.5, 0.4, 0.3];
  let i = cuts.findIndex((c) => pct >= c);
  if (i === -1) i = 5;
  const lo = GRADES[Math.min(5, i + 1)];
  const hi = GRADES[Math.max(0, i - 1)];
  return { grade: GRADES[i], range: hi === lo ? hi : `${hi} to ${lo}`, pct };
}

export function daysToExam(s: AppState, now = Date.now()): number | null {
  if (!s.examDate) return null;
  const d = new Date(s.examDate + 'T00:00:00').getTime();
  return Math.ceil((d - now) / 86_400_000);
}
