// App-wide search: one offline index over everything a learner might look for, from pages and
// topics to elements, lab benches, exam questions, videos and the text inside every lesson.
import { CSEC_NOTES, ALL_ELEMENTS, groupLabel } from './data/periodic';
import { FOCUS_AREAS } from './content/focus';
import { PAPER2 } from './content/paper2';
import { P3_GUIDE, P3_SKILLS, PAPER3 } from './content/paper3';
import { TOPICS, TOPIC_BY_ID } from './content/syllabus';
import { VIDEOS } from './content/videos';
import { INDEX as LESSON_TEXT } from './tutor/retrieve';

export type HitKind = 'Page' | 'Topic' | 'Objective' | 'Focus guide' | 'Lab' | 'Element' | 'Reference' | 'Exam question' | 'Paper 03' | 'Video' | 'In a lesson';

export interface Doc {
  kind: HitKind;
  title: string;
  sub: string;
  to: string;
  /** Extra words that should find this, beyond its title. */
  words?: string;
  /** Small boost so pages and topics outrank passing mentions. */
  boost?: number;
}

const strip = (s: string) => s.replace(/\[\[|\]\]/g, '').replace(/\^/g, '');

const PAGES: Doc[] = [
  { kind: 'Page', title: 'Today', sub: "Today's session, reviews due and your streak", to: '/', words: 'home start session daily streak due' },
  { kind: 'Page', title: 'Learn: syllabus map', sub: 'Every topic and lesson', to: '/learn', words: 'lessons topics notes syllabus map' },
  { kind: 'Page', title: 'Practice', sub: 'Topic practice, weak spots, mistakes and challenges', to: '/practice', words: 'questions quiz drill mistakes weak' },
  { kind: 'Page', title: 'Exam practice', sub: 'Paper 01 mocks, Paper 02 and Paper 03', to: '/exam', words: 'mock paper exam test past papers timed' },
  { kind: 'Page', title: 'Paper 03: practical skills', sub: 'SBA and Paper 03/2 practice, scale reading, planning and design', to: '/exam/paper3', words: 'paper 3 p3 032 031 sba practical alternative private candidate planning design observation inference', boost: 2 },
  { kind: 'Page', title: 'Read the scale', sub: 'Burette, thermometer and measuring cylinder readings', to: '/exam/paper3#read-the-scale', words: 'burette thermometer measuring cylinder meniscus reading precision decimal places measurement' },
  { kind: 'Page', title: 'Progress', sub: 'Mastery map, grade estimate and mock history', to: '/progress', words: 'grade mastery stats results score' },
  { kind: 'Page', title: 'Focus areas', sub: 'Study guides for the seven hardest topics', to: '/focus', words: 'guides methods hard topics' },
  { kind: 'Page', title: 'Virtual lab', sub: 'Mock experiments: reactions, tests, electrolysis, titration', to: '/lab', words: 'simulation experiment practical lab' },
  { kind: 'Page', title: 'Periodic table', sub: 'All 118 elements, tap any one for details', to: '/periodic-table', words: 'elements groups periods' },
  { kind: 'Page', title: 'Quick reference', sub: 'Ions, solubility, tests and numbers to know', to: '/reference', words: 'cheat sheet facts formula sheet' },
  { kind: 'Page', title: 'Calculators', sub: 'Formula mass, moles and equation balancer', to: '/tools', words: 'calculator molar mass rfm mr moles balance equation balancer' },
  { kind: 'Page', title: 'AI tutor', sub: 'Ask questions and get step-by-step help', to: '/tutor', words: 'ai chat help ask tutor gemini claude' },
  { kind: 'Page', title: 'SBA skills checklist', sub: 'Check your lab reports against the four skills', to: '/sba', words: 'sba lab report school based assessment checklist' },
  { kind: 'Page', title: 'Resources', sub: 'Free textbooks, videos, simulations and CXC links', to: '/resources', words: 'books textbook links cxc past papers subject reports' },
  { kind: 'Page', title: 'Install on your phone', sub: 'Home screen app or Android APK', to: '/install', words: 'install apk android iphone download app' },
  { kind: 'Page', title: 'Settings and your data', sub: 'Name, exam date, backup, restore, reset', to: '/settings', words: 'backup restore reset delete name exam date privacy' },
];

const REFERENCE: Doc[] = [
  ['ions', 'Common ions', 'names formulae charges cation anion valency'],
  ['solubility', 'Solubility rules', 'soluble insoluble salts precipitate'],
  ['reactivity-series', 'Reactivity series', 'metals order reactive potassium sodium calcium magnesium aluminium zinc iron lead copper silver gold'],
  ['cation-tests', 'Tests for cations', 'sodium hydroxide ammonia precipitate qualitative analysis positive ions'],
  ['anion-tests', 'Tests for anions', 'carbonate sulfate chloride nitrate iodide bromide negative ions qualitative'],
  ['gas-tests', 'Tests for gases', 'hydrogen oxygen carbon dioxide ammonia chlorine limewater splint litmus'],
  ['numbers', 'Numbers to know', 'avogadro molar volume 24 dm3 22.4 faraday constants'],
].map(([id, title, words]) => ({ kind: 'Reference' as const, title, sub: 'Quick reference', to: `/reference#${id}`, words }));

const LAB: Doc[] = [
  ['elements', 'Combine elements', 'heat two elements ionic covalent compound'],
  ['metals', 'Metals', 'water steam acid oxygen reactivity'],
  ['displacement', 'Displacement', 'metal displacement halogen displacement reactivity'],
  ['ions', 'Identify ions', 'precipitate tests cation anion mystery sample qualitative analysis'],
  ['electrolysis', 'Electrolysis', 'electrodes anode cathode ions brine copper sulfate'],
  ['rates', 'Rates of reaction', 'concentration temperature surface area catalyst graph'],
  ['titration', 'Titration', 'burette pipette indicator end point concentration neutralisation'],
].map(([id, name, words]) => ({ kind: 'Lab' as const, title: `${name} (virtual lab)`, sub: 'Do the experiment yourself', to: `/lab/${id}`, words }));

