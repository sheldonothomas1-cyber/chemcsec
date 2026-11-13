// Keyword search over the app's own lessons. Used by the offline "Stuck? Ask" page and
// to ground the AI tutor: each question is sent with the most relevant lesson notes.
import { LESSONS, LESSON_BY_TOPIC } from '../content/lessons';
import { TOPIC_BY_ID } from '../content/syllabus';

export interface Entry {
  topic: string;
  kind: string;
  title: string;
  body: string;
  text: string;
}

const STOP = new Set(['the', 'a', 'an', 'of', 'and', 'is', 'in', 'to', 'what', 'why', 'how', 'do', 'does', 'i', 'it', 'are', 'for', 'vs', 'between', 'difference', 'me', 'my', 'can', 'you', 'explain', 'about', 'on', 'get', 'dont', "don't", 'understand', 'please', 'this', 'that', 'with', 'when']);
const tokens = (s: string) => s.toLowerCase().replace(/\[\[|\]\]/g, ' ').split(/[^a-z0-9+]+/).filter((w) => w.length > 1 && !STOP.has(w));

export const INDEX: Entry[] = LESSONS.flatMap((l) => {
  const name = TOPIC_BY_ID[l.topic].name;
  const mk = (kind: string, title: string, body: string): Entry => ({ topic: l.topic, kind, title, body, text: `${name} ${title} ${body}`.toLowerCase() });
  return [
    ...l.traps.map(([wrong, fix]) => mk('Common mistake', wrong, fix)),
    mk('Worked example', l.worked.q, l.worked.steps.join(' ')),
    mk('Recall question', l.check.q, l.check.a),
    mk('The idea', `${name}: the particle picture`, l.picture),
    mk('The idea', `${name}: in symbols`, l.symbols),
    ...l.key.map((k) => mk('Key point', name, k)),
  ];
});

export function search(query: string, limit = 8): Entry[] {
  const words = tokens(query);
  if (!words.length) return [];
  return INDEX.map((e) => ({ e, score: words.reduce((s, w) => s + (e.text.includes(w) ? (e.title.toLowerCase().includes(w) ? 2 : 1) : 0), 0) }))
    .filter((r) => r.score >= Math.min(words.length, 2))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.e);
}

/** The lesson notes sent to the tutor with a question: the chosen topic's core, plus search hits. */
export function lessonNotes(question: string, topicId: string | null, masteryPct: number | null): string {
  const lines: string[] = [];
  if (topicId && LESSON_BY_TOPIC[topicId]) {
    const t = TOPIC_BY_ID[topicId];
    const l = LESSON_BY_TOPIC[topicId];
    const level = masteryPct === null ? 'not started' : masteryPct < 40 ? 'early - prefer the Foundations style' : masteryPct < 85 ? 'developing' : 'strong - exam-drill style is appropriate';
    lines.push(`Topic the learner chose: ${t.name} (app mastery estimate: ${masteryPct === null ? 'no data' : masteryPct + '%'}; ${level}).`);
    lines.push(`Objectives: ${t.objectives.map((o) => o.text).join('; ')}.`);
    lines.push(`In symbols: ${l.symbols}`);
    lines.push(`Common mistakes: ${l.traps.map(([w, f]) => `"${w}" -> ${f}`).join(' | ')}`);
  }
  const hits = search(question, 4).filter((e) => !(topicId === e.topic && e.kind === 'Common mistake'));
  for (const e of hits) lines.push(`[${TOPIC_BY_ID[e.topic].name}, ${e.kind}] ${e.title}: ${e.body}`);
  return lines.join('\n');
}
