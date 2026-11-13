// Every equation the virtual lab can show is checked here, along with the rules behind it.
import { describe, expect, it } from 'vitest';
import { isBalanced } from '../chem/balance';
import {
  ANIONS, CATIONS, CELLS, combineElements, DIP_METALS, displacement, finalGasVolume, gasVolumeAt, halogenDisplacement, HALOGENS,
  LAB_ELEMENTS, METAL, METAL_REAGENTS, metalReaction, METALS, SALT_SOLUTIONS, titrationPH,
} from './reactions';

const spans = (text: string) => [...text.matchAll(/\[\[(.+?)\]\]/g)].map((m) => m[1]);

describe('metals bench', () => {
  it('gives a balanced equation for every reaction it shows', () => {
    for (const m of METALS) for (const r of METAL_REAGENTS) {
      const out = metalReaction(m.sym, r);
      if (out.equation) expect(isBalanced(out.equation), `${m.sym} + ${r}: ${out.equation}`).toBe(true);
      expect(out.observations.length).toBeGreaterThan(0);
    }
  });
  it('follows the reactivity series', () => {
    expect(metalReaction('Cu', 'dilute hydrochloric acid').reacts).toBe(false);
    expect(metalReaction('Ag', 'oxygen (heated in air)').reacts).toBe(false);
    expect(metalReaction('Mg', 'dilute hydrochloric acid').equation).toBe('Mg + 2HCl -> MgCl2 + H2');
    expect(metalReaction('Na', 'cold water').equation).toBe('2Na + 2H2O -> 2NaOH + H2');
    expect(metalReaction('Al', 'dilute sulfuric acid').equation).toBe('2Al + 3H2SO4 -> Al2(SO4)3 + 3H2');
    expect(metalReaction('Fe', 'steam').equation).toBe('3Fe + 4H2O -> Fe3O4 + 4H2');
    expect(metalReaction('Zn', 'cold water').reacts).toBe(false);
  });
});

describe('displacement', () => {
  it('happens exactly when the metal is more reactive than the one in solution', () => {
    for (const a of DIP_METALS) for (const s of SALT_SOLUTIONS) {
      const out = displacement(a, s.cation);
      expect(out.reacts, `${a} in ${s.name}`).toBe(a !== s.cation && METAL[a].rank < METAL[s.cation].rank);
      if (out.equation) expect(isBalanced(out.equation), out.equation).toBe(true);
    }
    expect(displacement('Cu', 'Ag').equation).toBe('Cu + 2Ag+ -> Cu^2+ + 2Ag');
    expect(displacement('Fe', 'Cu').observations.join(' ')).toMatch(/red-brown/);
  });
  it('orders the halogens correctly', () => {
    const syms = HALOGENS.map((h) => h.sym);
    for (const x of syms) for (const y of syms) {
      const out = halogenDisplacement(x, y);
      expect(out.reacts, `${x}2 + ${y}-`).toBe(syms.indexOf(x) < syms.indexOf(y));
      if (out.equation) expect(isBalanced(out.equation), out.equation).toBe(true);
    }
    expect(halogenDisplacement('Cl', 'Br').equation).toBe('Cl2 + 2Br- -> 2Cl- + Br2');
  });
});

describe('combining elements', () => {
  it('never shows an unbalanced equation, for any pair', () => {
    let reactions = 0;
    for (const a of LAB_ELEMENTS) for (const b of LAB_ELEMENTS) {
      const out = combineElements(a.sym, b.sym);
      if (out.equation) {
        reactions++;
        expect(isBalanced(out.equation), `${a.sym}+${b.sym}: ${out.equation}`).toBe(true);
      }
      for (const text of [out.note ?? '', out.explain]) for (const s of spans(text)) if (/->/.test(s)) expect(isBalanced(s), s).toBe(true);
      // The order the learner picks them in must not matter.
      expect(combineElements(b.sym, a.sym).equation).toBe(out.equation);
    }
    expect(reactions).toBeGreaterThan(60);
  });
  it('gets the rules right', () => {
    expect(combineElements('Ne', 'Na').reacts).toBe(false);
    expect(combineElements('Cu', 'Zn').reacts).toBe(false);
    expect(combineElements('Na', 'Cl')).toMatchObject({ bond: 'ionic', product: 'sodium chloride' });
    expect(combineElements('H', 'O')).toMatchObject({ bond: 'covalent', equation: '2H2 + O2 -> 2H2O' });
    expect(combineElements('Al', 'S')).toMatchObject({ predicted: true, product: 'Al2S3', equation: '2Al + 3S -> Al2S3' });
    expect(combineElements('Ca', 'Br')).toMatchObject({ product: 'CaBr2', equation: 'Ca + Br2 -> CaBr2' });
    // Sodium does not combine directly with nitrogen, so the app must not invent a reaction.
    expect(combineElements('Na', 'N').equation).toBeUndefined();
  });
});

