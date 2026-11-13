// Common ions, how to build an ionic formula from them, and the CSEC solubility rules.
// Shared by the question templates and the quick-reference page.

export interface Ion {
  formula: string; // mhchem style, e.g. "SO4^2-"
  core: string; // without the charge, e.g. "SO4"
  name: string; // as used in a compound name, e.g. "sulfate"
  charge: number;
  poly: boolean;
}
const ion = (core: string, charge: number, name: string): Ion => ({
  core, charge, name, poly: /[A-Z].*[A-Z]|\d/.test(core),
  formula: `${core}${Math.abs(charge) === 1 ? '' : '^' + Math.abs(charge)}${charge > 0 ? '+' : '-'}`,
});

export const CATION_LIST: Ion[] = [
  ion('H', 1, 'hydrogen'), ion('Na', 1, 'sodium'), ion('K', 1, 'potassium'), ion('Ag', 1, 'silver'), ion('NH4', 1, 'ammonium'),
  ion('Mg', 2, 'magnesium'), ion('Ca', 2, 'calcium'), ion('Ba', 2, 'barium'), ion('Zn', 2, 'zinc'), ion('Cu', 2, 'copper(II)'),
  ion('Fe', 2, 'iron(II)'), ion('Pb', 2, 'lead(II)'), ion('Fe', 3, 'iron(III)'), ion('Al', 3, 'aluminium'),
];
export const ANION_LIST: Ion[] = [
  ion('Cl', -1, 'chloride'), ion('Br', -1, 'bromide'), ion('I', -1, 'iodide'), ion('OH', -1, 'hydroxide'), ion('NO3', -1, 'nitrate'),
  ion('HCO3', -1, 'hydrogencarbonate'), ion('O', -2, 'oxide'), ion('S', -2, 'sulfide'), ion('SO4', -2, 'sulfate'), ion('CO3', -2, 'carbonate'),
  ion('PO4', -3, 'phosphate'),
];

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const part = (i: Ion, n: number) => (n === 1 ? i.core : i.poly ? `(${i.core})${n}` : `${i.core}${n}`);

/** Formula of the compound two ions make, with the charges cancelled: Al3+ and SO4 2- give Al2(SO4)3. */
export function ionicFormula(cation: Ion, anion: Ion, nCat?: number, nAn?: number): string {
  const g = gcd(cation.charge, -anion.charge);
  return part(cation, nCat ?? -anion.charge / g) + part(anion, nAn ?? cation.charge / g);
}
export const compoundName = (cation: Ion, anion: Ion) => `${cation.name} ${anion.name}`;

/**
 * Is this a real, stable compound a question can sensibly ask about? Some pairings that the
 * charges allow do not exist in practice (aluminium carbonate, iron(III) iodide, ...).
 */
export function plausible(cation: Ion, anion: Ion): boolean {
  const c = `${cation.core}${cation.charge}`, a = anion.core;
  if (a === 'HCO3') return ['Na1', 'K1', 'Ca2', 'Mg2'].includes(c);
  if (a === 'CO3') return !['Al3', 'Fe3'].includes(c);
  if (a === 'OH') return !['Ag1', 'NH41'].includes(c);
  if (a === 'O') return c !== 'NH41';
  if (a === 'I') return !['Cu2', 'Fe3'].includes(c);
  if (a === 'S') return !['Fe3', 'NH41'].includes(c);
  return true;
}

const ALWAYS = new Set(['Na', 'K', 'NH4']);
/** CSEC solubility rules. Returns null for the borderline cases a question should avoid. */
export function isSoluble(cation: Ion, anion: Ion): boolean | null {
  const c = cation.core, a = anion.core;
  if (c === 'H') return true;
  if (ALWAYS.has(c) || a === 'NO3' || a === 'HCO3') return true;
  if (a === 'Cl' || a === 'Br' || a === 'I') return !(c === 'Ag' || c === 'Pb');
  if (a === 'SO4') return c === 'Ca' || c === 'Ag' ? null : !(c === 'Ba' || c === 'Pb');
  if (a === 'OH' || a === 'O' || a === 'S') return c === 'Ca' || c === 'Ba' ? null : false;
  return false; // carbonates and phosphates of everything else
}

export const SOLUBILITY_RULES: [rule: string, exceptions: string][] = [
  ['All nitrates are soluble.', 'None.'],
  ['All sodium, potassium and ammonium salts are soluble.', 'None.'],
  ['Chlorides, bromides and iodides are soluble.', 'Except those of silver and lead(II).'],
  ['Sulfates are soluble.', 'Except barium sulfate and lead(II) sulfate; calcium sulfate is only slightly soluble.'],
  ['Carbonates are insoluble.', 'Except those of sodium, potassium and ammonium.'],
  ['Hydroxides and oxides are insoluble.', 'Except those of sodium and potassium; calcium hydroxide is slightly soluble.'],
];
