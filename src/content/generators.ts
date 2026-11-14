// Calculation questions with fresh numbers every time. Every answer is computed by the
// chemistry engine (never typed in by hand), and the wrong options are the results of
// the specific mistakes students make - so feedback can name the mistake.
import { balance, parseEquation } from '../chem/balance';
import { BY_SYMBOL } from '../chem/elements';
import { molarMass, parseSpecies, round, sig } from '../chem/formula';
import type { Profile } from './syllabus';

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(rng: Rng, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)];

export interface GenInstance {
  stem: string;
  answer: number;
  unit: string;
  steps: string[];
  distractors: number[];
  /** Answers are whole numbers that must match exactly (oxidation numbers, coefficients). */
  exact?: boolean;
  signed?: boolean;
  /** Absolute tolerance for typed answers, when 2% is too loose (e.g. burette readings). */
  tolerance?: number;
}

export interface Generator {
  id: string;
  obj: string;
  label: string;
  profile: Profile;
  diff: 1 | 2 | 3;
  make(rng: Rng): GenInstance;
}

export function fmt(x: number, signed = false): string {
  const s = String(sig(x, 3));
  const text = /e/.test(s) ? x.toPrecision(3) : s;
  return signed && x > 0 ? `+${text}` : text;
}

const same = (a: number, b: number) => Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * 0.011);

/** Keep three wrong answers that are positive (unless signed), distinct and not the right answer. */
function wrongs(answer: number, candidates: number[], signed = false): number[] {
  const out: number[] = [];
  const pool = [...candidates, answer * 2, answer / 2, answer * 10, answer / 10, answer * 1.5, answer + 1, answer * 4];
  for (const c of pool) {
    const v = sig(c, 3);
    if (!Number.isFinite(v) || (!signed && v <= 0)) continue;
    if (same(v, sig(answer, 3)) || out.some((o) => same(o, v))) continue;
    out.push(v);
    if (out.length === 3) break;
  }
  return out;
}

const arList = (formula: string): string =>
  Object.keys(parseSpecies(formula).atoms)
    .map((el) => `${el} = ${BY_SYMBOL[el].ar}`)
    .join(', ');

const COMPOUNDS: [name: string, formula: string][] = [
  ['water', 'H2O'], ['carbon dioxide', 'CO2'], ['ammonia', 'NH3'], ['methane', 'CH4'],
  ['sodium chloride', 'NaCl'], ['calcium carbonate', 'CaCO3'], ['sulfuric acid', 'H2SO4'],
  ['sodium hydroxide', 'NaOH'], ['magnesium oxide', 'MgO'], ['calcium hydroxide', 'Ca(OH)2'],
  ['aluminium oxide', 'Al2O3'], ['copper(II) sulfate', 'CuSO4'], ['nitric acid', 'HNO3'],
  ['sodium carbonate', 'Na2CO3'], ['iron(III) oxide', 'Fe2O3'], ['magnesium chloride', 'MgCl2'],
  ['potassium nitrate', 'KNO3'], ['ammonium sulfate', '(NH4)2SO4'], ['ethanol', 'C2H5OH'],
  ['glucose', 'C6H12O6'], ['magnesium nitrate', 'Mg(NO3)2'], ['aluminium sulfate', 'Al2(SO4)3'],
];

const GASES: [string, string][] = [
  ['carbon dioxide', 'CO2'], ['oxygen', 'O2'], ['hydrogen', 'H2'], ['ammonia', 'NH3'],
  ['methane', 'CH4'], ['nitrogen', 'N2'], ['sulfur dioxide', 'SO2'], ['chlorine', 'Cl2'],
];

const SOLUTES: [string, string][] = [
  ['sodium hydroxide', 'NaOH'], ['sodium chloride', 'NaCl'], ['potassium hydroxide', 'KOH'],
  ['sodium carbonate', 'Na2CO3'], ['potassium nitrate', 'KNO3'], ['copper(II) sulfate', 'CuSO4'],
];

/** Reacting-mass questions: the mole ratio is read from the equation by the parser. */
export const REACTIONS: { eq: string; from: [string, string]; to: [string, string] }[] = [
  { eq: 'CaCO3 -> CaO + CO2', from: ['calcium carbonate', 'CaCO3'], to: ['carbon dioxide', 'CO2'] },
  { eq: 'CaCO3 -> CaO + CO2', from: ['calcium carbonate', 'CaCO3'], to: ['calcium oxide', 'CaO'] },
  { eq: '2Mg + O2 -> 2MgO', from: ['magnesium', 'Mg'], to: ['magnesium oxide', 'MgO'] },
  { eq: '2H2 + O2 -> 2H2O', from: ['oxygen', 'O2'], to: ['water', 'H2O'] },
  { eq: 'N2 + 3H2 -> 2NH3', from: ['nitrogen', 'N2'], to: ['ammonia', 'NH3'] },
  { eq: 'N2 + 3H2 -> 2NH3', from: ['hydrogen', 'H2'], to: ['ammonia', 'NH3'] },
  { eq: 'Zn + 2HCl -> ZnCl2 + H2', from: ['zinc', 'Zn'], to: ['zinc chloride', 'ZnCl2'] },
  { eq: '2Na + Cl2 -> 2NaCl', from: ['sodium', 'Na'], to: ['sodium chloride', 'NaCl'] },
  { eq: 'CuO + H2SO4 -> CuSO4 + H2O', from: ['copper(II) oxide', 'CuO'], to: ['copper(II) sulfate', 'CuSO4'] },
  { eq: 'CH4 + 2O2 -> CO2 + 2H2O', from: ['methane', 'CH4'], to: ['water', 'H2O'] },
  { eq: 'Fe2O3 + 3CO -> 2Fe + 3CO2', from: ['iron(III) oxide', 'Fe2O3'], to: ['iron', 'Fe'] },
  { eq: '2Al + 3Cl2 -> 2AlCl3', from: ['aluminium', 'Al'], to: ['aluminium chloride', 'AlCl3'] },
];

