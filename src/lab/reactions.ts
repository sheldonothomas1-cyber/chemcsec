// The chemistry behind the virtual lab: what happens when substances are mixed, as a CSEC
// student would observe it. Pure data and functions (no UI), so every equation here is
// checked by the test suite. Observations follow standard school-laboratory descriptions.
import { balanceText } from '../chem/balance';

export interface Effects {
  /** 0 none, 1 slow bubbles ... 4 violent */
  bubbles?: number;
  flame?: string;
  liquid?: string;
  solid?: string;
  deposit?: string;
  precipitate?: string;
  glow?: boolean;
}

export interface Outcome {
  reacts: boolean;
  headline: string;
  observations: string[];
  equation?: string;
  explain: string;
  safety?: string;
  note?: string;
  effects: Effects;
}

const COL = {
  clear: '#dbeaf0', blue: '#3d8fe0', paleGreen: '#b9dfb0', green: '#6fae6b', brown: '#b5651d', orange: '#e8873a',
  yellow: '#f2d33c', white: '#f4f4f0', black: '#2b2b2b', grey: '#8a8f94', silver: '#c9ced3', redBrown: '#a14a2a',
  deepBlue: '#1b3fae', cream: '#efe3b8', lilac: '#b78be0', pink: '#f29bc4', purple: '#7a3fa0',
};
export const COLOURS = COL;

const balanced = (skeleton: string): string => {
  const b = balanceText(skeleton);
  if (!b) throw new Error(`Cannot balance ${skeleton}`);
  return b.text;
};

// ---------------------------------------------------------------- metals
export interface Metal {
  sym: string;
  name: string;
  charge: number;
  /** Position in the reactivity series, 0 = most reactive. */
  rank: number;
  look: string;
}
export const SERIES = ['K', 'Na', 'Ca', 'Mg', 'Al', 'C', 'Zn', 'Fe', 'Pb', 'H', 'Cu', 'Ag', 'Au'];
const metal = (sym: string, name: string, charge: number, look: string): Metal => ({ sym, name, charge, look, rank: SERIES.indexOf(sym) });
export const METALS: Metal[] = [
  metal('K', 'potassium', 1, 'soft, silvery, stored under oil'),
  metal('Na', 'sodium', 1, 'soft, silvery, stored under oil'),
  metal('Ca', 'calcium', 2, 'dull grey granules'),
  metal('Mg', 'magnesium', 2, 'silvery ribbon'),
  metal('Al', 'aluminium', 3, 'silvery foil'),
  metal('Zn', 'zinc', 2, 'grey granules'),
  metal('Fe', 'iron', 2, 'grey filings'),
  metal('Pb', 'lead', 2, 'dull grey foil'),
  metal('Cu', 'copper', 2, 'pink-brown turnings'),
  metal('Ag', 'silver', 1, 'shiny silver foil'),
  metal('Au', 'gold', 3, 'shiny yellow foil'),
];
export const METAL: Record<string, Metal> = Object.fromEntries(METALS.map((m) => [m.sym, m]));
const ion = (m: Metal) => (m.charge === 1 ? `${m.sym}+` : `${m.sym}^${m.charge}+`);
const chloride = (m: Metal) => `${m.sym}Cl${m.charge === 1 ? '' : m.charge}`;
const sulfate = (m: Metal) => (m.charge === 1 ? `${m.sym}2SO4` : m.charge === 2 ? `${m.sym}SO4` : `${m.sym}2(SO4)3`);

export type MetalReagent = 'cold water' | 'steam' | 'dilute hydrochloric acid' | 'dilute sulfuric acid' | 'oxygen (heated in air)';
export const METAL_REAGENTS: MetalReagent[] = ['cold water', 'steam', 'dilute hydrochloric acid', 'dilute sulfuric acid', 'oxygen (heated in air)'];

const none = (why: string): Outcome => ({ reacts: false, headline: 'No reaction', observations: ['No visible change.'], explain: why, effects: {} });

function withColdWater(m: Metal): Outcome {
  const eq = (sk: string) => balanced(sk);
  switch (m.sym) {
    case 'K': return {
      reacts: true, headline: 'Violent reaction',
      observations: ['The metal melts into a silvery ball and darts across the surface.', 'It catches fire at once and burns with a lilac flame.', 'Rapid fizzing; the metal disappears in seconds.', 'The water left behind turns universal indicator purple.'],
      equation: eq('K + H2O -> KOH + H2'), effects: { bubbles: 4, flame: COL.lilac, liquid: COL.clear },
      explain: 'Potassium is at the top of the reactivity series. Each atom loses its single outer electron very easily, forming K⁺ and releasing hydrogen. The solution is alkaline because potassium hydroxide forms.',
      safety: 'Only ever demonstrated by a teacher, with a tiny piece, behind a safety screen.',
    };
    case 'Na': return {
      reacts: true, headline: 'Vigorous reaction',
      observations: ['The metal melts into a silvery ball and darts across the surface.', 'Rapid fizzing as hydrogen is given off.', 'If the ball is held still, it burns with a yellow flame.', 'The water left behind turns universal indicator purple.'],
      equation: eq('Na + H2O -> NaOH + H2'), effects: { bubbles: 3, flame: COL.yellow, liquid: COL.clear },
      explain: 'Sodium loses its outer electron readily, forming Na⁺ and hydrogen. Sodium hydroxide makes the solution alkaline. It is a little less violent than potassium because its outer electron is closer to the nucleus.',
      safety: 'Teacher demonstration only, with a rice-grain sized piece.',
    };
    case 'Ca': return {
      reacts: true, headline: 'Steady reaction',
      observations: ['The granules sink, and a steady stream of bubbles rises.', 'The water turns cloudy white.', 'The test tube becomes warm.'],
      equation: eq('Ca + H2O -> Ca(OH)2 + H2'), effects: { bubbles: 2, liquid: '#e9ecea' },
      explain: 'Calcium is less reactive than sodium but still reacts with cold water. Calcium hydroxide is only slightly soluble, so most of it stays as a white suspension.',
    };
    case 'Mg': return {
      reacts: true, headline: 'Extremely slow reaction',
      observations: ['A few tiny bubbles collect on the ribbon over several days.', 'Nothing else appears to happen.'],
      equation: eq('Mg + H2O -> Mg(OH)2 + H2'), effects: { bubbles: 1 },
      explain: 'Magnesium reacts so slowly with cold water that you could miss it. A thin coating of insoluble magnesium hydroxide forms and slows the reaction further. With steam it reacts quickly.',
    };
    case 'Al': return none('Aluminium is fairly high in the series, but a thin, tough layer of aluminium oxide covers the surface and keeps the water away from the metal.');
    default: return none(`${cap(m.name)} is too low in the reactivity series to take oxygen from cold water.`);
  }
}

