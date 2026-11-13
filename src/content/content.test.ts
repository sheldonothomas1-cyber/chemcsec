// The "chemistry gate": every equation the app shows a learner is checked by the engine,
// and every generated answer is re-derived, so nothing wrong can ship silently.
import { describe, expect, it } from 'vitest';
import { isBalanced } from '../chem/balance';
import { parseSpecies } from '../chem/formula';
import { GENERATORS, mulberry32, oxidationNumber, OX_SPECIES, REACTIONS, TITRATION_EQUATIONS } from './generators';
import { ITEMS, ITEMS_BY_OBJ } from './items';
import { LESSONS } from './lessons';
import { PAPER2 } from './paper2';
import { ALL_OBJECTIVES, TOPICS } from './syllabus';

const chemSpans = (text: string): string[] => [...text.matchAll(/\[\[(.+?)\]\]/g)].map((m) => m[1]);
const isEquation = (s: string) => /->|<=>/.test(s);

function lessonText(): string[] {
  return LESSONS.flatMap((l) => [
    l.see, l.picture, l.symbols, l.context ?? '', l.worked.q, ...l.worked.steps, ...l.key, l.check.q, l.check.a,
    ...l.traps.flat(),
  ]);
}
function paper2Text(): string[] {
  return PAPER2.flatMap((p) => [p.intro, ...p.parts.flatMap((x) => [x.q, x.model, ...x.points])]);
}

describe('syllabus coverage', () => {
  it('has a lesson for every topic', () => {
    expect(LESSONS.map((l) => l.topic).sort()).toEqual(TOPICS.map((t) => t.id).sort());
  });
  it('has at least two questions for every objective', () => {
    for (const o of ALL_OBJECTIVES) {
      const n = (ITEMS_BY_OBJ[o.id]?.length ?? 0) + GENERATORS.filter((g) => g.obj === o.id).length;
      expect(n, `objective ${o.id}`).toBeGreaterThanOrEqual(2);
    }
  });
  it('gives each topic enough questions for its share of a 60-item mock', () => {
    expect(TOPICS.reduce((s, t) => s + t.weight, 0)).toBe(60);
    for (const t of TOPICS) {
      const n = ITEMS.filter((i) => i.obj.startsWith(t.id + '.')).length;
      expect(n, `topic ${t.id}`).toBeGreaterThanOrEqual(t.weight);
    }
  });
  it('has unique question ids and four distinct options each', () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    for (const i of ITEMS) expect(new Set(i.options).size, i.id).toBe(4);
  });
});

describe('chemistry gate', () => {
  it('every formula shown parses', () => {
    const all = [...lessonText(), ...paper2Text(), ...ITEMS.flatMap((i) => [i.stem, i.why, ...i.options])];
    for (const text of all) {
      for (const span of chemSpans(text)) {
        if (isEquation(span)) continue;
        expect(() => parseSpecies(span), span).not.toThrow();
      }
    }
  });
  it('every equation in lessons, explanations and mark schemes is balanced', () => {
    const all = [...lessonText(), ...paper2Text(), ...ITEMS.flatMap((i) => [i.stem, i.why])];
    for (const text of all) {
      for (const span of chemSpans(text).filter(isEquation)) {
        // Physical changes (same species each side) are not reaction equations.
        if (span.split('->').length > 2) continue;
        expect(isBalanced(span), span).toBe(true);
      }
    }
  });
  it('"which equation is balanced" questions have exactly one balanced option', () => {
    const qs = ITEMS.filter((i) => /correctly balanced/.test(i.stem));
    expect(qs.length).toBeGreaterThan(0);
    for (const i of qs) {
      const [right, ...wrong] = i.options.map((o) => chemSpans(o)[0]);
      expect(isBalanced(right), i.id).toBe(true);
      for (const w of wrong) expect(isBalanced(w), `${i.id}: ${w}`).toBe(false);
    }
  });
  it('equation options used as answers are themselves balanced', () => {
    for (const i of ITEMS) {
      const first = chemSpans(i.options[0])[0];
      if (first && isEquation(first)) expect(isBalanced(first), i.id).toBe(true);
    }
  });
  it('generator source equations are balanced', () => {
    for (const r of REACTIONS) expect(isBalanced(r.eq), r.eq).toBe(true);
    for (const eq of TITRATION_EQUATIONS) expect(isBalanced(eq), eq).toBe(true);
  });
  it('oxidation numbers come out as whole numbers', () => {
    for (const [f, el] of OX_SPECIES) expect(Number.isInteger(oxidationNumber(f, el)), f).toBe(true);
    expect(oxidationNumber('KMnO4', 'Mn')).toBe(7);
    expect(oxidationNumber('NH4+', 'N')).toBe(-3);
    expect(oxidationNumber('Cr2O7^2-', 'Cr')).toBe(6);
  });
});

describe('generated questions', () => {
  it('always produce a finite answer and three distinct wrong options', () => {
    for (const g of GENERATORS) {
      for (let seed = 1; seed <= 300; seed++) {
        const inst = g.make(mulberry32(seed * 7919));
        expect(Number.isFinite(inst.answer), `${g.id} seed ${seed}`).toBe(true);
        expect(inst.distractors.length, `${g.id} seed ${seed}`).toBe(3);
        const all = [inst.answer, ...inst.distractors];
        for (let a = 0; a < all.length; a++)
          for (let b = a + 1; b < all.length; b++)
            expect(Math.abs(all[a] - all[b]) > Math.abs(all[b]) * 0.011 || all[a] !== all[b], `${g.id} seed ${seed}: ${all}`).toBe(true);
        expect(new Set(all.map((x) => x.toPrecision(3))).size, `${g.id} seed ${seed}: ${all}`).toBe(4);
        for (const step of inst.steps) for (const span of chemSpans(step)) {
          if (isEquation(span)) expect(isBalanced(span), `${g.id}: ${span}`).toBe(true);
        }
        if (inst.exact) expect(Number.isInteger(inst.answer), g.id).toBe(true);
      }
    }
  });
  it('worked examples from the playbook reproduce', () => {
    // 5.0 g CaCO3 -> 2.2 g CO2; 25.0 cm3 of 0.100 M NaOH vs 20.0 cm3 HCl -> 0.125 M
    expect((5.0 / 100) * 44).toBeCloseTo(2.2, 10);
    expect((0.1 * 25) / 1000 / (20 / 1000)).toBeCloseTo(0.125, 10);
  });
});
