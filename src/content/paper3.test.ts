import { describe, expect, it } from 'vitest';
import { isBalanced } from '../chem/balance';
import { parseSpecies } from '../chem/formula';
import { searchAll } from '../search';
import { mulberry32 } from './generators';
import { checkScale, makeScaleTask, P3_TOTAL, PAPER3 } from './paper3';
import { PAPER2 } from './paper2';
import { TOPIC_BY_ID } from './syllabus';

const spans = (t: string) => [...t.matchAll(/\[\[(.+?)\]\]/g)].map((m) => m[1]);

describe('Paper 03 questions', () => {
  it('have unique ids, real topics and marks on every part', () => {
    const ids = [...PAPER2, ...PAPER3].map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of PAPER3) {
      expect(q.id.startsWith('p3-')).toBe(true);
      for (const t of q.topics) expect(TOPIC_BY_ID[t], `${q.id} ${t}`).toBeTruthy();
      for (const p of q.parts) expect(p.points.length, `${q.id}: ${p.q}`).toBe(p.marks);
      expect(P3_TOTAL(q)).toBeGreaterThanOrEqual(8);
    }
    expect(new Set(PAPER3.map((q) => q.skill)).size).toBe(4);
  });
  it('contain only balanced equations and valid formulae', () => {
    for (const q of PAPER3) {
      const text = [q.intro, ...q.parts.flatMap((p) => [p.q, p.model, ...p.points])];
      for (const t of text) for (const s of spans(t)) {
        if (/->|<=>/.test(s)) expect(isBalanced(s), `${q.id}: ${s}`).toBe(true);
        else expect(() => parseSpecies(s), `${q.id}: ${s}`).not.toThrow();
      }
    }
  });
  it('titration numbers are self-consistent', () => {
    const t = PAPER3.find((q) => q.id === 'p3-titration')!;
    const [fin, ini] = t.table!.rows;
    const titres = fin.slice(1).map((f, i) => Number(f) - Number(ini[i + 1]));
    expect(titres.map((x) => x.toFixed(2))).toEqual(['24.10', '23.70', '23.65', '23.75']);
    const mean = (titres[1] + titres[2] + titres[3]) / 3;
    expect(mean.toFixed(2)).toBe('23.70');
    expect(((0.1 * mean) / 1000 / 0.025).toFixed(4)).toBe('0.0948');
  });
});

describe('scale reading', () => {
  it('marks value and precision separately', () => {
    const rand = mulberry32(3);
    for (let i = 0; i < 60; i++) {
      const t = makeScaleTask(rand);
      expect(checkScale(t, t.value.toFixed(t.decimals)).ok).toBe(true);
      expect(checkScale(t, (t.value + t.step * 2).toFixed(t.decimals)).valueOk).toBe(false);
    }
    const b = { kind: 'burette' as const, value: 23.4, step: 0.05, decimals: 2, unit: 'cm³' };
    expect(checkScale(b, '23.40')).toEqual({ ok: true, precisionOk: true, valueOk: true });
    expect(checkScale(b, '23.4')).toEqual({ ok: false, precisionOk: false, valueOk: true });
    expect(checkScale(b, '23,40').ok).toBe(true);
  });
  it('burette values are in 0.05 steps', () => {
    const rand = mulberry32(9);
    for (let i = 0; i < 100; i++) {
      const t = makeScaleTask(rand, 'burette');
      expect(Math.abs(t.value * 20 - Math.round(t.value * 20))).toBeLessThan(1e-9);
    }
  });
});

describe('app search', () => {
  it('puts the obvious answer first', () => {
    expect(searchAll('Na')[0].title).toBe('Sodium (Na)');
    expect(searchAll('sodium')[0].kind).toBe('Element');
    expect(searchAll('mole')[0].title).toMatch(/mole/i);
    expect(searchAll('paper 3')[0].title).toMatch(/Paper 03/);
    expect(searchAll('electrolysis').slice(0, 3).map((d) => d.kind)).toContain('Topic');
  });
  it('finds things across the app', () => {
    const kinds = new Set(searchAll('titration', 80).map((d) => d.kind));
    for (const k of ['Lab', 'Paper 03', 'Focus guide']) expect(kinds, k).toContain(k);
    expect(searchAll('burette').some((d) => d.to.startsWith('/exam/paper3'))).toBe(true);
    expect(searchAll('test for chloride').length).toBeGreaterThan(0);
    expect(searchAll('qwertyzz')).toEqual([]);
    expect(searchAll('   ')).toEqual([]);
  });
});