function withSteam(m: Metal): Outcome {
  switch (m.sym) {
    case 'K': case 'Na': case 'Ca':
      return { reacts: true, headline: 'Too dangerous to carry out', observations: ['Not attempted: this metal already reacts with cold water, and with steam the reaction would be explosive.'], explain: 'Metals at the top of the series react with cold water. Steam only makes the reaction faster and more violent.', effects: {}, safety: 'Never done in a school laboratory.' };
    case 'Mg': return {
      reacts: true, headline: 'Vigorous reaction',
      observations: ['The heated ribbon glows brightly and burns with a white flame in the steam.', 'A white powder is left behind.', 'The gas given off burns with a pop when lit.'],
      equation: balanced('Mg + H2O -> MgO + H2'), effects: { glow: true, flame: COL.white, solid: COL.white },
      explain: 'Hot magnesium takes the oxygen from steam, forming magnesium oxide and hydrogen. With steam a metal forms its oxide, not its hydroxide.',
    };
    case 'Al': return {
      reacts: true, headline: 'Reacts only if the oxide layer is removed',
      observations: ['Ordinary foil shows no change.', 'If the protective oxide layer is removed first, the metal reacts and a white solid forms.'],
      equation: balanced('Al + H2O -> Al2O3 + H2'), effects: { solid: COL.white },
      explain: 'Aluminium is reactive enough to take oxygen from steam, but its oxide coating normally protects it.',
    };
    case 'Zn': return {
      reacts: true, headline: 'Steady reaction',
      observations: ['The hot zinc glows.', 'A solid forms that is yellow while hot and white when cold.', 'Hydrogen is given off.'],
      equation: balanced('Zn + H2O -> ZnO + H2'), effects: { glow: true, solid: COL.yellow },
      explain: 'Zinc is above hydrogen, so when it is hot enough it removes oxygen from steam. Zinc oxide is yellow when hot and white when cold.',
    };
    case 'Fe': return {
      reacts: true, headline: 'Slow, reversible reaction',
      observations: ['Red-hot iron slowly turns black.', 'Hydrogen is given off slowly.'],
      equation: balanced('Fe + H2O -> Fe3O4 + H2'), effects: { glow: true, solid: COL.black },
      explain: 'Iron reacts only when red hot, and the reaction is reversible. The black solid is iron(II,III) oxide.',
    };
    default: return none(`${cap(m.name)} is below hydrogen in the reactivity series (or too close to it), so it cannot take oxygen from steam.`);
  }
}

function withAcid(m: Metal, acid: 'HCl' | 'H2SO4'): Outcome {
  const acidName = acid === 'HCl' ? 'hydrochloric' : 'sulfuric';
  const salt = acid === 'HCl' ? chloride(m) : sulfate(m);
  const eq = () => balanced(`${m.sym} + ${acid} -> ${salt} + H2`);
  const why = `${cap(m.name)} is above hydrogen in the reactivity series, so it displaces hydrogen from the acid: the metal atoms lose electrons to H⁺ ions.`;
  switch (m.sym) {
    case 'K': case 'Na':
      return { reacts: true, headline: 'Explosively violent', observations: ['Not attempted: the reaction is explosive.'], equation: eq(), explain: why + ' The reaction is far too fast to control.', effects: { bubbles: 4 }, safety: 'Never done, even as a demonstration.' };
    case 'Ca':
      return acid === 'H2SO4'
        ? { reacts: true, headline: 'Starts quickly, then slows', observations: ['Rapid fizzing at first.', 'The fizzing soon slows as a white coating forms on the metal.'], equation: eq(), explain: why + ' Calcium sulfate is only slightly soluble, so it coats the metal and keeps the acid away.', effects: { bubbles: 2, precipitate: COL.white } }
        : { reacts: true, headline: 'Vigorous reaction', observations: ['Very rapid fizzing.', 'The metal disappears quickly.', 'The test tube becomes hot.'], equation: eq(), explain: why, effects: { bubbles: 4, liquid: COL.clear } };
    case 'Mg':
      return { reacts: true, headline: 'Vigorous reaction', observations: ['Rapid fizzing.', 'The ribbon disappears, leaving a colourless solution.', 'The test tube becomes hot.', 'The gas pops with a lighted splint.'], equation: eq(), explain: why, effects: { bubbles: 3, liquid: COL.clear } };
    case 'Al':
      return { reacts: true, headline: 'Slow at first, then rapid', observations: ['Hardly any bubbles at first.', 'After a while the fizzing becomes rapid and the tube warms up.'], equation: eq(), explain: why + ' The delay is the acid dissolving the protective oxide layer.', effects: { bubbles: 3, liquid: COL.clear } };
    case 'Zn':
      return { reacts: true, headline: 'Steady reaction', observations: ['A steady stream of bubbles.', 'The zinc slowly dissolves, leaving a colourless solution.'], equation: eq(), explain: why, effects: { bubbles: 2, liquid: COL.clear } };
    case 'Fe':
      return { reacts: true, headline: 'Slow reaction', observations: ['Bubbles form slowly.', 'The solution gradually turns pale green.'], equation: eq(), explain: why + ' The pale green colour is the iron(II) ion.', effects: { bubbles: 1, liquid: COL.paleGreen } };
    case 'Pb':
      return { reacts: true, headline: 'Barely reacts', observations: ['Almost no bubbles.', 'The reaction soon stops.'], equation: eq(), explain: `Lead is only just above hydrogen, and the ${acid === 'HCl' ? 'lead(II) chloride' : 'lead(II) sulfate'} formed is insoluble, so it coats the metal and stops the reaction.`, effects: { bubbles: 1, precipitate: COL.white } };
    default:
      return none(`${cap(m.name)} is below hydrogen in the reactivity series, so it cannot displace hydrogen from dilute ${acidName} acid.`);
  }
}

function withOxygen(m: Metal): Outcome {
  const o = (headline: string, observations: string[], skeleton: string, effects: Effects, explain: string, note?: string): Outcome =>
    ({ reacts: true, headline, observations, equation: balanced(skeleton), effects, explain, note });
  switch (m.sym) {
    case 'K': return o('Burns fiercely', ['Burns with a lilac flame.', 'A white solid is left.'], 'K + O2 -> K2O', { flame: COL.lilac, solid: COL.white }, 'Potassium gives up its outer electron to oxygen very readily.', 'CSEC writes the product as potassium oxide. In plenty of oxygen other oxides form as well.');
    case 'Na': return o('Burns vigorously', ['Burns with a bright yellow flame.', 'A white solid is left.'], 'Na + O2 -> Na2O', { flame: COL.yellow, solid: COL.white }, 'Sodium atoms each lose one electron to oxygen, forming an ionic oxide that is strongly basic.', 'CSEC writes the product as sodium oxide. In plenty of oxygen some sodium peroxide forms as well.');
    case 'Ca': return o('Burns brightly', ['Burns with a brick-red flame.', 'A white solid is left.'], 'Ca + O2 -> CaO', { flame: '#d9552b', solid: COL.white }, 'Calcium forms calcium oxide (quicklime), a basic oxide.');
    case 'Mg': return o('Burns brilliantly', ['Burns with a dazzling white flame.', 'A white ash is left.'], 'Mg + O2 -> MgO', { flame: COL.white, solid: COL.white }, 'Each magnesium atom gives two electrons to oxygen, forming the ionic solid magnesium oxide.');
    case 'Al': return o('Burns only as a powder', ['Foil just loses its shine.', 'Powder burns with white sparks, leaving a white solid.'], 'Al + O2 -> Al2O3', { flame: COL.white, solid: COL.white }, 'The oxide layer that forms at once protects solid aluminium, so only fine powder burns.');
    case 'Zn': return o('Burns when strongly heated', ['Burns with a blue-green flame.', 'The solid formed is yellow when hot and white when cold.'], 'Zn + O2 -> ZnO', { flame: '#57c7b0', solid: COL.yellow }, 'Zinc forms zinc oxide, which is amphoteric.');
    case 'Fe': return o('Burns as filings or wool', ['Filings sprinkled into a flame give orange sparks.', 'A black solid is left.'], 'Fe + O2 -> Fe3O4', { flame: COL.orange, solid: COL.black }, 'A lump of iron only darkens, but finely divided iron has enough surface area to burn. The black solid is iron(II,III) oxide.');
    case 'Pb': return o('Does not burn; the surface oxidises', ['The metal melts.', 'A yellow powder forms on the surface.'], 'Pb + O2 -> PbO', { solid: COL.yellow }, 'Lead is low in the series, so it combines with oxygen only slowly, forming yellow lead(II) oxide.');
    case 'Cu': return o('Does not burn; the surface oxidises', ['The metal does not burn.', 'A black coating forms on the hot surface.'], 'Cu + O2 -> CuO', { solid: COL.black }, 'Copper is below hydrogen in the series. It reacts only on the surface, forming black copper(II) oxide.');
    default: return none(`${cap(m.name)} is so unreactive that it does not combine with oxygen even when heated. That is why it stays shiny.`);
  }
}

