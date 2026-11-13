// All 118 elements. The numbers come from PubChem (public domain, US National Library of
// Medicine) via scripts/build-elements.mjs; the "For CSEC" notes are written for this app.
import raw from './elements.json';

export interface El {
  z: number;
  sym: string;
  name: string;
  mass: number | null;
  color: string | null;
  config: string;
  predicted: boolean;
  shells: number[];
  en: number | null; // Pauling electronegativity
  radius: number | null; // van der Waals radius, pm
  ie: number | null; // first ionisation energy, eV
  ea: number | null; // electron affinity, eV
  ox: string | null;
  state: string | null;
  stateKnown: boolean;
  mpK: number | null;
  bpK: number | null;
  density: number | null; // g/cm3
  cat: string;
  year: string | null;
  period: number;
  group: number; // 1-18, or 0 for the lanthanides and actinides
  x: number;
  y: number;
}

export const ALL_ELEMENTS = raw as El[];
export const EL_BY_SYMBOL: Record<string, El> = Object.fromEntries(ALL_ELEMENTS.map((e) => [e.sym, e]));

export const CATEGORIES: Record<string, { cls: string; label: string }> = {
  'Alkali metal': { cls: 'alkali', label: 'Alkali metals (Group I)' },
  'Alkaline earth metal': { cls: 'alkaline', label: 'Alkaline earth metals (Group II)' },
  'Transition metal': { cls: 'transition', label: 'Transition metals' },
  'Post-transition metal': { cls: 'post', label: 'Other metals' },
  Metalloid: { cls: 'metalloid', label: 'Metalloids' },
  Nonmetal: { cls: 'nonmetal', label: 'Non-metals' },
  Halogen: { cls: 'halogen', label: 'Halogens (Group VII)' },
  'Noble gas': { cls: 'noble', label: 'Noble gases (Group 0)' },
  Lanthanide: { cls: 'lanthanide', label: 'Lanthanides' },
  Actinide: { cls: 'actinide', label: 'Actinides' },
};

const ROMAN: Record<number, string> = { 1: 'I', 2: 'II', 13: 'III', 14: 'IV', 15: 'V', 16: 'VI', 17: 'VII', 18: '0' };
/** Group as CSEC names it (I to VII and 0), with the modern 1-18 number alongside. */
export function groupLabel(e: El): string {
  if (e.group === 0) return e.cat === 'Lanthanide' ? 'Lanthanide series' : 'Actinide series';
  return ROMAN[e.group] ? `Group ${ROMAN[e.group]} (column ${e.group})` : `Transition block (column ${e.group})`;
}

export const toC = (kelvin: number | null): number | null => (kelvin === null ? null : Math.round((kelvin - 273.15) * 10) / 10);

/** The simple ion CSEC expects for main-group elements, or null where there is no single answer. */
export function simpleIon(e: El): string | null {
  if (e.cat === 'Noble gas' || e.z === 1) return e.z === 1 ? 'H⁺' : null;
  const byGroup: Record<number, string> = { 1: '⁺', 2: '²⁺', 16: '²⁻', 17: '⁻' };
  if (byGroup[e.group] && e.z <= 56) return e.sym + byGroup[e.group];
  if (e.sym === 'Al') return 'Al³⁺';
  if (e.sym === 'N') return 'N³⁻';
  return null;
}

export interface Property {
  id: string;
  label: string;
  unit: string;
  get: (e: El) => number | null;
  note?: string;
}
export const PROPERTIES: Property[] = [
  { id: 'radius', label: 'Atomic radius', unit: 'pm', get: (e) => e.radius, note: 'Van der Waals radius.' },
  { id: 'en', label: 'Electronegativity', unit: '', get: (e) => e.en, note: 'Pauling scale: how strongly an atom attracts bonding electrons.' },
  { id: 'ie', label: 'First ionisation energy', unit: 'eV', get: (e) => e.ie, note: 'Energy needed to remove the outermost electron.' },
  { id: 'mp', label: 'Melting point', unit: '°C', get: (e) => toC(e.mpK) },
  { id: 'bp', label: 'Boiling point', unit: '°C', get: (e) => toC(e.bpK) },
  { id: 'density', label: 'Density', unit: 'g/cm³', get: (e) => e.density },
];