/** Reactions that give off a gas, for "what volume of gas" questions. */
export const GAS_REACTIONS: { eq: string; from: [string, string]; gas: [string, string] }[] = [
  { eq: 'CaCO3 + 2HCl -> CaCl2 + H2O + CO2', from: ['calcium carbonate', 'CaCO3'], gas: ['carbon dioxide', 'CO2'] },
  { eq: 'CaCO3 -> CaO + CO2', from: ['calcium carbonate', 'CaCO3'], gas: ['carbon dioxide', 'CO2'] },
  { eq: 'Mg + 2HCl -> MgCl2 + H2', from: ['magnesium', 'Mg'], gas: ['hydrogen', 'H2'] },
  { eq: 'Zn + H2SO4 -> ZnSO4 + H2', from: ['zinc', 'Zn'], gas: ['hydrogen', 'H2'] },
  { eq: '2Al + 6HCl -> 2AlCl3 + 3H2', from: ['aluminium', 'Al'], gas: ['hydrogen', 'H2'] },
  { eq: '2H2O2 -> 2H2O + O2', from: ['hydrogen peroxide', 'H2O2'], gas: ['oxygen', 'O2'] },
  { eq: '2KClO3 -> 2KCl + 3O2', from: ['potassium chlorate', 'KClO3'], gas: ['oxygen', 'O2'] },
];

/** Two reactants and one product, for limiting-reactant questions. */
export const LIMITING: { eq: string; a: [string, string]; b: [string, string]; p: [string, string] }[] = [
  { eq: '2Mg + O2 -> 2MgO', a: ['magnesium', 'Mg'], b: ['oxygen', 'O2'], p: ['magnesium oxide', 'MgO'] },
  { eq: '2H2 + O2 -> 2H2O', a: ['hydrogen', 'H2'], b: ['oxygen', 'O2'], p: ['water', 'H2O'] },
  { eq: 'N2 + 3H2 -> 2NH3', a: ['nitrogen', 'N2'], b: ['hydrogen', 'H2'], p: ['ammonia', 'NH3'] },
  { eq: 'Fe + S -> FeS', a: ['iron', 'Fe'], b: ['sulfur', 'S'], p: ['iron(II) sulfide', 'FeS'] },
  { eq: '2Al + 3Cl2 -> 2AlCl3', a: ['aluminium', 'Al'], b: ['chlorine', 'Cl2'], p: ['aluminium chloride', 'AlCl3'] },
  { eq: 'Zn + S -> ZnS', a: ['zinc', 'Zn'], b: ['sulfur', 'S'], p: ['zinc sulfide', 'ZnS'] },
  { eq: '2Na + Cl2 -> 2NaCl', a: ['sodium', 'Na'], b: ['chlorine', 'Cl2'], p: ['sodium chloride', 'NaCl'] },
];

/** Skeleton equations for the balancing generator; coefficients come from the solver. */
export const SKELETONS: [string[], string[]][] = [
  [['N2', 'H2'], ['NH3']],
  [['Al', 'O2'], ['Al2O3']],
  [['Fe', 'Cl2'], ['FeCl3']],
  [['C3H8', 'O2'], ['CO2', 'H2O']],
  [['C2H6', 'O2'], ['CO2', 'H2O']],
  [['Na', 'H2O'], ['NaOH', 'H2']],
  [['Mg', 'HCl'], ['MgCl2', 'H2']],
  [['CaCO3', 'HCl'], ['CaCl2', 'H2O', 'CO2']],
  [['Fe2O3', 'CO'], ['Fe', 'CO2']],
  [['Al', 'HCl'], ['AlCl3', 'H2']],
  [['KClO3'], ['KCl', 'O2']],
  [['NH3', 'O2'], ['NO', 'H2O']],
  [['C2H5OH', 'O2'], ['CO2', 'H2O']],
  [['Pb(NO3)2'], ['PbO', 'NO2', 'O2']],
];

/** Species for oxidation-number questions. The answer is derived from the rules, not stored. */
export const OX_SPECIES: [formula: string, element: string][] = [
  ['KMnO4', 'Mn'], ['K2Cr2O7', 'Cr'], ['SO4^2-', 'S'], ['SO2', 'S'], ['SO3', 'S'], ['H2S', 'S'],
  ['NO3-', 'N'], ['NH3', 'N'], ['NO2', 'N'], ['CO2', 'C'], ['CO', 'C'], ['Fe2O3', 'Fe'],
  ['FeO', 'Fe'], ['CuO', 'Cu'], ['Cu2O', 'Cu'], ['MnO2', 'Mn'], ['CO3^2-', 'C'], ['HNO3', 'N'],
  ['H2SO4', 'S'], ['NH4+', 'N'], ['ClO3-', 'Cl'], ['Cr2O7^2-', 'Cr'], ['Na2SO3', 'S'],
];