export function metalReaction(sym: string, reagent: MetalReagent): Outcome {
  const m = METAL[sym];
  switch (reagent) {
    case 'cold water': return withColdWater(m);
    case 'steam': return withSteam(m);
    case 'dilute hydrochloric acid': return withAcid(m, 'HCl');
    case 'dilute sulfuric acid': return withAcid(m, 'H2SO4');
    default: return withOxygen(m);
  }
}

// ---------------------------------------------------------------- displacement
export interface SaltSolution {
  cation: string; // metal symbol
  name: string;
  formula: string;
  colour: string;
  colourName: string;
}
export const SALT_SOLUTIONS: SaltSolution[] = [
  { cation: 'Mg', name: 'magnesium sulfate', formula: 'MgSO4', colour: COL.clear, colourName: 'colourless' },
  { cation: 'Zn', name: 'zinc sulfate', formula: 'ZnSO4', colour: COL.clear, colourName: 'colourless' },
  { cation: 'Fe', name: 'iron(II) sulfate', formula: 'FeSO4', colour: COL.paleGreen, colourName: 'pale green' },
  { cation: 'Pb', name: 'lead(II) nitrate', formula: 'Pb(NO3)2', colour: COL.clear, colourName: 'colourless' },
  { cation: 'Cu', name: 'copper(II) sulfate', formula: 'CuSO4', colour: COL.blue, colourName: 'blue' },
  { cation: 'Ag', name: 'silver nitrate', formula: 'AgNO3', colour: COL.clear, colourName: 'colourless' },
];
export const DIP_METALS = ['Mg', 'Zn', 'Fe', 'Pb', 'Cu', 'Ag'];
const DEPOSIT: Record<string, [string, string]> = {
  Mg: [COL.silver, 'silvery'], Zn: [COL.grey, 'grey'], Fe: ['#5a5f63', 'dark grey'], Pb: [COL.grey, 'grey, crystalline'],
  Cu: [COL.redBrown, 'red-brown'], Ag: [COL.silver, 'silvery, crystalline'],
};

export function displacement(metalSym: string, cation: string): Outcome {
  const m = METAL[metalSym];
  const other = METAL[cation];
  const sol = SALT_SOLUTIONS.find((s) => s.cation === cation)!;
  if (metalSym === cation) return none(`A metal cannot displace itself. ${cap(m.name)} atoms and ${m.name} ions simply swap places.`);
  if (m.rank > other.rank) {
    return { ...none(`${cap(m.name)} is less reactive than ${other.name}, so it cannot push ${other.name} out of its compound. The more reactive metal stays as ions.`), effects: { liquid: sol.colour } };
  }
  const after = SALT_SOLUTIONS.find((s) => s.cation === metalSym)!;
  const [depositColour, depositName] = DEPOSIT[cation];
  const colourChange = sol.colourName === after.colourName ? `The solution stays ${sol.colourName}.` : `The solution changes from ${sol.colourName} to ${after.colourName}.`;
  return {
    reacts: true, headline: 'Displacement reaction',
    observations: [`A ${depositName} solid (${other.name}) forms on the ${m.name}.`, colourChange, `The ${m.name} slowly gets smaller.`],
    equation: balanced(`${m.sym} + ${ion(other)} -> ${ion(m)} + ${other.sym}`),
    explain: `${cap(m.name)} is above ${other.name} in the reactivity series. Its atoms lose electrons (oxidation) to the ${other.name} ions, which gain them (reduction) and come out of solution as the metal.`,
    effects: { deposit: depositColour, liquid: after.colour },
  };
}

// ---------------------------------------------------------------- halogens
export const HALOGENS = [
  { sym: 'Cl', name: 'chlorine', water: 'chlorine water', colour: '#e3efc9', colourName: 'very pale green' },
  { sym: 'Br', name: 'bromine', water: 'bromine water', colour: COL.orange, colourName: 'orange' },
  { sym: 'I', name: 'iodine', water: 'iodine solution', colour: COL.brown, colourName: 'brown' },
];
export function halogenDisplacement(halogen: string, halide: string): Outcome {
  const order = ['Cl', 'Br', 'I'];
  const x = HALOGENS.find((h) => h.sym === halogen)!;
  const y = HALOGENS.find((h) => h.sym === halide)!;
  if (halogen === halide) return { ...none(`${cap(x.name)} cannot displace itself.`), effects: { liquid: x.colour } };
  if (order.indexOf(halogen) > order.indexOf(halide)) {
    return { ...none(`${cap(x.name)} is below ${y.name} in Group VII, so it is less reactive and cannot displace it. The mixture simply keeps the colour of the ${x.water}.`), effects: { liquid: x.colour } };
  }
  return {
    reacts: true, headline: 'Displacement reaction',
    observations: [`The colourless potassium ${y.name.replace('ine', 'ide')} solution turns ${y.colourName} as ${y.name} forms.`],
    equation: balanced(`${halogen}2 + ${halide}- -> ${halogen}- + ${halide}2`),
    explain: `${cap(x.name)} is higher in Group VII, so its atoms attract an extra electron more strongly. It takes electrons from the ${y.name.replace('ine', 'ide')} ions (oxidising them) and is itself reduced.`,
    effects: { liquid: y.colour },
  };
}

// ---------------------------------------------------------------- combining elements
export interface LabElement {
  sym: string;
  name: string;
  kind: 'metal' | 'nonmetal' | 'noble';
  /** Charge of the simple ion: positive for metals, negative for non-metals. */
  charge?: number;
  /** Molecule the element exists as, when it is diatomic. */
  molecule?: string;
}
export const LAB_ELEMENTS: LabElement[] = [
  { sym: 'Li', name: 'lithium', kind: 'metal', charge: 1 },
  { sym: 'Na', name: 'sodium', kind: 'metal', charge: 1 },
  { sym: 'K', name: 'potassium', kind: 'metal', charge: 1 },
  { sym: 'Mg', name: 'magnesium', kind: 'metal', charge: 2 },
  { sym: 'Ca', name: 'calcium', kind: 'metal', charge: 2 },
  { sym: 'Al', name: 'aluminium', kind: 'metal', charge: 3 },
  { sym: 'Zn', name: 'zinc', kind: 'metal', charge: 2 },
  { sym: 'Fe', name: 'iron', kind: 'metal' },
  { sym: 'Cu', name: 'copper', kind: 'metal' },
  { sym: 'H', name: 'hydrogen', kind: 'nonmetal', molecule: 'H2' },
  { sym: 'C', name: 'carbon', kind: 'nonmetal' },
  // No simple-ion charge here on purpose: most metals do not combine directly with nitrogen,
  // so the app only reports the nitrogen reactions it has checked (see KNOWN below).
  { sym: 'N', name: 'nitrogen', kind: 'nonmetal', molecule: 'N2' },
  { sym: 'O', name: 'oxygen', kind: 'nonmetal', charge: -2, molecule: 'O2' },
  { sym: 'S', name: 'sulfur', kind: 'nonmetal', charge: -2 },
  { sym: 'Cl', name: 'chlorine', kind: 'nonmetal', charge: -1, molecule: 'Cl2' },
  { sym: 'Br', name: 'bromine', kind: 'nonmetal', charge: -1, molecule: 'Br2' },
  { sym: 'He', name: 'helium', kind: 'noble' },
  { sym: 'Ne', name: 'neon', kind: 'noble' },
  { sym: 'Ar', name: 'argon', kind: 'noble' },
];
export const LAB_ELEMENT: Record<string, LabElement> = Object.fromEntries(LAB_ELEMENTS.map((e) => [e.sym, e]));

