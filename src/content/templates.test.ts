import { describe, expect, it } from 'vitest';
import { isBalanced } from '../chem/balance';
import { parseSpecies } from '../chem/formula';
import { buildMock, recommendedLevel } from '../engine/session';
import type { AppState } from '../store';
import { GENERATORS, mulberry32 } from './generators';
import { ANION_LIST, CATION_LIST, ionicFormula, isSoluble } from './ions';
import { ALL_OBJECTIVES } from './syllabus';
import { TEMPLATES } from './templates';
import { VIDEOS } from './videos';
import { valencesOk, HYDROCARBONS, ORGANIC_FAMILY, molecularFormula } from '../visuals/organic';
import { FURNACE_EQUATIONS } from '../visuals/inorganic';

const spans = (t: string) => [...t.matchAll(/\[\[(.+?)\]\]/g)].map((m) => m[1]);

describe('question templates', () => {
  it('every template makes valid questions for many different seeds', () => {
    const objs = new Set(ALL_OBJECTIVES.map((o) => o.id));
    for (const t of TEMPLATES) {
      expect(objs.has(t.obj), t.id).toBe(true);
      const stems = new Set<string>();
      for (let seed = 1; seed <= 200; seed++) {
        const q = t.make(mulberry32(seed * 104729));
        expect(new Set(q.options).size, `${t.id} seed ${seed}: ${q.options}`).toBe(4);
        for (const text of [q.stem, q.why, ...q.options]) for (const s of spans(text)) {
          if (/->|<=>/.test(s)) expect(isBalanced(s), `${t.id}: ${s}`).toBe(true);
          else expect(() => parseSpecies(s), `${t.id}: ${s}`).not.toThrow();
        }
        stems.add(q.stem + q.options[0]);
      }
      // "Different every time": each template must produce plenty of distinct questions.
      expect(stems.size, t.id).toBeGreaterThanOrEqual(5);
    }
  });
  it('builds ionic formulae correctly', () => {
    const c = (core: string, ch: number) => CATION_LIST.find((x) => x.core === core && x.charge === ch)!;
    const a = (core: string) => ANION_LIST.find((x) => x.core === core)!;
    expect(ionicFormula(c('Al', 3), a('SO4'))).toBe('Al2(SO4)3');
    expect(ionicFormula(c('Ca', 2), a('OH'))).toBe('Ca(OH)2');
    expect(ionicFormula(c('NH4', 1), a('SO4'))).toBe('(NH4)2SO4');
    expect(ionicFormula(c('Mg', 2), a('O'))).toBe('MgO');
    expect(ionicFormula(c('Fe', 3), a('O'))).toBe('Fe2O3');
    expect(isSoluble(c('Ba', 2), a('SO4'))).toBe(false);
    expect(isSoluble(c('Ag', 1), a('Cl'))).toBe(false);
    expect(isSoluble(c('Na', 1), a('CO3'))).toBe(true);
  });
  it('new calculation generators give sensible answers', () => {
    for (const id of ['g-gdm3', 'g-gas-from-mass', 'g-limiting', 'g-yield']) {
      const g = GENERATORS.find((x) => x.id === id)!;
      for (let seed = 1; seed < 100; seed++) {
        const inst = g.make(mulberry32(seed));
        expect(inst.answer > 0 && Number.isFinite(inst.answer), id).toBe(true);
        expect(new Set([inst.answer, ...inst.distractors].map((x) => x.toPrecision(3))).size, `${id}: ${inst.distractors}`).toBe(4);
      }
    }
  });
});

describe('mock papers', () => {
  const blank = { mocks: [] } as unknown as AppState;
  it('are different every time and get harder with the level', () => {
    const a = buildMock(60, 1, 11).map((q) => q.stem);
    const b = buildMock(60, 1, 12).map((q) => q.stem);
    expect(a.length).toBe(60);
    expect(a.filter((x) => b.includes(x)).length).toBeLessThan(40);
    const calc = (level: 1 | 2 | 3) => {
      let n = 0;
      for (let s = 0; s < 20; s++) n += buildMock(60, level, s).filter((q) => q.steps).length;
      return n;
    };
    expect(calc(3)).toBeGreaterThan(calc(1));
  });
  it('suggest a level from the last result', () => {
    expect(recommendedLevel(blank)).toBe(1);
    expect(recommendedLevel({ mocks: [{ score: 16, size: 20, level: 1 }] } as unknown as AppState)).toBe(2);
    expect(recommendedLevel({ mocks: [{ score: 6, size: 20, level: 3 }] } as unknown as AppState)).toBe(2);
  });
});

describe('lesson visuals and videos', () => {
  it('molecule drawings obey valency and match their formulae', () => {
    for (const h of [...HYDROCARBONS, ...ORGANIC_FAMILY]) {
      expect(valencesOk(h.m), h.name).toBe(true);
      const f = molecularFormula(h.m), want = parseSpecies(h.formula).atoms;
      expect(f, h.name).toEqual(want);
    }
    for (const eq of FURNACE_EQUATIONS) expect(isBalanced(eq), eq).toBe(true);
  });
  it('every lesson has at least two checked videos', () => {
    const topics = new Set(ALL_OBJECTIVES.map((o) => o.id.split('.')[0]));
    for (const t of topics) expect(VIDEOS.filter((v) => v.topic === t).length, t).toBeGreaterThanOrEqual(2);
    expect(new Set(VIDEOS.map((v) => v.id)).size).toBe(VIDEOS.length);
  });
});
