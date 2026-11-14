import { describe, expect, it } from 'vitest';
import { isBalanced } from '../chem/balance';
import { parseSpecies } from '../chem/formula';
import { buildFocusMock, buildFocusSession, checkTyped, serveGenerator } from '../engine/session';
import type { AppState } from '../store';
import { FOCUS_AREAS } from './focus';
import { FOCUS_ITEMS } from './items-focus';
import { GENERATOR_BY_ID, mulberry32 } from './generators';
import { ITEMS } from './items';
import { ALL_OBJECTIVES, TOPIC_BY_ID } from './syllabus';

const spans = (t: string) => [...t.matchAll(/\[\[(.+?)\]\]/g)].map((m) => m[1]);
const blank = { mastery: {}, itemStats: {}, attempts: [], mocks: [], cards: {} } as unknown as AppState;

describe('focus areas', () => {
  it('point at real objectives, lessons and lab benches', () => {
    const objs = new Set(ALL_OBJECTIVES.map((o) => o.id));
    const benches = new Set(['elements', 'metals', 'displacement', 'ions', 'electrolysis', 'rates', 'titration']);
    expect(FOCUS_AREAS).toHaveLength(7);
    for (const f of FOCUS_AREAS) {
      for (const o of f.objectives) expect(objs.has(o), `${f.id} ${o}`).toBe(true);
      for (const t of f.lessons) expect(TOPIC_BY_ID[t], `${f.id} ${t}`).toBeTruthy();
      for (const l of f.lab ?? []) expect(benches.has(l.id), l.id).toBe(true);
      expect(f.skills.length).toBeGreaterThanOrEqual(5);
    }
  });
  it('study guides contain only balanced equations and valid formulae', () => {
    for (const f of FOCUS_AREAS) {
      const text = [f.why, ...f.examTips, ...f.methods.flatMap((m) => [m.when, ...m.steps, m.example?.q ?? '', ...(m.example?.working ?? [])])];
      for (const t of text) for (const s of spans(t)) {
        if (/->|<=>/.test(s)) expect(isBalanced(s), `${f.id}: ${s}`).toBe(true);
        else expect(() => parseSpecies(s), `${f.id}: ${s}`).not.toThrow();
      }
    }
  });
  it('the extra questions are in the bank, with unique ids', () => {
    expect(FOCUS_ITEMS.length).toBeGreaterThanOrEqual(50);
    for (const i of FOCUS_ITEMS) expect(ITEMS).toContain(i);
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
  });
  it('every area builds a full drill, a harder drill and a 15-question paper', () => {
    for (const f of FOCUS_AREAS) {
      const drill = buildFocusSession(blank, f.id, 12);
      expect(drill.length, f.id).toBe(12);
      for (const q of drill) expect(f.objectives).toContain(q.obj);
      expect(buildFocusSession(blank, f.id, 12, true).length).toBe(12);
      const paper = buildFocusMock(f.id, 15, 2, 7);
      expect(paper.length, f.id).toBe(15);
      for (const q of paper) expect(q.kind).toBe('mcq');
      expect(new Set(f.objectives.filter((o) => paper.some((q) => q.obj === o))).size).toBeGreaterThanOrEqual(Math.min(3, f.objectives.length));
    }
  });
  it('titre answers are marked to 0.015 cm³, not 2%', () => {
    const q = serveGenerator(GENERATOR_BY_ID['g-titre-mean'], mulberry32(5), false);
    expect(checkTyped(q, String(q.answer))).toBe(true);
    expect(checkTyped(q, String(q.answer + 0.1))).toBe(false);
  });
});