type Known = { eq: string; bond: 'ionic' | 'covalent'; product: string; headline: string; obs: string[]; effects: Effects; explain: string; note?: string };
const pairKey = (a: string, b: string) => [a, b].sort().join('+');
const KNOWN: Record<string, Known> = {};
const known = (a: string, b: string, k: Known) => (KNOWN[pairKey(a, b)] = k);

known('Na', 'Cl', { eq: '2Na + Cl2 -> 2NaCl', bond: 'ionic', product: 'sodium chloride', headline: 'Burns vigorously', obs: ['Hot sodium burns in chlorine with a bright yellow flame.', 'Clouds of white solid form: sodium chloride, common salt.'], effects: { flame: COL.yellow, solid: COL.white }, explain: 'Each sodium atom (2,8,1) gives its outer electron to a chlorine atom (2,8,7). Both end up with full outer shells as Na⁺ and Cl⁻, held together by electrostatic attraction.' });
known('Na', 'O', { eq: '4Na + O2 -> 2Na2O', bond: 'ionic', product: 'sodium oxide', headline: 'Burns vigorously', obs: ['Burns with a bright yellow flame.', 'A white solid is left.'], effects: { flame: COL.yellow, solid: COL.white }, explain: 'Two sodium atoms each give one electron to one oxygen atom, forming 2Na⁺ and O²⁻.', note: 'CSEC writes the product as sodium oxide; in plenty of oxygen some peroxide also forms.' });
known('K', 'Cl', { eq: '2K + Cl2 -> 2KCl', bond: 'ionic', product: 'potassium chloride', headline: 'Burns fiercely', obs: ['Burns with a lilac flame.', 'A white solid forms.'], effects: { flame: COL.lilac, solid: COL.white }, explain: 'Potassium loses its outer electron even more easily than sodium, forming K⁺ and Cl⁻.' });
known('K', 'O', { eq: '4K + O2 -> 2K2O', bond: 'ionic', product: 'potassium oxide', headline: 'Burns fiercely', obs: ['Burns with a lilac flame.', 'A white solid is left.'], effects: { flame: COL.lilac, solid: COL.white }, explain: 'Each potassium atom gives one electron to oxygen.', note: 'CSEC writes the product as potassium oxide; in plenty of oxygen other oxides also form.' });
known('Li', 'O', { eq: '4Li + O2 -> 2Li2O', bond: 'ionic', product: 'lithium oxide', headline: 'Burns steadily', obs: ['Burns with a crimson flame.', 'A white solid is left.'], effects: { flame: '#d11f3d', solid: COL.white }, explain: 'Each lithium atom gives one electron to oxygen, forming Li⁺ and O²⁻.' });
known('Li', 'Cl', { eq: '2Li + Cl2 -> 2LiCl', bond: 'ionic', product: 'lithium chloride', headline: 'Burns steadily', obs: ['Burns with a crimson flame.', 'A white solid forms.'], effects: { flame: '#d11f3d', solid: COL.white }, explain: 'Lithium gives its one outer electron to chlorine.' });
known('Mg', 'O', { eq: '2Mg + O2 -> 2MgO', bond: 'ionic', product: 'magnesium oxide', headline: 'Burns brilliantly', obs: ['Burns with a dazzling white flame.', 'A white ash is left.'], effects: { flame: COL.white, solid: COL.white }, explain: 'Each magnesium atom (2,8,2) gives two electrons to an oxygen atom (2,6), forming Mg²⁺ and O²⁻. The double charges make the lattice very strong, hence the very high melting point.' });
known('Mg', 'Cl', { eq: 'Mg + Cl2 -> MgCl2', bond: 'ionic', product: 'magnesium chloride', headline: 'Burns', obs: ['Hot magnesium burns in chlorine with a bright white flame.', 'A white solid forms.'], effects: { flame: COL.white, solid: COL.white }, explain: 'One magnesium atom gives one electron to each of two chlorine atoms, which is why the formula has two chlorines.' });
known('Mg', 'N', { eq: '3Mg + N2 -> Mg3N2', bond: 'ionic', product: 'magnesium nitride', headline: 'Reacts when burning', obs: ['Magnesium burning in air forms a little pale yellow magnesium nitride along with the white oxide.'], effects: { flame: COL.white, solid: '#e6dfa8' }, explain: 'Burning magnesium is hot enough to break the strong triple bond in nitrogen. Three Mg²⁺ ions balance two N³⁻ ions.' });
known('Mg', 'S', { eq: 'Mg + S -> MgS', bond: 'ionic', product: 'magnesium sulfide', headline: 'Reacts vigorously when heated', obs: ['The heated mixture reacts with a bright flash.', 'A white solid is left.'], effects: { flame: COL.white, solid: COL.white }, explain: 'Magnesium gives two electrons to sulfur, forming Mg²⁺ and S²⁻.' });
known('Ca', 'O', { eq: '2Ca + O2 -> 2CaO', bond: 'ionic', product: 'calcium oxide', headline: 'Burns brightly', obs: ['Burns with a brick-red flame.', 'A white solid (quicklime) is left.'], effects: { flame: '#d9552b', solid: COL.white }, explain: 'Calcium gives two electrons to oxygen, forming Ca²⁺ and O²⁻.' });
known('Ca', 'Cl', { eq: 'Ca + Cl2 -> CaCl2', bond: 'ionic', product: 'calcium chloride', headline: 'Burns', obs: ['Hot calcium burns in chlorine.', 'A white solid forms.'], effects: { flame: '#d9552b', solid: COL.white }, explain: 'One calcium atom gives one electron to each of two chlorine atoms.' });
known('Al', 'O', { eq: '4Al + 3O2 -> 2Al2O3', bond: 'ionic', product: 'aluminium oxide', headline: 'Powder burns', obs: ['Aluminium powder burns with white sparks.', 'A white solid is left. Foil only loses its shine.'], effects: { flame: COL.white, solid: COL.white }, explain: 'Two Al³⁺ ions (6+) balance three O²⁻ ions (6-), giving the formula Al₂O₃.' });
known('Al', 'Cl', { eq: '2Al + 3Cl2 -> 2AlCl3', bond: 'ionic', product: 'aluminium chloride', headline: 'Reacts when heated', obs: ['Heated aluminium glows in a stream of chlorine.', 'A pale solid collects in the cooler part of the tube.'], effects: { glow: true, solid: '#f0ead2' }, explain: 'The formula AlCl₃ follows from the charges Al³⁺ and Cl⁻.', note: 'Aluminium chloride has a lot of covalent character, but CSEC works out its formula from the ions.' });
known('Zn', 'O', { eq: '2Zn + O2 -> 2ZnO', bond: 'ionic', product: 'zinc oxide', headline: 'Burns when strongly heated', obs: ['Burns with a blue-green flame.', 'The solid is yellow when hot and white when cold.'], effects: { flame: '#57c7b0', solid: COL.yellow }, explain: 'Zinc gives two electrons to oxygen, forming Zn²⁺ and O²⁻.' });
known('Zn', 'S', { eq: 'Zn + S -> ZnS', bond: 'ionic', product: 'zinc sulfide', headline: 'Reacts violently when heated', obs: ['The heated mixture reacts with a sudden flash.', 'A pale solid is left.'], effects: { flame: COL.white, solid: '#eee8c9' }, explain: 'Zinc gives two electrons to sulfur.' });
known('Zn', 'Cl', { eq: 'Zn + Cl2 -> ZnCl2', bond: 'ionic', product: 'zinc chloride', headline: 'Reacts when heated', obs: ['Heated zinc reacts with chlorine.', 'A white solid forms.'], effects: { glow: true, solid: COL.white }, explain: 'One zinc atom gives one electron to each of two chlorine atoms.' });
known('Fe', 'S', { eq: 'Fe + S -> FeS', bond: 'ionic', product: 'iron(II) sulfide', headline: 'Reacts once heated', obs: ['The mixture glows red, and keeps glowing after the flame is removed.', 'A black solid is left that is no longer attracted to a magnet.'], effects: { glow: true, solid: COL.black }, explain: 'This is the classic proof that a compound is different from a mixture: before heating, a magnet pulls the iron out; afterwards the iron is chemically joined to the sulfur.' });
known('Fe', 'O', { eq: '3Fe + 2O2 -> Fe3O4', bond: 'ionic', product: 'iron(II,III) oxide', headline: 'Filings burn', obs: ['Iron filings sprinkled into a flame burn with orange sparks.', 'A black solid forms.'], effects: { flame: COL.orange, solid: COL.black }, explain: 'Finely divided iron has a large surface area, so it burns. In damp air iron reacts slowly instead, forming rust.' });
known('Fe', 'Cl', { eq: '2Fe + 3Cl2 -> 2FeCl3', bond: 'ionic', product: 'iron(III) chloride', headline: 'Reacts when heated', obs: ['Hot iron wool glows in chlorine.', 'A brown solid forms.'], effects: { glow: true, solid: COL.brown }, explain: 'Chlorine is a strong enough oxidising agent to take three electrons from each iron atom, giving Fe³⁺.' });
known('Cu', 'O', { eq: '2Cu + O2 -> 2CuO', bond: 'ionic', product: 'copper(II) oxide', headline: 'Surface reacts', obs: ['Copper does not burn.', 'A black coating forms on the hot metal.'], effects: { solid: COL.black }, explain: 'Copper is unreactive, so it only combines with oxygen at the surface.' });
known('Cu', 'Cl', { eq: 'Cu + Cl2 -> CuCl2', bond: 'ionic', product: 'copper(II) chloride', headline: 'Reacts when heated', obs: ['Hot copper glows in chlorine.', 'A brown-yellow solid forms; dissolved in water it gives a blue-green solution.'], effects: { glow: true, solid: '#9a7b3a' }, explain: 'Chlorine takes two electrons from each copper atom.' });
known('H', 'O', { eq: '2H2 + O2 -> 2H2O', bond: 'covalent', product: 'water', headline: 'Burns; explosive when mixed', obs: ['Pure hydrogen burns with an almost invisible pale blue flame.', 'A mixture of hydrogen and air explodes with a squeaky pop.', 'Droplets of water form on a cold surface.'], effects: { flame: '#9fc8f5', bubbles: 0 }, explain: 'Both are non-metals, so they share electrons. Each hydrogen shares one pair with oxygen, giving oxygen a full outer shell.' });
known('H', 'Cl', { eq: 'H2 + Cl2 -> 2HCl', bond: 'covalent', product: 'hydrogen chloride', headline: 'Explosive in sunlight', obs: ['In the dark nothing happens.', 'In bright light the mixture explodes.', 'The gas formed fumes in moist air.'], effects: { flame: COL.white }, explain: 'Hydrogen and chlorine each share one electron, forming a single covalent bond. Dissolved in water, hydrogen chloride becomes hydrochloric acid.', note: 'Demonstrated only by trained staff.' });
known('H', 'N', { eq: 'N2 + 3H2 <=> 2NH3', bond: 'covalent', product: 'ammonia', headline: 'Reacts only under special conditions', obs: ['Nothing happens at room temperature.', 'Industry uses about 450 °C, 200 atmospheres and an iron catalyst (the Haber process).', 'The reaction is reversible, so only part of the mixture becomes ammonia.'], effects: {}, explain: 'Nitrogen\'s triple bond is very strong, so a catalyst and high temperature are needed. Each nitrogen shares three pairs of electrons with hydrogen atoms.' });
known('H', 'S', { eq: 'H2 + S -> H2S', bond: 'covalent', product: 'hydrogen sulfide', headline: 'Reacts slowly when hot', obs: ['Hydrogen passed over hot sulfur slowly forms a gas that smells of rotten eggs.'], effects: {}, explain: 'Sulfur shares one pair of electrons with each of two hydrogen atoms, like oxygen does in water.', note: 'Hydrogen sulfide is poisonous.' });
known('H', 'Br', { eq: 'H2 + Br2 -> 2HBr', bond: 'covalent', product: 'hydrogen bromide', headline: 'Reacts when heated', obs: ['Reacts when heated with a catalyst, less readily than chlorine does.'], effects: {}, explain: 'A single covalent bond forms. Bromine is less reactive than chlorine, so the reaction is slower.' });
known('C', 'O', { eq: 'C + O2 -> CO2', bond: 'covalent', product: 'carbon dioxide', headline: 'Burns', obs: ['Charcoal glows red and burns.', 'A colourless gas forms that turns limewater milky.'], effects: { glow: true, flame: COL.orange }, explain: 'Carbon shares two pairs of electrons with each oxygen atom (two double bonds).', note: 'In a limited supply of air, poisonous carbon monoxide forms instead: [[2C + O2 -> 2CO]].' });
known('S', 'O', { eq: 'S + O2 -> SO2', bond: 'covalent', product: 'sulfur dioxide', headline: 'Burns', obs: ['Sulfur melts, then burns with a blue flame.', 'A choking, colourless gas forms that turns damp blue litmus red.'], effects: { flame: '#4a78e0' }, explain: 'Both are non-metals, so the oxide is covalent and acidic. Sulfur dioxide dissolved in rain is a cause of acid rain.' });
known('N', 'O', { eq: 'N2 + O2 -> 2NO', bond: 'covalent', product: 'nitrogen monoxide', headline: 'Reacts only at very high temperatures', obs: ['No reaction in ordinary conditions - air is a mixture of these two gases.', 'In lightning and inside car engines a little nitrogen monoxide forms.'], effects: {}, explain: 'The triple bond in nitrogen needs a great deal of energy to break. Oxides of nitrogen from engines contribute to acid rain.' });

