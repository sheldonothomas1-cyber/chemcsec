// Question templates: each one writes a fresh multiple-choice question from data every time
// it is called, so no two tests are the same. The data is the same data the virtual lab and
// periodic table use, and the answers are derived from it rather than typed in by hand.
// Convention (as in items.ts): options[0] is the correct answer; options are shuffled when served.
import { ALL_ELEMENTS } from '../data/periodic';
import { ANIONS, CATIONS, CELLS, GAS_TESTS, halogenDisplacement, HALOGENS, METAL, METALS, metalReaction } from '../lab/reactions';
import type { Rng } from './generators';
import { ANION_LIST, CATION_LIST, compoundName, ionicFormula, isSoluble, plausible } from './ions';
import type { Profile } from './syllabus';

export interface TemplateInstance {
  stem: string;
  options: [string, string, string, string];
  why: string;
}
export interface Template {
  id: string;
  obj: string;
  profile: Profile;
  diff: 1 | 2 | 3;
  make(rng: Rng): TemplateInstance;
}

const pick = <T>(rng: Rng, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)];
function sample<T>(rng: Rng, xs: readonly T[], n: number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}
/** The correct answer plus the first three different wrong ones. */
function opts(correct: string, wrong: string[]): [string, string, string, string] {
  const out = [correct];
  for (const w of wrong) if (!out.includes(w) && out.length < 4) out.push(w);
  if (out.length < 4) throw new Error(`Not enough distinct options for "${correct}"`);
  return out as [string, string, string, string];
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const an = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a');
const FIRST20 = ALL_ELEMENTS.slice(0, 20);
const chargeText = (c: number) => `${Math.abs(c) === 1 ? '' : Math.abs(c)}${c > 0 ? '+' : '-'}`;
const ION_CHARGE: Record<string, number> = { Li: 1, Na: 1, K: 1, Be: 2, Mg: 2, Ca: 2, Al: 3, N: -3, O: -2, S: -2, F: -1, Cl: -1 };
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const tpl = (id: string, obj: string, profile: Profile, diff: 1 | 2 | 3, make: (rng: Rng) => TemplateInstance): Template => ({ id, obj, profile, diff, make });

const STATE_SUBSTANCES: [string, number, number][] = [
  ['bromine', -7, 59], ['mercury', -39, 357], ['ethanol', -114, 78], ['sulfur', 115, 445], ['oxygen', -219, -183], ['naphthalene', 80, 218],
  ['chlorine', -101, -34], ['sodium', 98, 883], ['water', 0, 100], ['ammonia', -78, -33], ['iodine', 114, 184], ['butane', -138, -1],
];
const SEPARATIONS: [scenario: string, method: string, why: string][] = [
  ['sand from a mixture of sand and water', 'Filtration', 'Sand is insoluble, so its particles are too large to pass through filter paper.'],
  ['pure water from sea water', 'Simple distillation', 'Water boils off and is condensed, leaving the dissolved salts behind.'],
  ['salt from sea water', 'Evaporation', 'Heating drives off the water and leaves the dissolved salt.'],
  ['ethanol from a mixture of ethanol and water', 'Fractional distillation', 'The two liquids mix completely but have different boiling points.'],
  ['the different dyes in a sample of ink', 'Chromatography', 'Each dye travels a different distance because it has a different solubility in the solvent.'],
  ['kerosene from a mixture of kerosene and water', 'Using a separating funnel', 'The two liquids do not mix, so they form layers and the lower one can be run off.'],
  ['large crystals of copper(II) sulfate from its solution', 'Crystallisation', 'Evaporating some water and then cooling slowly lets crystals form.'],
  ['iron filings from a mixture of iron filings and sulfur', 'Using a magnet', 'Iron is magnetic and sulfur is not; in a mixture each keeps its own properties.'],
];
const BONDING: [substance: string, type: string, why: string][] = [
  ['sodium chloride', 'Ionic', 'A metal and a non-metal: electrons are transferred, giving a giant lattice of ions.'],
  ['magnesium oxide', 'Ionic', 'A metal and a non-metal: electrons are transferred, giving a giant lattice of ions.'],
  ['calcium chloride', 'Ionic', 'A metal and a non-metal: electrons are transferred, giving a giant lattice of ions.'],
  ['water', 'Simple covalent (molecular)', 'Two non-metals share electrons, forming small separate molecules.'],
  ['carbon dioxide', 'Simple covalent (molecular)', 'Two non-metals share electrons, forming small separate molecules.'],
  ['methane', 'Simple covalent (molecular)', 'Two non-metals share electrons, forming small separate molecules.'],
  ['ammonia', 'Simple covalent (molecular)', 'Two non-metals share electrons, forming small separate molecules.'],
  ['diamond', 'Giant covalent', 'Every carbon atom is covalently bonded to four others throughout the whole structure.'],
  ['silicon dioxide', 'Giant covalent', 'Covalent bonds link all the atoms into one continuous network.'],
  ['copper', 'Metallic', 'Positive ions are held together by a sea of delocalised electrons.'],
  ['iron', 'Metallic', 'Positive ions are held together by a sea of delocalised electrons.'],
];
const BOND_TYPES = ['Ionic', 'Simple covalent (molecular)', 'Giant covalent', 'Metallic'];
const STEMS = ['', 'meth', 'eth', 'prop', 'but', 'pent', 'hex'];
const sub = (n: number) => (n === 1 ? '' : String(n));
const alkane = (n: number) => `C${sub(n)}H${2 * n + 2}`;
const alkene = (n: number) => `C${n}H${2 * n}`;
const HEAT: [compound: string, products: string, why: string][] = [
  ['copper(II) carbonate', 'copper(II) oxide and carbon dioxide', 'Most metal carbonates decompose to the oxide and carbon dioxide.'],
  ['zinc carbonate', 'zinc oxide and carbon dioxide', 'Most metal carbonates decompose to the oxide and carbon dioxide.'],
  ['calcium carbonate', 'calcium oxide and carbon dioxide', 'Most metal carbonates decompose to the oxide and carbon dioxide.'],
  ['lead(II) nitrate', 'lead(II) oxide, nitrogen dioxide and oxygen', 'Most metal nitrates decompose to the oxide, brown nitrogen dioxide and oxygen.'],
  ['copper(II) nitrate', 'copper(II) oxide, nitrogen dioxide and oxygen', 'Most metal nitrates decompose to the oxide, brown nitrogen dioxide and oxygen.'],
  ['sodium nitrate', 'sodium nitrite and oxygen', 'Nitrates of the most reactive metals lose only some of their oxygen.'],
  ['potassium nitrate', 'potassium nitrite and oxygen', 'Nitrates of the most reactive metals lose only some of their oxygen.'],
  ['copper(II) hydroxide', 'copper(II) oxide and water', 'Most metal hydroxides decompose to the oxide and water.'],
  ['zinc hydroxide', 'zinc oxide and water', 'Most metal hydroxides decompose to the oxide and water.'],
];
const EXTRACTION: [string, string][] = [
  ['potassium', 'Electrolysis of its molten compound'], ['sodium', 'Electrolysis of its molten compound'], ['calcium', 'Electrolysis of its molten compound'],
  ['magnesium', 'Electrolysis of its molten compound'], ['aluminium', 'Electrolysis of its molten compound'],
  ['zinc', 'Heating its oxide with carbon'], ['iron', 'Heating its oxide with carbon'], ['lead', 'Heating its oxide with carbon'],
  ['gold', 'No chemical extraction: it occurs uncombined'],
];
const EMPIRICAL: [formula: string, parts: [string, number, number][]][] = [
  ['CH2O', [['carbon', 12, 1], ['hydrogen', 1, 2], ['oxygen', 16, 1]]], ['CH4', [['carbon', 12, 1], ['hydrogen', 1, 4]]],
  ['MgO', [['magnesium', 24, 1], ['oxygen', 16, 1]]], ['Fe2O3', [['iron', 56, 2], ['oxygen', 16, 3]]], ['SO2', [['sulfur', 32, 1], ['oxygen', 16, 2]]],
  ['SO3', [['sulfur', 32, 1], ['oxygen', 16, 3]]], ['CO2', [['carbon', 12, 1], ['oxygen', 16, 2]]], ['CuO', [['copper', 63.5, 1], ['oxygen', 16, 1]]],
  ['Cu2O', [['copper', 63.5, 2], ['oxygen', 16, 1]]], ['NH3', [['nitrogen', 14, 1], ['hydrogen', 1, 3]]], ['C2H6O', [['carbon', 12, 2], ['hydrogen', 1, 6], ['oxygen', 16, 1]]],
  ['Al2O3', [['aluminium', 27, 2], ['oxygen', 16, 3]]], ['CH2', [['carbon', 12, 1], ['hydrogen', 1, 2]]], ['FeO', [['iron', 56, 1], ['oxygen', 16, 1]]],
];
const HALF: [eq: string, kind: 'Reduction' | 'Oxidation'][] = [
  ...CELLS.map((c): [string, 'Reduction'] => [c.cathode.half, 'Reduction']), ...CELLS.map((c): [string, 'Oxidation'] => [c.anode.half, 'Oxidation']),
  ['Zn -> Zn^2+ + 2e-', 'Oxidation'], ['Fe^2+ -> Fe^3+ + e-', 'Oxidation'], ['Ag+ + e- -> Ag', 'Reduction'], ['Mg -> Mg^2+ + 2e-', 'Oxidation'],
  ['Cl2 + 2e- -> 2Cl-', 'Reduction'], ['Fe^3+ + e- -> Fe^2+', 'Reduction'],
];

export const TEMPLATES: Template[] = [
  tpl('t-state', 'A1.2', 'UK', 1, (rng) => {
    const [name, mp, bp] = pick(rng, STATE_SUBSTANCES);
    const state = pick(rng, ['solid', 'liquid', 'gas'] as const);
    const t = state === 'solid' ? mp - (5 + Math.floor(rng() * 30)) : state === 'gas' ? bp + (5 + Math.floor(rng() * 40)) : Math.round(mp + (bp - mp) * (0.2 + rng() * 0.6));
    return {
      stem: `${cap(name)} melts at ${mp} °C and boils at ${bp} °C. In what state is it at ${t} °C?`,
      options: opts(cap(state), ['Solid', 'Liquid', 'Gas', 'A mixture of solid and gas']),
      why: `${t} °C is ${state === 'solid' ? 'below the melting point' : state === 'gas' ? 'above the boiling point' : 'between the melting point and the boiling point'}, so it is a ${state}.`,
    };
  }),
  tpl('t-separate', 'A2.2', 'XS', 1, (rng) => {
    const [scenario, method, why] = pick(rng, SEPARATIONS);
    return { stem: `Which method is most suitable for obtaining ${scenario}?`, options: opts(method, sample(rng, SEPARATIONS.map((s) => s[1]).filter((m) => m !== method), 3)), why };
  }),
  tpl('t-pne', 'A3.1', 'UK', 2, (rng) => {
    const el = pick(rng, FIRST20.filter((e) => ION_CHARGE[e.sym]));
    const c = ION_CHARGE[el.sym];
    const a = Math.round(el.mass!);
    const n = a - el.z, e = el.z - c;
    const f = (p: number, nn: number, ee: number) => `${p} protons, ${nn} neutrons, ${ee} electrons`;
    return {
      stem: `An ion of ${el.name.toLowerCase()} has atomic number ${el.z}, mass number ${a} and a charge of ${chargeText(c)}. How many protons, neutrons and electrons does it contain?`,
      options: opts(f(el.z, n, e), [f(el.z, n, el.z), f(el.z, n, el.z + c), f(n, el.z, e), f(el.z, a, e)]),
      why: `Protons = atomic number = ${el.z}. Neutrons = ${a} - ${el.z} = ${n}. A charge of ${chargeText(c)} means ${c > 0 ? `${c} fewer` : `${-c} more`} electrons than protons: ${e}.`,
    };
  }),
  tpl('t-arrangement', 'A3.2', 'KC', 1, (rng) => {
    const el = pick(rng, FIRST20.slice(2));
    const others = FIRST20.filter((e) => Math.abs(e.z - el.z) <= 3 && e.z !== el.z && e.z > 2).map((e) => e.shells.join(','));
    return {
      stem: `What is the electron arrangement of ${an(el.name)} ${el.name.toLowerCase()} atom (atomic number ${el.z})?`,
      options: opts(el.shells.join(','), sample(rng, others, 3)),
      why: `Shells fill in the order 2, 8, 8. ${el.z} electrons give ${el.shells.join(',')}.`,
    };
  }),
  tpl('t-ion', 'A3.2', 'UK', 2, (rng) => {
    const el = pick(rng, FIRST20.filter((e) => ION_CHARGE[e.sym]));
    const c = ION_CHARGE[el.sym];
    const f = (ch: number) => `[[${el.sym}${Math.abs(ch) === 1 ? '' : '^' + Math.abs(ch)}${ch > 0 ? '+' : '-'}]]`;
    return {
      stem: `${cap(el.name)} has the electron arrangement ${el.shells.join(',')}. Which ion does it form?`,
      options: opts(f(c), [f(-c), f(c > 0 ? c + 1 : c - 1), f(c > 0 ? -(8 - c) : 8 + c), f(c === 1 || c === -1 ? 2 * c : c > 0 ? c - 1 : c + 1)]),
      why: c > 0 ? `It loses its ${c} outer ${c === 1 ? 'electron' : 'electrons'} to leave a full shell, so it has ${c} more ${c === 1 ? 'proton' : 'protons'} than electrons.` : `It gains ${-c} ${c === -1 ? 'electron' : 'electrons'} to fill its outer shell, so it has ${-c} more ${c === -1 ? 'electron' : 'electrons'} than protons.`,
    };
  }),
  tpl('t-isotope', 'A3.3', 'UK', 2, (rng) => {
    const el = pick(rng, FIRST20.slice(2, 19));
    const a = Math.round(el.mass!);
    const f = (z: number, n: number) => `${z} protons and ${n} neutrons`;
    return {
      stem: `An atom contains ${f(el.z, a - el.z)}. Which of these is an isotope of the same element?`,
      options: opts(f(el.z, a - el.z + pick(rng, [1, 2])), [f(el.z + 1, a - el.z), f(el.z - 1, a - el.z + 1), f(a - el.z, el.z + 1), f(el.z + 1, a - el.z - 1)]),
      why: 'Isotopes have the same number of protons (so they are the same element) but different numbers of neutrons.',
    };
  }),
  tpl('t-group', 'A4.1', 'KC', 1, (rng) => {
    const el = pick(rng, FIRST20.filter((e) => e.z > 2 && e.cat !== 'Noble gas'));
    const g = el.shells[el.shells.length - 1], p = el.shells.length;
    const f = (gg: number, pp: number) => `Group ${ROMAN[gg]}, Period ${pp}`;
    return {
      stem: `An element has the electron arrangement ${el.shells.join(',')}. Where is it in the Periodic Table?`,
      options: opts(f(g, p), [f(p, g), f(g, p + 1), f(Math.min(7, g + 1), p), f(g === 1 ? 2 : g - 1, p), f(g, Math.max(1, p - 1))].filter((x) => !x.includes('Group ,'))),
      why: `${g} outer ${g === 1 ? 'electron' : 'electrons'} means Group ${ROMAN[g]}; ${p} occupied shells means Period ${p}.`,
    };
  }),
  tpl('t-halogen', 'A4.2', 'UK', 2, (rng) => {
    const name = (s: string) => HALOGENS.find((h) => h.sym === s)!;
    const pairs = HALOGENS.flatMap((x) => HALOGENS.filter((y) => y !== x).map((y) => [x.sym, y.sym] as const));
    const yes = pairs.filter(([x, y]) => halogenDisplacement(x, y).reacts);
    const no = pairs.filter(([x, y]) => !halogenDisplacement(x, y).reacts);
    const label = ([x, y]: readonly [string, string]) => `${cap(name(x).water)} and potassium ${name(y).name.replace('ine', 'ide')} solution`;
    const wantReaction = rng() < 0.5;
    const right = pick(rng, wantReaction ? yes : no);
    return {
      stem: wantReaction ? 'In which mixture does a displacement reaction take place?' : 'In which mixture is there NO reaction?',
      options: opts(label(right), (wantReaction ? no : yes).map(label)),
      why: 'A halogen displaces one that is below it in Group VII from its compounds. Reactivity decreases down the group: chlorine, then bromine, then iodine.',
    };
  }),
  tpl('t-formula', 'A5.1', 'UK', 2, (rng) => {
    let c = pick(rng, CATION_LIST.slice(1)), a = pick(rng, ANION_LIST);
    while ((c.charge === 1 && a.charge === -1) || !plausible(c, a)) { c = pick(rng, CATION_LIST.slice(1)); a = pick(rng, ANION_LIST); }
    const right = ionicFormula(c, a);
    const [nc, na] = [Math.abs(a.charge), c.charge];
    const wrong = [ionicFormula(c, a, 1, 1), ionicFormula(c, a, na, nc), ionicFormula(c, a, nc + 1, na), ionicFormula(c, a, nc, na + 1), ionicFormula(c, a, 2, 1), ionicFormula(c, a, 1, 2), ionicFormula(c, a, 3, 2)];
    return {
      stem: `What is the formula of ${compoundName(c, a)}?`,
      options: opts(`[[${right}]]`, wrong.filter((w) => w !== right).map((w) => `[[${w}]]`)),
      why: `The ions are [[${c.formula}]] and [[${a.formula}]]. The charges must cancel, which needs ${-a.charge / gcd(c.charge, -a.charge)} of the first and ${c.charge / gcd(c.charge, -a.charge)} of the second.`,
    };
  }),
  tpl('t-bonding', 'A5.3', 'KC', 1, (rng) => {
    const [s, type, why] = pick(rng, BONDING);
    return { stem: `What type of bonding and structure does ${s} have?`, options: opts(type, BOND_TYPES.filter((t) => t !== type)), why };
  }),
  tpl('t-empirical', 'A6.4', 'UK', 3, (rng) => {
    const [formula, parts] = pick(rng, EMPIRICAL);
    const total = parts.reduce((s, [, ar, n]) => s + ar * n, 0);
    const pct = parts.map(([name, ar, n]) => `${((ar * n * 100) / total).toFixed(1)}% ${name}`);
    const key = (p: [string, number, number][]) => p.map((x) => x[0]).sort().join();
    const sameElements = EMPIRICAL.filter((e) => e[0] !== formula && key(e[1]) === key(parts)).map((e) => e[0]);
    return {
      stem: `A compound contains ${pct.slice(0, -1).join(', ')} and ${pct[pct.length - 1]} by mass. What is its empirical formula? (${parts.map(([name, ar]) => `${name} = ${ar}`).join(', ')})`,
      options: opts(`[[${formula}]]`, [...sample(rng, sameElements, 3), ...sample(rng, EMPIRICAL.map((e) => e[0]).filter((f) => f !== formula), 6)].map((f) => `[[${f}]]`)),
      why: `Divide each percentage by the atomic mass, then divide by the smallest answer: the ratio of atoms is ${parts.map(([, , n]) => n).join(' : ')}.`,
    };
  }),
  tpl('t-ph', 'A7.1', 'KC', 1, (rng) => {
    const pH = pick(rng, [1, 2, 4, 5, 6, 7, 8, 9, 12, 13]);
    const label = pH <= 2 ? 'Strongly acidic' : pH < 7 ? 'Weakly acidic' : pH === 7 ? 'Neutral' : pH <= 9 ? 'Weakly alkaline' : 'Strongly alkaline';
    return { stem: `A solution has a pH of ${pH}. How is it best described?`, options: opts(label, ['Strongly acidic', 'Weakly acidic', 'Neutral', 'Weakly alkaline', 'Strongly alkaline']), why: 'Below 7 is acidic, 7 is neutral and above 7 is alkaline. The further from 7, the stronger.' };
  }),
  tpl('t-indicator', 'A7.1', 'XS', 2, (rng) => {
    const [ind, rule] = pick(rng, [
      ['methyl orange', (p: number) => (p < 3.1 ? 'Red' : 'Yellow')], ['phenolphthalein', (p: number) => (p < 8.2 ? 'Colourless' : 'Pink')], ['litmus', (p: number) => (p < 7 ? 'Red' : 'Blue')],
    ] as [string, (p: number) => string][]);
    const [name, pH] = pick(rng, [['dilute hydrochloric acid', 1], ['sodium hydroxide solution', 13], ['lime juice', 2], ['limewater', 12], ['aqueous ammonia', 11], ['dilute sulfuric acid', 1]] as [string, number][]);
    return { stem: `What colour is ${ind} in ${name}?`, options: opts(rule(pH), ['Red', 'Yellow', 'Colourless', 'Pink', 'Blue', 'Green']), why: `${cap(name)} is ${pH < 7 ? 'acidic' : 'alkaline'} (about pH ${pH}).` };
  }),
  tpl('t-soluble', 'A7.3', 'KC', 2, (rng) => {
    const all = CATION_LIST.slice(1).flatMap((c) => ANION_LIST.filter((a) => !['HCO3', 'O', 'S', 'PO4'].includes(a.core) && plausible(c, a)).map((a) => ({ name: cap(compoundName(c, a)), sol: isSoluble(c, a) })));
    const wantInsoluble = rng() < 0.6;
    const right = pick(rng, all.filter((x) => x.sol === !wantInsoluble));
    return {
      stem: `Which of these compounds is ${wantInsoluble ? 'insoluble' : 'soluble'} in water?`,
      options: opts(right.name, sample(rng, all.filter((x) => x.sol === wantInsoluble), 6).map((x) => x.name)),
      why: 'All nitrates and all sodium, potassium and ammonium salts dissolve. Chlorides dissolve except silver and lead(II); sulfates except barium and lead(II). Most carbonates and hydroxides do not.',
    };
  }),
  tpl('t-salt-method', 'A7.3', 'XS', 2, (rng) => {
    const METHODS = ['Mix two solutions to precipitate it, then filter, wash and dry', 'Titrate an acid with an alkali, then evaporate the neutral solution', 'Add excess insoluble base or carbonate to the acid, filter, then crystallise'];
    const anions = ANION_LIST.filter((x) => ['Cl', 'NO3', 'SO4', 'CO3', 'I'].includes(x.core));
    // Carbonates and iodides are only asked about when insoluble (made by precipitation); soluble silver salts are skipped.
    const ok = (cc: typeof c, aa: typeof a) => { const so = isSoluble(cc, aa); return so !== null && plausible(cc, aa) && !(so && (cc.core === 'Ag' || aa.core === 'CO3' || aa.core === 'I')); };
    let c = pick(rng, CATION_LIST.slice(1)), a = pick(rng, anions);
    while (!ok(c, a)) { c = pick(rng, CATION_LIST.slice(1)); a = pick(rng, anions); }
    const sol = isSoluble(c, a);
    const right = !sol ? METHODS[0] : ['Na', 'K', 'NH4'].includes(c.core) ? METHODS[1] : METHODS[2];
    return {
      stem: `Which method is most suitable for preparing a pure, dry sample of ${compoundName(c, a)}?`,
      options: opts(right, [...METHODS.filter((m) => m !== right), 'Heat the metal strongly in air']),
      why: !sol ? `${cap(compoundName(c, a))} is insoluble, so it is made by precipitation.` : ['Na', 'K', 'NH4'].includes(c.core) ? 'The salt is soluble and so is every reactant, so no excess solid can be filtered off: the exact end point is found by titration.' : 'The salt is soluble but the metal oxide or carbonate is not, so an excess can be used and then filtered off.',
    };
  }),
  tpl('t-halfeq', 'A8.1', 'UK', 2, (rng) => {
    const [eq, kind] = pick(rng, HALF);
    const right = `${kind}, because electrons are ${kind === 'Oxidation' ? 'lost' : 'gained'}`;
    return {
      stem: `What type of change is shown by the half-equation [[${eq}]]?`,
      options: opts(right, [`${kind === 'Oxidation' ? 'Reduction' : 'Oxidation'}, because electrons are ${kind === 'Oxidation' ? 'lost' : 'gained'}`, `${kind}, because electrons are ${kind === 'Oxidation' ? 'gained' : 'lost'}`, 'Neither, because the charges balance']),
      why: 'OIL RIG: Oxidation Is Loss of electrons (electrons on the right), Reduction Is Gain (electrons on the left).',
    };
  }),
  tpl('t-electrode', 'A9.2', 'UK', 2, (rng) => {
    const cell = pick(rng, CELLS);
    const side = pick(rng, ['cathode', 'anode'] as const);
    const right = cap(cell[side].product);
    return {
      stem: `${cell.name} is electrolysed (${cell.electrodes} electrodes). What is formed at the ${side}?`,
      options: opts(right, sample(rng, ['Hydrogen', 'Oxygen', 'Chlorine', 'Sodium', 'Copper', 'Lead', 'Bromine', 'Aluminium', 'Sulfur dioxide'].filter((x) => x !== right), 4)),
      why: `${cell.why} Half-equation: [[${cell[side].half}]].`,
    };
  }),
  tpl('t-electrode-eq', 'A9.2', 'UK', 3, (rng) => {
    const cell = pick(rng, CELLS);
    const side = pick(rng, ['cathode', 'anode'] as const);
    const right = cell[side].half;
    const pool = [...new Set(CELLS.flatMap((c) => [c.cathode.half, c.anode.half]))].filter((h) => h !== right);
    return {
      stem: `${cell.name} is electrolysed (${cell.electrodes} electrodes). Which half-equation represents the reaction at the ${side}?`,
      options: opts(`[[${right}]]`, sample(rng, pool, 4).map((h) => `[[${h}]]`)),
      why: `${cap(cell[side].product)} forms at the ${side}. ${cell.why}`,
    };
  }),
  tpl('t-energy', 'A11.1', 'UK', 1, (rng) => {
    const start = 22 + Math.floor(rng() * 8), change = 3 + Math.floor(rng() * 9), up = rng() < 0.5;
    const right = up ? 'Exothermic; ΔH is negative' : 'Endothermic; ΔH is positive';
    return {
      stem: `Two solutions are mixed in a polystyrene cup. The temperature changes from ${start} °C to ${up ? start + change : start - change} °C. What does this show about the reaction?`,
      options: opts(right, ['Exothermic; ΔH is negative', 'Exothermic; ΔH is positive', 'Endothermic; ΔH is positive', 'Endothermic; ΔH is negative']),
      why: up ? 'The temperature rose, so energy was given out to the surroundings: exothermic, with a negative ΔH.' : 'The temperature fell, so energy was taken in from the surroundings: endothermic, with a positive ΔH.',
    };
  }),
  tpl('t-hc-formula', 'B1.1', 'UK', 1, (rng) => {
    const n = 2 + Math.floor(rng() * 7), isAlkane = rng() < 0.5;
    const right = isAlkane ? alkane(n) : alkene(n);
    return {
      stem: `What is the molecular formula of the ${isAlkane ? 'alkane' : 'alkene'} with ${n} carbon atoms?`,
      options: opts(`[[${right}]]`, [isAlkane ? alkene(n) : alkane(n), `C${n}H${2 * n - 2}`, `C${n}H${2 * n + 1}OH`, `C${n}H${n}`].map((f) => `[[${f}]]`)),
      why: `${isAlkane ? 'Alkanes are CₙH₂ₙ₊₂' : 'Alkenes are CₙH₂ₙ'}. With n = ${n}, the formula is ${right}.`,
    };
  }),
  tpl('t-hc-name', 'B1.1', 'KC', 1, (rng) => {
    const n = 1 + Math.floor(rng() * 6), isAlkane = n === 1 || rng() < 0.5;
    const name = (k: number, ane: boolean) => cap(`${STEMS[k]}${ane ? 'ane' : 'ene'}`);
    const valid = (k: number, ane: boolean) => k >= (ane ? 1 : 2) && k <= 6;
    const right = name(n, isAlkane);
    const near = [[n, !isAlkane], [n + 1, isAlkane], [n - 1, isAlkane], [n + 1, !isAlkane], [n - 1, !isAlkane], [n + 2, isAlkane], [n - 2, isAlkane]] as [number, boolean][];
    return {
      stem: `What is the name of the hydrocarbon [[${isAlkane ? alkane(n) : alkene(n)}]]?`,
      options: opts(right, near.filter(([k, ane]) => valid(k, ane)).map(([k, ane]) => name(k, ane))),
      why: `${n} carbon ${n === 1 ? 'atom' : 'atoms'} gives the stem "${STEMS[n]}-"; ${isAlkane ? 'the formula fits CₙH₂ₙ₊₂, so it ends in -ane' : 'the formula fits CₙH₂ₙ, so it ends in -ene'}.`,
    };
  }),
  tpl('t-family', 'B2.2', 'KC', 2, (rng) => {
    const n = 1 + Math.floor(rng() * 4);
    const [formula, family] = pick(rng, [
      [`C${sub(n)}H${2 * n + 1}OH`, 'Alcohols'], [n === 1 ? 'HCOOH' : `C${sub(n - 1)}H${2 * n - 1}COOH`, 'Carboxylic acids'], [alkene(n + 1), 'Alkenes'], [alkane(n), 'Alkanes'],
    ] as [string, string][]);
    return {
      stem: `To which homologous series does [[${formula}]] belong?`,
      options: opts(family, ['Alkanes', 'Alkenes', 'Alcohols', 'Carboxylic acids', 'Esters']),
      why: 'The functional group decides the family: -OH for alcohols, -COOH for carboxylic acids, C=C (formula CₙH₂ₙ) for alkenes, and CₙH₂ₙ₊₂ for alkanes.',
    };
  }),
  tpl('t-metal-acid', 'C1.1', 'KC', 1, (rng) => {
    const reagent = pick(rng, ['dilute hydrochloric acid', 'cold water'] as const);
    // Magnesium in cold water and lead in acid react too slowly to give a clear-cut answer.
    const usable = METALS.filter((m) => !(reagent.startsWith('dilute') && ['K', 'Na', 'Pb'].includes(m.sym)) && !(reagent === 'cold water' && m.sym === 'Mg'));
    const yes = usable.filter((m) => metalReaction(m.sym, reagent).reacts), no = usable.filter((m) => !metalReaction(m.sym, reagent).reacts);
    const wantNo = rng() < 0.5 && yes.length >= 3;
    const right = pick(rng, wantNo ? no : yes);
    return {
      stem: wantNo ? `Which metal does NOT react with ${reagent}?` : `Which metal reacts with ${reagent}?`,
      options: opts(cap(right.name), sample(rng, wantNo ? yes : no, 5).map((m) => cap(m.name))),
      why: reagent === 'cold water' ? 'Only the most reactive metals (potassium, sodium, calcium) react readily with cold water.' : 'Metals above hydrogen in the reactivity series displace hydrogen from dilute acids. Copper, silver and gold are below it.',
    };
  }),
  tpl('t-displace', 'C1.2', 'UK', 2, (rng) => {
    const target = METAL[pick(rng, ['Zn', 'Fe', 'Pb', 'Cu'])];
    const above = ['Mg', 'Zn', 'Fe', 'Pb'].map((s) => METAL[s]).filter((m) => m.rank < target.rank);
    const below = ['Zn', 'Fe', 'Pb', 'Cu', 'Ag', 'Au'].map((s) => METAL[s]).filter((m) => m.rank > target.rank);
    if (below.length < 3) {
      const right = pick(rng, below.length ? below : [METAL.Ag]);
      return {
        stem: `Which metal will NOT displace ${target.name} from a solution of one of its salts?`,
        options: opts(cap(right.name), sample(rng, above, 3).map((m) => cap(m.name)).concat(['Magnesium', 'Zinc', 'Iron'])),
        why: `Only a metal above ${target.name} in the reactivity series can displace it. ${cap(right.name)} is below it.`,
      };
    }
    const right = pick(rng, above);
    return {
      stem: `Which metal will displace ${target.name} from a solution of one of its salts?`,
      options: opts(cap(right.name), sample(rng, below, 3).map((m) => cap(m.name))),
      why: `A metal displaces any metal below it in the reactivity series. ${cap(right.name)} is above ${target.name}; the others are below it.`,
    };
  }),
  tpl('t-heat', 'C1.3', 'KC', 2, (rng) => {
    const [compound, products, why] = pick(rng, HEAT);
    return { stem: `What are the products when ${compound} is heated strongly?`, options: opts(cap(products), sample(rng, HEAT.map((h) => cap(h[1])).filter((p) => p !== cap(products)), 5)), why };
  }),
  tpl('t-extract', 'C2.1', 'KC', 1, (rng) => {
    const [m, method] = pick(rng, EXTRACTION);
    return {
      stem: `How is ${m} obtained from its ore?`,
      options: opts(method, ['Electrolysis of its molten compound', 'Heating its oxide with carbon', 'No chemical extraction: it occurs uncombined', 'Electrolysis of its aqueous solution', 'Heating its oxide in air']),
      why: 'Metals above carbon in the reactivity series need electrolysis; metals below carbon can be reduced with carbon; the least reactive are found uncombined.',
    };
  }),
  tpl('t-collect', 'C3.1', 'XS', 2, (rng) => {
    const g = pick(rng, GAS_TESTS.filter((x) => ['NH3', 'CO2', 'Cl2', 'H2', 'O2'].includes(x.formula)));
    const light = g.formula === 'NH3' || g.formula === 'H2';
    const right = g.formula === 'NH3' ? 'It is less dense than air and very soluble in water' : g.formula === 'H2' ? 'It is much less dense than air and almost insoluble in water' : g.formula === 'O2' ? 'It is only slightly soluble in water' : 'It is denser than air';
    const method = g.formula === 'NH3' ? 'upward delivery' : g.formula === 'H2' || g.formula === 'O2' ? 'collection over water' : 'downward delivery';
    return {
      stem: `${cap(g.gas)} can be collected by ${method}. Which property makes this method suitable?`,
      options: opts(right, [light ? 'It is denser than air' : 'It is less dense than air and very soluble in water', 'It is coloured', 'It reacts with air', 'It is very soluble in water and denser than air'].filter((x) => x !== right)),
      why: `${cap(g.gas)}: ${g.density.toLowerCase()}.`,
    };
  }),
  tpl('t-cation', 'C4.1', 'XS', 2, (rng) => {
    const c = pick(rng, CATIONS.filter((x) => x.id !== 'Pb'));
    const lower = (s: string) => s[0].toLowerCase() + s.slice(1).replace(/\.$/, '');
    return {
      stem: `A solution is tested. With sodium hydroxide solution: ${lower(c.naoh.few)}; in excess: ${lower(c.naoh.excess)}. With aqueous ammonia: ${lower(c.nh3.few)}; in excess: ${lower(c.nh3.excess)}. Which cation is present?`,
      options: opts(`[[${c.formula}]]`, sample(rng, CATIONS.filter((x) => x.id !== c.id && !(c.id === 'Al' && x.id === 'Pb')), 5).map((x) => `[[${x.formula}]]`)),
      why: `These are the results for ${c.name} ions.${c.naoh.equation ? ` [[${c.naoh.equation}]]` : ''}`,
    };
  }),
  tpl('t-anion', 'C4.2', 'XS', 2, (rng) => {
    const a = pick(rng, ANIONS);
    const t = Object.values(a.tests).find((x) => x.positive)!;
    return {
      stem: `A solution is tested with ${t.reagent}. Result: ${t.result} Which anion is present?`,
      options: opts(cap(a.name), sample(rng, ANIONS.filter((x) => x.id !== a.id), 5).map((x) => cap(x.name))),
      why: `This is the identifying test for ${a.name} ions.${t.equation ? ` [[${t.equation}]]` : ''}`,
    };
  }),
  tpl('t-gas', 'C4.3', 'XS', 1, (rng) => {
    const g = pick(rng, GAS_TESTS.filter((x) => x.formula !== 'H2O'));
    return {
      stem: `A gas is tested with: ${g.test.toLowerCase()}. Result: ${g.result} Which gas is it?`,
      options: opts(cap(g.gas), sample(rng, GAS_TESTS.filter((x) => x.formula !== g.formula && x.formula !== 'H2O'), 5).map((x) => cap(x.gas))),
      why: `That is the test for ${g.gas}.`,
    };
  }),
];

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

export const TEMPLATES_BY_OBJ: Record<string, Template[]> = {};
for (const t of TEMPLATES) (TEMPLATES_BY_OBJ[t.obj] ??= []).push(t);
export const TEMPLATE_BY_ID: Record<string, Template> = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));