/** What a CSEC student should know about the elements that actually appear in the exam. */
export const CSEC_NOTES: Record<string, string> = {
  H: 'The lightest element; a diatomic gas, H₂. Test: a lighted splint gives a squeaky pop. Acids release H⁺ ions in water.',
  He: 'A noble gas with a full first shell of 2 electrons, so it does not react. Used in balloons because it is light and safe.',
  Li: 'Group I metal. Forms Li⁺. Floats and fizzes steadily on cold water - the least reactive of the Group I metals you meet.',
  C: 'Forms four covalent bonds. Diamond and graphite are both pure carbon (allotropes). The basis of organic chemistry; as coke it reduces iron ore in the blast furnace.',
  N: 'About 78% of air. N₂ has a triple bond, so it is unreactive. Combined with hydrogen in the Haber process to make ammonia for fertilisers.',
  O: 'About 21% of air; a diatomic gas, O₂. Test: relights a glowing splint. Forms the O²⁻ ion in metal oxides.',
  F: 'The most reactive halogen. Forms F⁻.',
  Ne: 'A noble gas with a full outer shell (2,8). Unreactive; used in advertising signs.',
  Na: 'Group I metal, stored under oil. Forms Na⁺. Melts into a ball and darts about on cold water, giving sodium hydroxide and hydrogen.',
  Mg: 'Group II metal. Forms Mg²⁺. Burns with a brilliant white flame; reacts with steam and with dilute acids.',
  Al: 'Forms Al³⁺. Extracted from bauxite by electrolysis. A thin oxide layer protects it from corrosion. Its oxide and hydroxide are amphoteric.',
  Si: 'A metalloid with a giant covalent structure. Silicon dioxide is the main substance in sand, and is removed as slag in the blast furnace.',
  P: 'A non-metal whose oxide is acidic. One of the three main elements in NPK fertilisers.',
  S: 'A yellow non-metal. Burns with a blue flame to sulfur dioxide, a cause of acid rain. The raw material for sulfuric acid (Contact process).',
  Cl: 'A halogen: a pale green, poisonous gas, Cl₂. Forms Cl⁻. Test: turns damp blue litmus red, then bleaches it. Used to sterilise water.',
  Ar: 'A noble gas, about 1% of air. Unreactive, so it is used to fill light bulbs and to shield metals during welding.',
  K: 'Group I metal, more reactive than sodium. Forms K⁺. Catches fire on cold water and burns with a lilac flame.',
  Ca: 'Group II metal. Forms Ca²⁺. Fizzes steadily in cold water. Found in limestone (calcium carbonate), quicklime and slaked lime.',
  V: 'Vanadium(V) oxide is the catalyst in the Contact process for making sulfuric acid.',
  Cr: 'Acidified potassium dichromate(VI) is orange; a reducing agent turns it green as chromium(III) forms.',
  Mn: 'Acidified potassium manganate(VII) is purple and turns colourless with a reducing agent. Manganese(IV) oxide catalyses the decomposition of hydrogen peroxide.',
  Fe: 'A transition metal forming Fe²⁺ (green hydroxide) and Fe³⁺ (red-brown hydroxide). Extracted in the blast furnace; rusts when both water and oxygen are present. The catalyst in the Haber process.',
  Ni: 'The catalyst for adding hydrogen to alkenes.',
  Cu: 'Below hydrogen in the reactivity series, so it does not react with dilute acids. Cu²⁺ solutions are blue and give a blue precipitate with sodium hydroxide. Purified by electrolysis.',
  Zn: 'Forms Zn²⁺. Used to galvanise iron. Its white hydroxide dissolves in excess sodium hydroxide and in excess aqueous ammonia.',
  Br: 'A halogen: a red-brown liquid. Bromine water turns from orange-brown to colourless with an alkene.',
  Ag: 'An unreactive metal. Acidified silver nitrate solution is the test for chloride (white), bromide (cream) and iodide (yellow) ions.',
  I: 'A halogen: a grey-black solid that sublimes to a purple vapour. The least reactive of the common halogens; iodine solution is brown.',
  Ba: 'Group II metal. Acidified barium chloride or barium nitrate solution gives a white precipitate with sulfate ions.',
  Pt: 'A very unreactive metal used for inert electrodes.',
  Au: 'So unreactive that it is found uncombined in nature.',
  Hg: 'The only metal that is liquid at room temperature.',
  Pb: 'Forms Pb²⁺. Lead(II) iodide is a bright yellow precipitate, and molten lead(II) bromide is the classic electrolysis example. Lead compounds are poisonous.',
};