const sub = (n: number) => (n === 1 ? '' : String(n));
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** What happens when two elements are brought together and heated. */
export function combineElements(a: string, b: string): Outcome & { product?: string; bond?: 'ionic' | 'covalent'; predicted?: boolean } {
  const A = LAB_ELEMENT[a];
  const B = LAB_ELEMENT[b];
  if (a === b) return none(`These are the same element. ${cap(A.name)} atoms can bond to each other, but no new substance forms.`);
  const noble = [A, B].find((e) => e.kind === 'noble');
  if (noble) return none(`${cap(noble.name)} is a noble gas. Its outer shell is already full, so it has no tendency to lose, gain or share electrons.`);
  const k = KNOWN[pairKey(a, b)];
  if (k) return { reacts: true, headline: k.headline, observations: k.obs, equation: k.eq, explain: k.explain, note: k.note, effects: k.effects, product: k.product, bond: k.bond };
  if (A.kind === 'metal' && B.kind === 'metal') {
    return none(`Two metals do not form a compound with each other: both tend to lose electrons, and neither will accept them. Melted together they form a mixture called an alloy.`);
  }
  const m = A.kind === 'metal' ? A : B.kind === 'metal' ? B : null;
  const x = m === A ? B : A;
  if (m && m.charge && x.charge) {
    const g = gcd(m.charge, -x.charge);
    const formula = `${m.sym}${sub(-x.charge / g)}${x.sym}${sub(m.charge / g)}`;
    const equation = balanced(`${m.sym} + ${x.molecule ?? x.sym} -> ${formula}`);
    return {
      reacts: true, predicted: true, bond: 'ionic', product: formula, headline: 'Forms an ionic compound', equation,
      observations: ['These elements combine directly when heated. The app has no recorded observations for this pair, so only the formula is shown.'],
      explain: `Each ${m.name} atom loses ${m.charge} ${m.charge === 1 ? 'electron' : 'electrons'} and each ${x.name} atom gains ${-x.charge}. The charges must cancel, which gives the formula.`,
      effects: { solid: COL.white },
    };
  }
  return { reacts: false, headline: 'Not a reaction you need for CSEC', observations: ['The app has no reliable school-level result for this pair, so it does not guess.'], explain: 'Try a metal with a non-metal to see ionic bonding, or two non-metals such as hydrogen and oxygen to see covalent bonding.', effects: {} };
}