describe('ion tests and electrolysis', () => {
  it('has balanced ionic equations', () => {
    for (const c of CATIONS) {
      for (const t of [c.naoh, c.nh3, c.ki]) if (t.equation) expect(isBalanced(t.equation), t.equation).toBe(true);
      for (const s of spans(c.extra ?? '')) expect(isBalanced(s), s).toBe(true);
    }
    for (const a of ANIONS) for (const t of Object.values(a.tests)) if (t.equation) expect(isBalanced(t.equation), t.equation).toBe(true);
  });
  it('gives each anion exactly one positive identifying test', () => {
    for (const a of ANIONS) expect(Object.values(a.tests).filter((t) => t.positive).length, a.name).toBe(1);
  });
  it('tells the white-precipitate cations apart', () => {
    const sig = (id: string) => { const c = CATIONS.find((x) => x.id === id)!; return `${!!c.naoh.dissolvesInExcess}/${!!c.nh3.precipitate}/${!!c.nh3.dissolvesInExcess}`; };
    expect(new Set(['Ca', 'Zn', 'Al'].map(sig)).size).toBe(3);
    expect(sig('Al')).toBe(sig('Pb')); // identical with both alkalis: needs the iodide test
    expect(CATIONS.find((c) => c.id === 'Pb')!.extra).toMatch(/yellow/);
  });
  it('has balanced half-equations at both electrodes', () => {
    for (const cell of CELLS) {
      expect(isBalanced(cell.cathode.half), `${cell.id} cathode`).toBe(true);
      expect(isBalanced(cell.anode.half), `${cell.id} anode`).toBe(true);
      // Reduction at the cathode: electrons on the left. Oxidation at the anode: electrons on the right.
      expect(cell.cathode.half.split('->')[0]).toContain('e-');
      expect(cell.anode.half.split('->')[1]).toContain('e-');
    }
  });
});

describe('experiment models', () => {
  it('rates: amount of acid fixes the final volume, conditions only change the speed', () => {
    const base = { concentration: 1, temperature: 25, size: 'small chips' as const };
    expect(finalGasVolume(base)).toBeCloseTo(120, 6);
    expect(finalGasVolume({ ...base, concentration: 2 })).toBeCloseTo(240, 6);
    expect(finalGasVolume({ ...base, temperature: 45 })).toBeCloseTo(120, 6);
    expect(gasVolumeAt({ ...base, temperature: 35 }, 30)).toBeGreaterThan(gasVolumeAt(base, 30));
    expect(gasVolumeAt({ ...base, size: 'powder' }, 30)).toBeGreaterThan(gasVolumeAt(base, 30));
    expect(gasVolumeAt(base, 1e6)).toBeCloseTo(120, 3);
    expect(gasVolumeAt(base, 0)).toBe(0);
  });
  it('titration: pH falls through 7 exactly at the end point', () => {
    // 25.0 cm3 of 0.100 M alkali needs 25.0 cm3 of 0.100 M acid.
    expect(titrationPH(0.1, 25, 0.1, 0)).toBeCloseTo(13, 6);
    expect(titrationPH(0.1, 25, 0.1, 24.9)).toBeGreaterThan(9);
    expect(titrationPH(0.1, 25, 0.1, 25)).toBe(7);
    expect(titrationPH(0.1, 25, 0.1, 25.1)).toBeLessThan(5);
    expect(titrationPH(0.08, 25, 0.1, 20)).toBe(7);
  });
});