const FIXED_OX: Record<string, number> = { O: -2, H: 1, K: 1, Na: 1 };

/** Oxidation number of `element` in a species, from: known values, and total = charge. */
export function oxidationNumber(formula: string, element: string): number {
  const sp = parseSpecies(formula);
  let known = 0;
  for (const [el, n] of Object.entries(sp.atoms)) {
    if (el === element) continue;
    if (!(el in FIXED_OX)) throw new Error(`No fixed oxidation number for ${el}`);
    known += FIXED_OX[el] * n;
  }
  return (sp.charge - known) / sp.atoms[element];
}

const METALS: [name: string, ion: string, sym: string, z: number][] = [
  ['copper', 'Cu^2+', 'Cu', 2], ['silver', 'Ag+', 'Ag', 1], ['lead', 'Pb^2+', 'Pb', 2], ['aluminium', 'Al^3+', 'Al', 3],
];

const TITRATIONS: { acid: [string, string]; alkali: [string, string]; a: number; b: number; eq: string }[] = [
  { acid: ['hydrochloric acid', 'HCl'], alkali: ['sodium hydroxide', 'NaOH'], a: 1, b: 1, eq: 'HCl + NaOH -> NaCl + H2O' },
  { acid: ['nitric acid', 'HNO3'], alkali: ['potassium hydroxide', 'KOH'], a: 1, b: 1, eq: 'HNO3 + KOH -> KNO3 + H2O' },
  { acid: ['sulfuric acid', 'H2SO4'], alkali: ['sodium hydroxide', 'NaOH'], a: 1, b: 2, eq: 'H2SO4 + 2NaOH -> Na2SO4 + 2H2O' },
  { acid: ['sulfuric acid', 'H2SO4'], alkali: ['potassium hydroxide', 'KOH'], a: 1, b: 2, eq: 'H2SO4 + 2KOH -> K2SO4 + 2H2O' },
];
export const TITRATION_EQUATIONS = TITRATIONS.map((t) => t.eq);

const coefOf = (eq: string, formula: string): number => {
  const parsed = parseEquation(eq);
  const term = [...parsed.left, ...parsed.right].find((t) => t.species.raw === formula);
  if (!term) throw new Error(`${formula} not in ${eq}`);
  return term.coef;
};