// ---------------------------------------------------------------- ion tests
export interface TestResult {
  /** After a few drops, then after adding excess. */
  few: string;
  excess: string;
  precipitate?: string;
  dissolvesInExcess?: boolean;
  excessLiquid?: string;
  equation?: string;
  gas?: string;
}
export interface Cation {
  id: string;
  name: string;
  formula: string;
  solution: string;
  naoh: TestResult;
  nh3: TestResult;
  /** Potassium iodide solution: the test that separates lead(II) from aluminium. */
  ki: TestResult;
  extra?: string;
}
const hyd = (sym: string, n: number) => balanced(`${sym}^${n === 1 ? '' : n}+ + OH- -> ${sym}(OH)${n}`);
export const CATIONS: Cation[] = [
  { id: 'Ca', name: 'calcium', formula: 'Ca^2+', solution: COL.clear,
    naoh: { few: 'White precipitate.', excess: 'The precipitate does not dissolve.', precipitate: COL.white, equation: hyd('Ca', 2) },
    nh3: { few: 'No precipitate (or a very slight white one).', excess: 'No change.' },
    ki: { few: 'No visible change.', excess: 'No visible change.' } },
  { id: 'Al', name: 'aluminium', formula: 'Al^3+', solution: COL.clear,
    naoh: { few: 'White precipitate.', excess: 'The precipitate dissolves, giving a colourless solution.', precipitate: COL.white, dissolvesInExcess: true, equation: hyd('Al', 3) },
    nh3: { few: 'White precipitate.', excess: 'The precipitate does not dissolve.', precipitate: COL.white, equation: hyd('Al', 3) },
    ki: { few: 'No visible change.', excess: 'No visible change.' },
    extra: 'Potassium iodide gives no precipitate, which tells aluminium apart from lead.' },
  { id: 'Zn', name: 'zinc', formula: 'Zn^2+', solution: COL.clear,
    naoh: { few: 'White precipitate.', excess: 'The precipitate dissolves, giving a colourless solution.', precipitate: COL.white, dissolvesInExcess: true, equation: hyd('Zn', 2) },
    nh3: { few: 'White precipitate.', excess: 'The precipitate dissolves, giving a colourless solution.', precipitate: COL.white, dissolvesInExcess: true, equation: hyd('Zn', 2) },
    ki: { few: 'No visible change.', excess: 'No visible change.' } },
  { id: 'Pb', name: 'lead(II)', formula: 'Pb^2+', solution: COL.clear,
    naoh: { few: 'White precipitate.', excess: 'The precipitate dissolves, giving a colourless solution.', precipitate: COL.white, dissolvesInExcess: true, equation: hyd('Pb', 2) },
    nh3: { few: 'White precipitate.', excess: 'The precipitate does not dissolve.', precipitate: COL.white, equation: hyd('Pb', 2) },
    ki: { few: 'Bright yellow precipitate.', excess: 'The yellow precipitate remains.', precipitate: '#f2d33c', equation: 'Pb^2+ + 2I- -> PbI2' },
    extra: 'Potassium iodide gives a bright yellow precipitate of lead(II) iodide: [[Pb^2+ + 2I- -> PbI2]].' },
  { id: 'Cu', name: 'copper(II)', formula: 'Cu^2+', solution: COL.blue,
    naoh: { few: 'Blue precipitate.', excess: 'The precipitate does not dissolve.', precipitate: '#5fa8e8', equation: hyd('Cu', 2) },
    nh3: { few: 'Blue precipitate.', excess: 'The precipitate dissolves, giving a deep blue solution.', precipitate: '#5fa8e8', dissolvesInExcess: true, excessLiquid: COL.deepBlue, equation: hyd('Cu', 2) },
    ki: { few: 'The mixture turns brown and cloudy: iodine forms, with a white solid. (Beyond CSEC; not used to identify copper.)', excess: 'The brown colour remains.', precipitate: '#c9b08a', excessLiquid: '#b5651d', equation: '2Cu^2+ + 4I- -> 2CuI + I2' } },
  { id: 'Fe2', name: 'iron(II)', formula: 'Fe^2+', solution: COL.paleGreen,
    naoh: { few: 'Green precipitate.', excess: 'The precipitate does not dissolve. It slowly turns brown at the surface.', precipitate: '#4f7a45', equation: hyd('Fe', 2) },
    nh3: { few: 'Green precipitate.', excess: 'The precipitate does not dissolve.', precipitate: '#4f7a45', equation: hyd('Fe', 2) },
    ki: { few: 'No visible change.', excess: 'No visible change.' } },
  { id: 'Fe3', name: 'iron(III)', formula: 'Fe^3+', solution: '#e6c36a',
    naoh: { few: 'Red-brown precipitate.', excess: 'The precipitate does not dissolve.', precipitate: COL.redBrown, equation: hyd('Fe', 3) },
    nh3: { few: 'Red-brown precipitate.', excess: 'The precipitate does not dissolve.', precipitate: COL.redBrown, equation: hyd('Fe', 3) },
    ki: { few: 'The solution turns brown as iodine forms. (Beyond CSEC; iron(III) is an oxidising agent.)', excess: 'The brown colour remains.', equation: '2Fe^3+ + 2I- -> 2Fe^2+ + I2' } },
  { id: 'NH4', name: 'ammonium', formula: 'NH4+', solution: COL.clear,
    naoh: { few: 'No precipitate.', excess: 'On warming, a pungent gas is given off that turns damp red litmus blue.', gas: 'ammonia', equation: 'NH4+ + OH- -> NH3 + H2O' },
    nh3: { few: 'No change.', excess: 'No change.' },
    ki: { few: 'No visible change.', excess: 'No visible change.' } },
];