function build(): Doc[] {
  const docs: Doc[] = [...PAGES, ...REFERENCE, ...LAB];
  for (const t of TOPICS) {
    docs.push({ kind: 'Topic', title: t.name, sub: `${t.id} · ${t.blurb}`, to: `/learn/${t.id}`, words: `${t.id} ${t.sym}`, boost: 2 });
    for (const o of t.objectives) docs.push({ kind: 'Objective', title: strip(o.text), sub: `${t.name} (${o.id})`, to: `/learn/${t.id}` });
  }
  for (const f of FOCUS_AREAS) {
    docs.push({ kind: 'Focus guide', title: f.name, sub: 'Study guide, worked methods, drills and a timed paper', to: `/focus/${f.id}`, words: `${f.short} ${f.methods.map((m) => m.title).join(' ')}`, boost: 1 });
  }
  for (const e of ALL_ELEMENTS) {
    docs.push({ kind: 'Element', title: `${e.name} (${e.sym})`, sub: `Atomic number ${e.z} · ${groupLabel(e)}`, to: `/periodic-table?el=${e.sym}`, words: `${e.sym} ${e.z} ${e.cat} ${CSEC_NOTES[e.sym] ?? ''}` });
  }
  for (const q of PAPER2) docs.push({ kind: 'Exam question', title: q.title, sub: `Paper 02 · ${q.kind}`, to: `/exam/paper2/${q.id}`, words: `${strip(q.intro)} paper 2 ${q.topics.map((t) => TOPIC_BY_ID[t]?.name).join(' ')}` });
  for (const q of PAPER3) docs.push({ kind: 'Paper 03', title: q.title, sub: `Paper 03 · ${P3_SKILLS[q.skill].name}`, to: `/exam/paper3/${q.id}`, words: `${strip(q.intro)} paper 3 practical ${q.topics.map((t) => TOPIC_BY_ID[t]?.name).join(' ')}` });
  for (const g of P3_GUIDE) docs.push({ kind: 'Paper 03', title: `${P3_SKILLS[g.skill].name}: ${g.title}`, sub: 'Paper 03 rules examiners mark by', to: '/exam/paper3#p3-rules', words: `${P3_SKILLS[g.skill].short} ${g.rules.join(' ')}` });
  for (const v of VIDEOS) docs.push({ kind: 'Video', title: v.title, sub: `${TOPIC_BY_ID[v.topic]?.name ?? v.topic} · ${v.channel}`, to: `/learn/${v.topic}`, words: v.why });
  for (const e of LESSON_TEXT) docs.push({ kind: 'In a lesson', title: strip(e.title), sub: `${TOPIC_BY_ID[e.topic].name} · ${e.kind}`, to: `/learn/${e.topic}`, words: strip(e.body), boost: -1 });
  return docs;
}

const STOP = new Set(['the', 'a', 'an', 'of', 'and', 'is', 'in', 'to', 'what', 'how', 'do', 'does', 'for', 'with', 'on', 'are', 'i', 'me', 'my']);
const words = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w));

interface Prepared { doc: Doc; title: string[]; body: Set<string>; bodyText: string }
let prepared: Prepared[] | null = null;
function index(): Prepared[] {
  if (!prepared) {
    prepared = build().map((doc) => {
      const body = words(`${doc.sub} ${doc.words ?? ''}`);
      return { doc, title: words(doc.title), body: new Set(body), bodyText: ` ${body.join(' ')} ` };
    });
  }
  return prepared;
}

/**
 * Every query word must match something (a title word, or a body word, by prefix). Title hits
 * score most, whole-word hits beat prefixes, and an element symbol typed exactly ("Na") wins.
 */
export function searchAll(query: string, limit = 40): Doc[] {
  const raw = query.trim();
  const q = words(raw);
  if (!q.length) return [];
  const exactSym = /^[A-Za-z]{1,2}$/.test(raw) ? raw.toLowerCase() : null;
  const out: { doc: Doc; score: number }[] = [];
  for (const p of index()) {
    let score = 0;
    let all = true;
    for (const w of q) {
      let best = 0;
      for (const t of p.title) {
        if (t === w) { best = Math.max(best, 6); break; }
        if (t.startsWith(w) && w.length >= 2) best = Math.max(best, 4);
      }
      if (!best) {
        if (p.body.has(w)) best = 2;
        else if (w.length >= 3 && p.bodyText.includes(` ${w}`)) best = 1;
      }
      if (!best) { all = false; break; }
      score += best;
    }
    if (!all) continue;
    if (exactSym && p.doc.kind === 'Element' && p.doc.title.toLowerCase().endsWith(`(${exactSym})`)) score += 20;
    if (p.title.join(' ') === q.join(' ')) score += 5;
    // Concise titles win ties: "Sodium (Na)" beats a long objective that mentions sodium.
    score += 3 * Math.min(1, q.length / Math.max(1, p.title.length));
    score += p.doc.boost ?? 0;
    out.push({ doc: p.doc, score });
  }
  // Show each destination once: a topic page beats a passing mention inside it.
  out.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const res: Doc[] = [];
  for (const r of out) {
    const key = `${r.doc.kind}|${r.doc.title}|${r.doc.to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    res.push(r.doc);
    if (res.length >= limit) break;
  }
  return res;
}