export const GENERATORS: Generator[] = [
  {
    id: 'g-neutrons', obj: 'A3.1', label: 'Counting neutrons', profile: 'UK', diff: 1,
    make(rng) {
      const [name, z, a] = pick(rng, [
        ['sodium', 11, 23], ['aluminium', 13, 27], ['phosphorus', 15, 31], ['chlorine', 17, 35], ['potassium', 19, 39],
        ['iron', 26, 56], ['copper', 29, 63], ['zinc', 30, 65], ['bromine', 35, 80], ['fluorine', 9, 19],
      ] as const);
      return {
        stem: `An atom of ${name} has atomic number ${z} and mass number ${a}. How many neutrons does it contain?`,
        answer: a - z, unit: '', exact: true,
        steps: [`Neutrons = mass number - atomic number`, `= ${a} - ${z} = ${a - z}`],
        distractors: wrongs(a - z, [z, a, a + z]),
      };
    },
  },
  {
    id: 'g-ram', obj: 'A3.3', label: 'Relative atomic mass', profile: 'UK', diff: 2,
    make(rng) {
      const [a, b] = pick(rng, [[35, 37], [63, 65], [10, 11], [6, 7], [79, 81], [20, 22], [69, 71]] as const);
      const p = pick(rng, [20, 25, 30, 40, 60, 70, 75, 80]);
      const answer = round((p * a + (100 - p) * b) / 100, 2);
      return {
        stem: `An element has two isotopes with mass numbers ${a} and ${b}. A sample contains ${p}% of the isotope of mass ${a} and ${100 - p}% of the isotope of mass ${b}. Calculate the relative atomic mass of the element.`,
        answer, unit: '',
        steps: [
          `Weighted mean = (${p} × ${a} + ${100 - p} × ${b}) ÷ 100`,
          `= (${p * a} + ${(100 - p) * b}) ÷ 100`,
          `= ${fmt(answer)}`,
          `Check: the answer lies between ${a} and ${b}, closer to the more abundant isotope.`,
        ],
        distractors: wrongs(answer, [(a + b) / 2, (p * b + (100 - p) * a) / 100, a + b]),
      };
    },
  },
  {
    id: 'g-mr', obj: 'A6.1', label: 'Relative formula mass', profile: 'UK', diff: 1,
    make(rng) {
      const [name, f] = pick(rng, COMPOUNDS);
      const sp = parseSpecies(f);
      const answer = molarMass(sp);
      const once = Object.keys(sp.atoms).reduce((s, el) => s + BY_SYMBOL[el].ar, 0);
      return {
        stem: `Calculate the relative formula mass of ${name}, [[${f}]]. (${arList(f)})`,
        answer, unit: '',
        steps: [
          ...Object.entries(sp.atoms).map(([el, n]) => `${el}: ${n} × ${BY_SYMBOL[el].ar} = ${round(n * BY_SYMBOL[el].ar, 2)}`),
          `Total = ${fmt(answer)}`,
        ],
        distractors: wrongs(answer, [once, answer + 16, answer - 14]),
      };
    },
  },
  {
    id: 'g-moles', obj: 'A6.1', label: 'Mass to moles', profile: 'UK', diff: 2,
    make(rng) {
      const [name, f] = pick(rng, COMPOUNDS);
      const n = pick(rng, [0.05, 0.1, 0.2, 0.25, 0.5, 1.5, 2]);
      const mr = molarMass(f);
      const mass = round(n * mr, 2);
      return {
        stem: `How many moles are there in ${mass} g of ${name}, [[${f}]]? (${arList(f)})`,
        answer: n, unit: 'mol',
        steps: [`Formula mass of [[${f}]] = ${fmt(mr)}`, `Moles = mass ÷ formula mass = ${mass} ÷ ${fmt(mr)}`, `= ${fmt(n)} mol`],
        distractors: wrongs(n, [mr / mass, mass * mr, mass / 100]),
      };
    },
  },
  {
    id: 'g-mass', obj: 'A6.1', label: 'Moles to mass', profile: 'UK', diff: 2,
    make(rng) {
      const [name, f] = pick(rng, COMPOUNDS);
      const n = pick(rng, [0.05, 0.1, 0.2, 0.25, 0.5, 1.5, 2, 3]);
      const mr = molarMass(f);
      const answer = round(n * mr, 2);
      return {
        stem: `What is the mass of ${n} mol of ${name}, [[${f}]]? (${arList(f)})`,
        answer, unit: 'g',
        steps: [`Formula mass of [[${f}]] = ${fmt(mr)}`, `Mass = moles × formula mass = ${n} × ${fmt(mr)}`, `= ${fmt(answer)} g`],
        distractors: wrongs(answer, [mr / n, n / mr, mr]),
      };
    },
  },
  {
    id: 'g-gasvol', obj: 'A6.2', label: 'Gas volume at r.t.p.', profile: 'UK', diff: 2,
    make(rng) {
      const [name, f] = pick(rng, GASES);
      const n = pick(rng, [0.1, 0.25, 0.5, 0.75, 1.5, 2]);
      const mr = molarMass(f);
      const mass = round(n * mr, 2);
      const answer = round(n * 24, 3);
      return {
        stem: `What volume does ${mass} g of ${name}, [[${f}]], occupy at room temperature and pressure? (${arList(f)}; 1 mol of gas occupies 24 dm³)`,
        answer, unit: 'dm³',
        steps: [`Formula mass of [[${f}]] = ${fmt(mr)}`, `Moles = ${mass} ÷ ${fmt(mr)} = ${fmt(n)} mol`, `Volume = moles × 24 = ${fmt(n)} × 24 = ${fmt(answer)} dm³`],
        distractors: wrongs(answer, [mass * 24, 24 / n, n * 22.4, n]),
      };
    },
  },
  {
    id: 'g-conc', obj: 'A6.2', label: 'Concentration of a solution', profile: 'UK', diff: 3,
    make(rng) {
      const [name, f] = pick(rng, SOLUTES);
      const n = pick(rng, [0.05, 0.1, 0.2, 0.25, 0.5]);
      const v = pick(rng, [100, 250, 500, 2000]);
      const mr = molarMass(f);
      const mass = round(n * mr, 2);
      const answer = round(n / (v / 1000), 4);
      return {
        stem: `${mass} g of ${name}, [[${f}]], is dissolved in water and the solution is made up to ${v} cm³. Calculate its concentration in mol dm⁻³. (${arList(f)})`,
        answer, unit: 'mol dm⁻³',
        steps: [
          `Moles = ${mass} ÷ ${fmt(mr)} = ${fmt(n)} mol`,
          `Volume = ${v} ÷ 1000 = ${v / 1000} dm³`,
          `Concentration = moles ÷ volume = ${fmt(n)} ÷ ${v / 1000} = ${fmt(answer)} mol dm⁻³`,
        ],
        distractors: wrongs(answer, [mass / (v / 1000), n * (v / 1000), n, (n / v) * 100]),
      };
    },
  },
  {
    id: 'g-react', obj: 'A6.3', label: 'Reacting masses', profile: 'UK', diff: 3,
    make(rng) {
      const r = pick(rng, REACTIONS);
      const [fromName, fromF] = r.from;
      const [toName, toF] = r.to;
      const ca = coefOf(r.eq, fromF);
      const cb = coefOf(r.eq, toF);
      const n = pick(rng, [0.05, 0.1, 0.2, 0.25, 0.5, 2]);
      const mrA = molarMass(fromF);
      const mrB = molarMass(toF);
      const mass = round(n * mrA, 2);
      const nB = (n * cb) / ca;
      const answer = round(nB * mrB, 3);
      const els = [...new Set([...Object.keys(parseSpecies(fromF).atoms), ...Object.keys(parseSpecies(toF).atoms)])];
      return {
        stem: `What mass of ${toName} is formed when ${mass} g of ${fromName} reacts completely? [[${r.eq}]] (${els.map((el) => `${el} = ${BY_SYMBOL[el].ar}`).join(', ')})`,
        answer, unit: 'g',
        steps: [
          `Bridge 1, mass to moles: moles of [[${fromF}]] = ${mass} ÷ ${fmt(mrA)} = ${fmt(n)} mol`,
          `Bridge 2, mole ratio: ${ca} [[${fromF}]] gives ${cb} [[${toF}]], so moles of [[${toF}]] = ${fmt(nB)} mol`,
          `Bridge 3, moles to mass: ${fmt(nB)} × ${fmt(mrB)} = ${fmt(answer)} g`,
        ],
        distractors: wrongs(answer, [n * mrB, ((n * ca) / cb) * mrB, (mass * cb) / ca, mass, nB]),
      };
    },
  },
  {
    id: 'g-balance', obj: 'A6.3', label: 'Balancing equations', profile: 'UK', diff: 2,
    make(rng) {
      const [l, r] = pick(rng, SKELETONS);
      const coefs = balance(l, r)!;
      const all = [...l, ...r];
      const i = Math.floor(rng() * all.length);
      const balanced = `${l.map((s, k) => (coefs[k] === 1 ? '' : coefs[k]) + s).join(' + ')} -> ${r.map((s, k) => (coefs[k + l.length] === 1 ? '' : coefs[k + l.length]) + s).join(' + ')}`;
      return {
        stem: `The equation [[${l.join(' + ')} -> ${r.join(' + ')}]] is not balanced. When it is balanced using the smallest whole numbers, what is the coefficient of [[${all[i]}]]?`,
        answer: coefs[i], unit: '', exact: true,
        steps: [`Balance one element at a time, leaving oxygen or hydrogen until last.`, `Balanced equation: [[${balanced}]]`, `The coefficient of [[${all[i]}]] is ${coefs[i]}.`],
        distractors: wrongs(coefs[i], [coefs[i] + 1, coefs[i] + 2, coefs[i] - 1, coefs[i] * 2, coefs[i] + 3]),
      };
    },
  },
  {
    id: 'g-percent', obj: 'A6.4', label: 'Percentage composition', profile: 'UK', diff: 2,
    make(rng) {
      const [el, f, name] = pick(rng, [
        ['N', 'NH4NO3', 'ammonium nitrate'], ['N', '(NH4)2SO4', 'ammonium sulfate'], ['Ca', 'CaCO3', 'calcium carbonate'],
        ['O', 'H2O', 'water'], ['Fe', 'Fe2O3', 'iron(III) oxide'], ['C', 'CO2', 'carbon dioxide'], ['Cu', 'CuSO4', 'copper(II) sulfate'],
        ['Mg', 'MgO', 'magnesium oxide'], ['N', 'NH3', 'ammonia'], ['C', 'CH4', 'methane'], ['S', 'H2SO4', 'sulfuric acid'],
        ['Al', 'Al2O3', 'aluminium oxide'], ['N', 'KNO3', 'potassium nitrate'], ['O', 'CaCO3', 'calcium carbonate'],
      ] as const);
      const sp = parseSpecies(f);
      const mr = molarMass(sp);
      const part = sp.atoms[el] * BY_SYMBOL[el].ar;
      const answer = round((part / mr) * 100, 1);
      return {
        stem: `Calculate the percentage by mass of ${BY_SYMBOL[el].name.toLowerCase()} in ${name}, [[${f}]]. (${arList(f)})`,
        answer, unit: '%',
        steps: [
          `Formula mass of [[${f}]] = ${fmt(mr)}`,
          `Mass of ${el} in one formula unit = ${sp.atoms[el]} × ${BY_SYMBOL[el].ar} = ${fmt(part)}`,
          `Percentage = (${fmt(part)} ÷ ${fmt(mr)}) × 100 = ${fmt(answer)}%`,
        ],
        distractors: wrongs(answer, [(BY_SYMBOL[el].ar / mr) * 100, 100 - answer, (part / (mr - part)) * 100, answer / 2]),
      };
    },
  },
  {
    id: 'g-titration', obj: 'A7.4', label: 'Titration calculation', profile: 'UK', diff: 3,
    make(rng) {
      const t = pick(rng, TITRATIONS);
      const cAlk = pick(rng, [0.05, 0.1, 0.2, 0.5]);
      const vAcid = pick(rng, [10.0, 12.5, 20.0, 25.0]);
      const nAlk = (cAlk * 25) / 1000;
      const nAcid = (nAlk * t.a) / t.b;
      const answer = round(nAcid / (vAcid / 1000), 4);
      return {
        stem: `25.0 cm³ of ${cAlk} mol dm⁻³ ${t.alkali[0]} is exactly neutralised by ${vAcid.toFixed(1)} cm³ of ${t.acid[0]}. Calculate the concentration of the acid in mol dm⁻³. [[${t.eq}]]`,
        answer, unit: 'mol dm⁻³',
        steps: [
          `Moles of [[${t.alkali[1]}]] = ${cAlk} × 25.0 ÷ 1000 = ${fmt(nAlk)} mol`,
          `Mole ratio acid : alkali = ${t.a} : ${t.b}, so moles of [[${t.acid[1]}]] = ${fmt(nAcid)} mol`,
          `Concentration = ${fmt(nAcid)} ÷ (${vAcid.toFixed(1)} ÷ 1000) = ${fmt(answer)} mol dm⁻³`,
        ],
        distractors: wrongs(answer, [nAlk / (vAcid / 1000), (nAlk * t.b) / t.a / (vAcid / 1000), (cAlk * vAcid) / 25, cAlk]),
      };
    },
  },
  {
    id: 'g-oxnum', obj: 'A8.2', label: 'Oxidation numbers', profile: 'UK', diff: 2,
    make(rng) {
      const [f, el] = pick(rng, OX_SPECIES);
      const sp = parseSpecies(f);
      const answer = oxidationNumber(f, el);
      const others = Object.entries(sp.atoms).filter(([e]) => e !== el);
      const known = others.reduce((s, [e, n]) => s + FIXED_OX[e] * n, 0);
      return {
        stem: `What is the oxidation number of ${BY_SYMBOL[el].name.toLowerCase()} in [[${f}]]?`,
        answer, unit: '', exact: true, signed: true,
        steps: [
          `Known values: ${others.map(([e, n]) => `${n} × ${e} (${FIXED_OX[e] > 0 ? '+' : ''}${FIXED_OX[e]}) = ${FIXED_OX[e] * n > 0 ? '+' : ''}${FIXED_OX[e] * n}`).join('; ')}`,
          `The oxidation numbers must add up to the overall charge, ${sp.charge === 0 ? '0' : fmt(sp.charge, true)}.`,
          `${sp.atoms[el] > 1 ? `${sp.atoms[el]} × ` : ''}${el} = ${sp.charge} - (${known}) = ${fmt(sp.charge - known, true)}, so ${el} = ${fmt(answer, true)}`,
        ],
        distractors: wrongs(answer, [answer - 2, answer + 2, -answer, answer - 1, answer + 1, sp.charge - known].filter((x) => x !== answer), true),
      };
    },
  },
  {
    id: 'g-faraday', obj: 'A9.3', label: 'Electrolysis quantities', profile: 'UK', diff: 3,
    make(rng) {
      const [name, ion, sym, z] = pick(rng, METALS);
      const [ne, current, time] = pick(rng, [
        [0.01, 1, 965], [0.01, 5, 193], [0.02, 2, 965], [0.02, 1, 1930], [0.05, 5, 965],
        [0.1, 10, 965], [0.1, 5, 1930], [0.2, 10, 1930], [0.2, 5, 3860],
      ] as const);
      const ar = BY_SYMBOL[sym].ar;
      const answer = round((ne / z) * ar, 4);
      return {
        stem: `A current of ${current} A is passed through a solution containing [[${ion}]] ions for ${time} s. What mass of ${name} is deposited at the cathode? (${sym} = ${ar}; 1 mol of electrons = 96 500 C)`,
        answer, unit: 'g',
        steps: [
          `Charge Q = I × t = ${current} × ${time} = ${current * time} C`,
          `Moles of electrons = ${current * time} ÷ 96 500 = ${fmt(ne)} mol`,
          `[[${ion} + ${z === 1 ? '' : z}e- -> ${sym}]]: ${z} mol of electrons deposit 1 mol of ${sym}, so moles of ${sym} = ${fmt(ne / z)} mol`,
          `Mass = ${fmt(ne / z)} × ${ar} = ${fmt(answer)} g`,
        ],
        distractors: wrongs(answer, [ne * ar, ne * z * ar, (current * time) / ar, ne]),
      };
    },
  },
  {
    id: 'g-heat', obj: 'A11.3', label: 'Heat change (q = mcΔT)', profile: 'UK', diff: 2,
    make(rng) {
      const m = pick(rng, [25, 50, 100, 150, 200, 250]);
      const dT = pick(rng, [4, 5, 6, 8, 10, 12]);
      const answer = round((m * 4.2 * dT) / 1000, 4);
      return {
        stem: `In an experiment, ${m} g of water is warmed by ${dT} °C. Calculate the heat absorbed by the water in kJ. (c = 4.2 J g⁻¹ °C⁻¹)`,
        answer, unit: 'kJ',
        steps: [`q = m × c × ΔT = ${m} × 4.2 × ${dT}`, `= ${round(m * 4.2 * dT, 2)} J`, `= ${fmt(answer)} kJ (divide by 1000)`],
        distractors: wrongs(answer, [m * 4.2 * dT, (m * dT) / 1000, (4.2 * dT) / 1000 * 10, (m * 4.2) / 1000]),
      };
    },
  },
  // ---- harder, multi-step calculations (used more often at the higher test levels) ----
  {
    id: 'g-gdm3', obj: 'A6.2', label: 'Converting concentration units', profile: 'UK', diff: 2,
    make(rng) {
      const [name, f] = pick(rng, SOLUTES);
      const c = pick(rng, [0.05, 0.1, 0.2, 0.25, 0.5, 2]);
      const mr = molarMass(f);
      const answer = round(c * mr, 3);
      return {
        stem: `A solution of ${name}, [[${f}]], has a concentration of ${c} mol dm⁻³. What is its concentration in g dm⁻³? (${arList(f)})`,
        answer, unit: 'g dm⁻³',
        steps: [`Formula mass of [[${f}]] = ${fmt(mr)}`, `Each dm³ holds ${c} mol, and each mole has a mass of ${fmt(mr)} g`, `Concentration = ${c} × ${fmt(mr)} = ${fmt(answer)} g dm⁻³`],
        distractors: wrongs(answer, [mr / c, c / mr, (c * mr) / 1000, mr]),
      };
    },
  },
  {
    id: 'g-gas-from-mass', obj: 'A6.3', label: 'Volume of gas from a reacting mass', profile: 'UK', diff: 3,
    make(rng) {
      const r = pick(rng, GAS_REACTIONS);
      const ca = coefOf(r.eq, r.from[1]), cb = coefOf(r.eq, r.gas[1]);
      const n = pick(rng, [0.05, 0.1, 0.2, 0.25, 0.5]);
      const mrA = molarMass(r.from[1]);
      const mass = round(n * mrA, 2);
      const nGas = (n * cb) / ca;
      const answer = round(nGas * 24, 3);
      return {
        stem: `What volume of ${r.gas[0]}, measured at room temperature and pressure, is produced when ${mass} g of ${r.from[0]} reacts completely? [[${r.eq}]] (${arList(r.from[1])}; 1 mol of gas occupies 24 dm³)`,
        answer, unit: 'dm³',
        steps: [
          `Mass to moles: moles of [[${r.from[1]}]] = ${mass} ÷ ${fmt(mrA)} = ${fmt(n)} mol`,
          `Mole ratio: ${ca} [[${r.from[1]}]] gives ${cb} [[${r.gas[1]}]], so moles of gas = ${fmt(nGas)} mol`,
          `Moles to volume: ${fmt(nGas)} × 24 = ${fmt(answer)} dm³`,
        ],
        distractors: wrongs(answer, [n * 24 === answer ? n * 12 : n * 24, mass * 24, ((n * ca) / cb) * 24, nGas * 22.4, nGas]),
      };
    },
  },
  {
    id: 'g-limiting', obj: 'A6.3', label: 'Limiting reactant', profile: 'UK', diff: 3,
    make(rng) {
      const r = pick(rng, LIMITING);
      const [ca, cb, cp] = [coefOf(r.eq, r.a[1]), coefOf(r.eq, r.b[1]), coefOf(r.eq, r.p[1])];
      const x = pick(rng, [0.05, 0.1, 0.2, 0.25]);
      const excess = pick(rng, [1.5, 2, 3]);
      const aLimits = rng() < 0.5;
      const nA = x * ca * (aLimits ? 1 : excess), nB = x * cb * (aLimits ? excess : 1);
      const [mA, mB] = [round(nA * molarMass(r.a[1]), 2), round(nB * molarMass(r.b[1]), 2)];
      const mrP = molarMass(r.p[1]);
      const answer = round(x * cp * mrP, 3);
      const lim = aLimits ? r.a : r.b;
      const els = [...new Set([r.a[1], r.b[1], r.p[1]].flatMap((f) => Object.keys(parseSpecies(f).atoms)))];
      return {
        stem: `${mA} g of ${r.a[0]} is mixed with ${mB} g of ${r.b[0]} and allowed to react. What is the maximum mass of ${r.p[0]} that can form? [[${r.eq}]] (${els.map((el) => `${el} = ${BY_SYMBOL[el].ar}`).join(', ')})`,
        answer, unit: 'g',
        steps: [
          `Moles of [[${r.a[1]}]] = ${mA} ÷ ${fmt(molarMass(r.a[1]))} = ${fmt(nA)} mol; moles of [[${r.b[1]}]] = ${mB} ÷ ${fmt(molarMass(r.b[1]))} = ${fmt(nB)} mol`,
          `The equation needs them in the ratio ${ca} : ${cb}. There is not enough ${lim[0]} to use up the other reactant, so ${lim[0]} is the limiting reactant.`,
          `Moles of [[${r.p[1]}]] = ${fmt(x * cp)} mol (worked from the limiting reactant)`,
          `Mass = ${fmt(x * cp)} × ${fmt(mrP)} = ${fmt(answer)} g`,
        ],
        distractors: wrongs(answer, [x * cp * excess * mrP, mA + mB, (aLimits ? nB : nA) * mrP, answer / cp]),
      };
    },
  },
  {
    id: 'g-yield', obj: 'A6.3', label: 'Percentage yield', profile: 'UK', diff: 3,
    make(rng) {
      const r = pick(rng, REACTIONS);
      const [ca, cb] = [coefOf(r.eq, r.from[1]), coefOf(r.eq, r.to[1])];
      const n = pick(rng, [0.1, 0.2, 0.25, 0.5, 2]);
      const p = pick(rng, [50, 60, 75, 80, 90]);
      const mass = round(n * molarMass(r.from[1]), 2);
      const theory = round(((n * cb) / ca) * molarMass(r.to[1]), 3);
      const actual = round((theory * p) / 100, 3);
      const els = [...new Set([r.from[1], r.to[1]].flatMap((f) => Object.keys(parseSpecies(f).atoms)))];
      return {
        stem: `${mass} g of ${r.from[0]} reacts and ${fmt(actual)} g of ${r.to[0]} is collected. Calculate the percentage yield. [[${r.eq}]] (${els.map((el) => `${el} = ${BY_SYMBOL[el].ar}`).join(', ')})`,
        answer: p, unit: '%',
        steps: [
          `Moles of [[${r.from[1]}]] = ${mass} ÷ ${fmt(molarMass(r.from[1]))} = ${fmt(n)} mol, so the equation predicts ${fmt((n * cb) / ca)} mol of [[${r.to[1]}]]`,
          `Theoretical mass = ${fmt((n * cb) / ca)} × ${fmt(molarMass(r.to[1]))} = ${fmt(theory)} g`,
          `Percentage yield = (actual ÷ theoretical) × 100 = (${fmt(actual)} ÷ ${fmt(theory)}) × 100 = ${p}%`,
        ],
        distractors: wrongs(p, [100 - p, (actual / mass) * 100, (theory / mass) * 100, p / 2, p + 15]),
      };
    },
  },
  // ---- focus areas: titration and electrochemistry ----
  {
    id: 'g-titre-mean', obj: 'A7.4', label: 'Choosing concordant titres', profile: 'XS', diff: 2,
    make(rng) {
      const base = pick(rng, [18.4, 19.6, 21.2, 22.8, 23.5, 24.6]);
      const rough = round(base + 0.4 + rng() * 0.6, 2);
      const good = [0, 0.05, 0.1].map((d) => round(base + d, 2));
      const odd = round(base + pick(rng, [0.35, 0.4, 0.5]), 2);
      const titres = [...good, odd];
      const order = [titres[0], titres[3], titres[1], titres[2]];
      const answer = round((good[0] + good[1] + good[2]) / 3, 2);
      const all4 = round((good[0] + good[1] + good[2] + odd) / 4, 2);
      return {
        stem: `A student's titres were: rough ${rough.toFixed(2)} cm³, then ${order.map((t) => t.toFixed(2)).join(', ')} cm³. Using only concordant results (within 0.10 cm³ of each other), what is the mean titre?`,
        answer, unit: 'cm³', tolerance: 0.015,
        steps: [
          'Leave out the rough titre: it is only a guide.',
          `Concordant results are ${good.map((t) => t.toFixed(2)).join(', ')} cm³; ${odd.toFixed(2)} cm³ is too far from them.`,
          `Mean = (${good.map((t) => t.toFixed(2)).join(' + ')}) ÷ 3 = ${answer.toFixed(2)} cm³`,
        ],
        distractors: wrongs(answer, [all4, round((rough + good[0] + good[1] + good[2] + odd) / 5, 2), round((good[0] + odd) / 2, 2), rough]),
      };
    },
  },
  {
    id: 'g-titration-alkali', obj: 'A7.4', label: 'Concentration of the alkali from a titration', profile: 'UK', diff: 3,
    make(rng) {
      const t = pick(rng, TITRATIONS);
      const cAcid = pick(rng, [0.05, 0.1, 0.2]);
      const vAcid = pick(rng, [12.5, 15.0, 20.0, 22.5]);
      const vAlk = 25.0;
      const nAcid = (cAcid * vAcid) / 1000;
      const nAlk = (nAcid * t.b) / t.a;
      const answer = round(nAlk / (vAlk / 1000), 4);
      return {
        stem: `${vAcid.toFixed(1)} cm³ of ${cAcid} mol dm⁻³ ${t.acid[0]} exactly neutralises 25.0 cm³ of ${t.alkali[0]}. Calculate the concentration of the ${t.alkali[0]} in mol dm⁻³. [[${t.eq}]]`,
        answer, unit: 'mol dm⁻³',
        steps: [
          `Moles of [[${t.acid[1]}]] = ${cAcid} × ${vAcid.toFixed(1)} ÷ 1000 = ${fmt(nAcid)} mol`,
          `Mole ratio acid : alkali = ${t.a} : ${t.b}, so moles of [[${t.alkali[1]}]] = ${fmt(nAlk)} mol`,
          `Concentration = ${fmt(nAlk)} ÷ (25.0 ÷ 1000) = ${fmt(answer)} mol dm⁻³`,
        ],
        distractors: wrongs(answer, [nAcid / (vAlk / 1000), ((nAcid * t.a) / t.b) / (vAlk / 1000), (cAcid * vAcid) / vAlk, nAlk / vAlk]),
      };
    },
  },
  {
    id: 'g-faraday-gas', obj: 'A9.3', label: 'Volume of gas from electrolysis', profile: 'UK', diff: 3,
    make(rng) {
      const [gas, f, eper] = pick(rng, [['hydrogen', 'H2', 2], ['chlorine', 'Cl2', 2], ['oxygen', 'O2', 4]] as const);
      const [ne, current, time] = pick(rng, [[0.02, 2, 965], [0.04, 2, 1930], [0.1, 5, 1930], [0.2, 10, 1930], [0.4, 10, 3860], [0.08, 4, 1930]] as const);
      const nGas = ne / eper;
      const answer = round(nGas * 24, 4);
      const half = f === 'H2' ? '2H+ + 2e- -> H2' : f === 'Cl2' ? '2Cl- -> Cl2 + 2e-' : '4OH- -> 2H2O + O2 + 4e-';
      return {
        stem: `A current of ${current} A flows for ${time} s during an electrolysis. What volume of ${gas} is produced at room temperature and pressure? [[${half}]] (1 mol of electrons = 96 500 C; 1 mol of gas = 24 dm³)`,
        answer, unit: 'dm³',
        steps: [
          `Charge Q = I × t = ${current} × ${time} = ${current * time} C`,
          `Moles of electrons = ${current * time} ÷ 96 500 = ${fmt(ne)} mol`,
          `The half-equation shows ${eper} mol of electrons for 1 mol of [[${f}]], so moles of gas = ${fmt(nGas)} mol`,
          `Volume = ${fmt(nGas)} × 24 = ${fmt(answer)} dm³`,
        ],
        distractors: wrongs(answer, [ne * 24, (ne / (eper === 4 ? 2 : 4)) * 24, nGas * 22.4, nGas]),
      };
    },
  },
];

export const GENERATORS_BY_OBJ: Record<string, Generator[]> = {};
for (const g of GENERATORS) (GENERATORS_BY_OBJ[g.obj] ??= []).push(g);
export const GENERATOR_BY_ID: Record<string, Generator> = Object.fromEntries(GENERATORS.map((g) => [g.id, g]));