export interface AnionTest {
  reagent: string;
  result: string;
  precipitate?: string;
  bubbles?: boolean;
  equation?: string;
  positive?: boolean;
}
export interface Anion {
  id: string;
  name: string;
  formula: string;
  tests: Record<'acid' | 'barium' | 'silver' | 'nitrate', AnionTest>;
}
const REAGENT = {
  acid: 'dilute nitric acid',
  barium: 'barium nitrate solution, then dilute nitric acid',
  silver: 'dilute nitric acid, then silver nitrate solution',
  nitrate: 'sodium hydroxide and aluminium foil, then warm',
};
export const ANION_REAGENTS = REAGENT;
const noChange = (reagent: string): AnionTest => ({ reagent, result: 'No visible change.' });
export const ANIONS: Anion[] = [
  { id: 'CO3', name: 'carbonate', formula: 'CO3^2-', tests: {
    acid: { reagent: REAGENT.acid, result: 'Effervescence. The gas turns limewater milky (carbon dioxide).', bubbles: true, equation: 'CO3^2- + 2H+ -> CO2 + H2O', positive: true },
    barium: { reagent: REAGENT.barium, result: 'White precipitate, which dissolves with effervescence when the acid is added.', bubbles: true, equation: 'Ba^2+ + CO3^2- -> BaCO3' },
    silver: { reagent: REAGENT.silver, result: 'Effervescence with the acid; no precipitate remains.', bubbles: true },
    nitrate: noChange(REAGENT.nitrate) } },
  { id: 'SO4', name: 'sulfate', formula: 'SO4^2-', tests: {
    acid: noChange(REAGENT.acid),
    barium: { reagent: REAGENT.barium, result: 'White precipitate that does not dissolve in the acid.', precipitate: COL.white, equation: 'Ba^2+ + SO4^2- -> BaSO4', positive: true },
    silver: noChange(REAGENT.silver),
    nitrate: noChange(REAGENT.nitrate) } },
  { id: 'Cl', name: 'chloride', formula: 'Cl-', tests: {
    acid: noChange(REAGENT.acid), barium: noChange(REAGENT.barium),
    silver: { reagent: REAGENT.silver, result: 'White precipitate, which dissolves in aqueous ammonia.', precipitate: COL.white, equation: 'Ag+ + Cl- -> AgCl', positive: true },
    nitrate: noChange(REAGENT.nitrate) } },
  { id: 'Br', name: 'bromide', formula: 'Br-', tests: {
    acid: noChange(REAGENT.acid), barium: noChange(REAGENT.barium),
    silver: { reagent: REAGENT.silver, result: 'Cream precipitate, only partly soluble in aqueous ammonia.', precipitate: COL.cream, equation: 'Ag+ + Br- -> AgBr', positive: true },
    nitrate: noChange(REAGENT.nitrate) } },
  { id: 'I', name: 'iodide', formula: 'I-', tests: {
    acid: noChange(REAGENT.acid), barium: noChange(REAGENT.barium),
    silver: { reagent: REAGENT.silver, result: 'Pale yellow precipitate, insoluble in aqueous ammonia.', precipitate: '#f0e27a', equation: 'Ag+ + I- -> AgI', positive: true },
    nitrate: noChange(REAGENT.nitrate) } },
  { id: 'NO3', name: 'nitrate', formula: 'NO3-', tests: {
    acid: noChange(REAGENT.acid), barium: noChange(REAGENT.barium), silver: noChange(REAGENT.silver),
    nitrate: { reagent: REAGENT.nitrate, result: 'A pungent gas is given off that turns damp red litmus blue (ammonia).', bubbles: true, positive: true } } },
];

export const GAS_TESTS: { gas: string; formula: string; test: string; result: string; collect: string; dry: string; density: string }[] = [
  { gas: 'hydrogen', formula: 'H2', test: 'Lighted splint', result: 'Burns with a squeaky pop.', collect: 'Over water, or by upward delivery', dry: 'Concentrated sulfuric acid or calcium chloride', density: 'Much less dense than air; almost insoluble' },
  { gas: 'oxygen', formula: 'O2', test: 'Glowing splint', result: 'The splint relights.', collect: 'Over water', dry: 'Concentrated sulfuric acid or calcium chloride', density: 'Slightly denser than air; slightly soluble' },
  { gas: 'carbon dioxide', formula: 'CO2', test: 'Bubble through limewater', result: 'The limewater turns milky (white precipitate).', collect: 'Downward delivery, or over water', dry: 'Concentrated sulfuric acid or calcium chloride', density: 'Denser than air; slightly soluble' },
  { gas: 'ammonia', formula: 'NH3', test: 'Damp red litmus paper', result: 'The litmus turns blue. White fumes with hydrogen chloride.', collect: 'Upward delivery only', dry: 'Calcium oxide', density: 'Less dense than air; extremely soluble' },
  { gas: 'chlorine', formula: 'Cl2', test: 'Damp blue litmus paper', result: 'The litmus turns red, then is bleached white.', collect: 'Downward delivery', dry: 'Concentrated sulfuric acid', density: 'Denser than air; fairly soluble' },
  { gas: 'sulfur dioxide', formula: 'SO2', test: 'Acidified potassium dichromate(VI) paper', result: 'Turns from orange to green.', collect: 'Downward delivery', dry: 'Concentrated sulfuric acid', density: 'Denser than air; very soluble' },
  { gas: 'hydrogen chloride', formula: 'HCl', test: 'Ammonia gas, or damp blue litmus', result: 'Dense white fumes with ammonia; litmus turns red.', collect: 'Downward delivery', dry: 'Concentrated sulfuric acid', density: 'Denser than air; extremely soluble' },
  { gas: 'water vapour', formula: 'H2O', test: 'Anhydrous copper(II) sulfate, or cobalt chloride paper', result: 'White to blue; or blue to pink.', collect: '-', dry: '-', density: '-' },
];

// ---------------------------------------------------------------- electrolysis
export interface Cell {
  id: string;
  name: string;
  state: 'molten' | 'aqueous';
  electrodes: string;
  ions: string[];
  liquid: string;
  cathode: { product: string; half: string; observe: string; gas?: boolean; deposit?: string };
  anode: { product: string; half: string; observe: string; gas?: boolean; dissolves?: boolean };
  why: string;
  after: string;
}
export const CELLS: Cell[] = [
  { id: 'PbBr2', name: 'Molten lead(II) bromide', state: 'molten', electrodes: 'carbon (inert)', ions: ['Pb^2+', 'Br-'], liquid: '#e8d9b0',
    cathode: { product: 'lead', half: 'Pb^2+ + 2e- -> Pb', observe: 'Silvery beads of molten lead collect under the cathode.', deposit: COL.silver },
    anode: { product: 'bromine', half: '2Br- -> Br2 + 2e-', observe: 'Red-brown bromine vapour bubbles off.', gas: true },
    why: 'A molten binary salt contains only two kinds of ion, so there is no competition: the metal forms at the cathode and the non-metal at the anode.',
    after: 'The compound is split into its elements.' },
  { id: 'NaCl-l', name: 'Molten sodium chloride', state: 'molten', electrodes: 'carbon (inert)', ions: ['Na+', 'Cl-'], liquid: '#e9e6dc',
    cathode: { product: 'sodium', half: 'Na+ + e- -> Na', observe: 'Molten sodium forms at the cathode.', deposit: COL.silver },
    anode: { product: 'chlorine', half: '2Cl- -> Cl2 + 2e-', observe: 'Pale green chlorine gas bubbles off.', gas: true },
    why: 'With no water present there is no hydrogen ion to compete, so sodium itself is discharged. This is how sodium is manufactured.',
    after: 'The compound is split into its elements.' },
  { id: 'NaCl-conc', name: 'Concentrated sodium chloride solution (brine)', state: 'aqueous', electrodes: 'carbon (inert)', ions: ['Na+', 'Cl-', 'H+', 'OH-'], liquid: COL.clear,
    cathode: { product: 'hydrogen', half: '2H+ + 2e- -> H2', observe: 'Colourless gas bubbles off; it pops with a lighted splint.', gas: true },
    anode: { product: 'chlorine', half: '2Cl- -> Cl2 + 2e-', observe: 'Pale green gas bubbles off; it bleaches damp litmus.', gas: true },
    why: 'At the cathode H⁺ is discharged in preference to Na⁺, because sodium is far more reactive than hydrogen. At the anode the chloride ions are so concentrated that they are discharged instead of hydroxide.',
    after: 'Na⁺ and OH⁻ ions are left behind, so the solution becomes sodium hydroxide.' },
  { id: 'NaCl-dil', name: 'Very dilute sodium chloride solution', state: 'aqueous', electrodes: 'carbon (inert)', ions: ['Na+', 'Cl-', 'H+', 'OH-'], liquid: COL.clear,
    cathode: { product: 'hydrogen', half: '2H+ + 2e- -> H2', observe: 'Colourless gas bubbles off; it pops with a lighted splint.', gas: true },
    anode: { product: 'oxygen', half: '4OH- -> 2H2O + O2 + 4e-', observe: 'Colourless gas bubbles off; it relights a glowing splint.', gas: true },
    why: 'When the solution is very dilute there are too few chloride ions, so hydroxide ions from the water are discharged instead. In effect, water is being split.',
    after: 'The solution becomes slightly more concentrated as water is used up.' },
  { id: 'H2SO4', name: 'Dilute sulfuric acid', state: 'aqueous', electrodes: 'platinum (inert)', ions: ['H+', 'SO4^2-', 'OH-'], liquid: COL.clear,
    cathode: { product: 'hydrogen', half: '2H+ + 2e- -> H2', observe: 'Colourless gas bubbles off; it pops with a lighted splint.', gas: true },
    anode: { product: 'oxygen', half: '4OH- -> 2H2O + O2 + 4e-', observe: 'Colourless gas bubbles off; it relights a glowing splint.', gas: true },
    why: 'Sulfate ions are not discharged; hydroxide ions from the water lose electrons instead. Twice as much hydrogen as oxygen is collected, by volume.',
    after: 'Water is used up, so the acid becomes more concentrated.' },
  { id: 'CuSO4-inert', name: 'Copper(II) sulfate solution, carbon electrodes', state: 'aqueous', electrodes: 'carbon (inert)', ions: ['Cu^2+', 'SO4^2-', 'H+', 'OH-'], liquid: COL.blue,
    cathode: { product: 'copper', half: 'Cu^2+ + 2e- -> Cu', observe: 'A red-brown coating of copper forms on the cathode.', deposit: COL.redBrown },
    anode: { product: 'oxygen', half: '4OH- -> 2H2O + O2 + 4e-', observe: 'Colourless gas bubbles off; it relights a glowing splint.', gas: true },
    why: 'Copper is below hydrogen in the reactivity series, so Cu²⁺ is discharged in preference to H⁺. At the anode hydroxide is discharged in preference to sulfate.',
    after: 'The blue colour fades as copper ions are removed, and the solution becomes acidic.' },
  { id: 'CuSO4-Cu', name: 'Copper(II) sulfate solution, copper electrodes', state: 'aqueous', electrodes: 'copper (active)', ions: ['Cu^2+', 'SO4^2-', 'H+', 'OH-'], liquid: COL.blue,
    cathode: { product: 'copper', half: 'Cu^2+ + 2e- -> Cu', observe: 'The cathode gains a layer of pure copper and gets heavier.', deposit: COL.redBrown },
    anode: { product: 'copper ions', half: 'Cu -> Cu^2+ + 2e-', observe: 'The copper anode slowly dissolves and gets lighter. No gas.', dissolves: true },
    why: 'A copper anode is not inert: it is easier for the copper atoms of the anode to lose electrons than for any ion in solution to do so.',
    after: 'The blue colour stays the same, because copper ions enter the solution as fast as they leave. This is how copper is purified.' },
  { id: 'Al2O3', name: 'Molten aluminium oxide in cryolite', state: 'molten', electrodes: 'carbon', ions: ['Al^3+', 'O^2-'], liquid: '#e5d0b8',
    cathode: { product: 'aluminium', half: 'Al^3+ + 3e- -> Al', observe: 'Molten aluminium collects at the bottom of the cell.', deposit: COL.silver },
    anode: { product: 'oxygen', half: '2O^2- -> O2 + 4e-', observe: 'Oxygen is released and burns the hot carbon anodes away as carbon dioxide.', gas: true },
    why: 'Aluminium is too reactive to be extracted with carbon, so its oxide is electrolysed. Cryolite lets the cell run at about 950 °C instead of over 2000 °C.',
    after: 'The carbon anodes have to be replaced regularly.' },
];

// ---------------------------------------------------------------- rates model
export interface RateRun {
  concentration: number; // mol/dm3
  temperature: number; // °C
  size: 'large chips' | 'small chips' | 'powder';
}
export const ACID_VOLUME_CM3 = 10;
const SIZE_FACTOR = { 'large chips': 1, 'small chips': 2.5, powder: 6 };

/** Final volume of CO2 (cm3 at r.t.p.) from excess marble and the acid: 2 mol HCl give 1 mol CO2. */
export function finalGasVolume(run: RateRun): number {
  return ((run.concentration * ACID_VOLUME_CM3) / 1000 / 2) * 24000;
}
/**
 * Volume of gas after t seconds, from a simple teaching model: the acid is used up exponentially,
 * the rate doubles for each 10 °C rise and grows with surface area. Real results differ in detail.
 */
export function gasVolumeAt(run: RateRun, t: number): number {
  const k = 0.012 * SIZE_FACTOR[run.size] * 2 ** ((run.temperature - 25) / 10);
  return finalGasVolume(run) * (1 - Math.exp(-k * t));
}

// ---------------------------------------------------------------- titration model
/** pH in the flask when `added` cm3 of strong acid has been run into `flaskVol` cm3 of strong alkali. */
export function titrationPH(alkaliConc: number, flaskVol: number, acidConc: number, added: number): number {
  const excess = (alkaliConc * flaskVol - acidConc * added) / 1000; // mol of OH- left (negative: H+ in excess)
  const total = (flaskVol + added) / 1000;
  if (Math.abs(excess) < 1e-9) return 7;
  return excess > 0 ? 14 + Math.log10(excess / total) : -Math.log10(-excess / total);
}
export const INDICATORS = {
  phenolphthalein: { name: 'phenolphthalein', colour: (pH: number) => (pH >= 10 ? COL.pink : pH > 8.2 ? '#f9cfe2' : COL.clear), nameAt: (pH: number) => (pH > 8.2 ? 'pink' : 'colourless'), change: 'pink to colourless' },
  'methyl orange': { name: 'methyl orange', colour: (pH: number) => (pH > 4.4 ? COL.yellow : pH >= 3.1 ? COL.orange : '#e0463b'), nameAt: (pH: number) => (pH > 4.4 ? 'yellow' : pH >= 3.1 ? 'orange' : 'red'), change: 'yellow to orange' },
};

function cap(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}
