// Builds src/data/elements.json (all 118 elements) from PubChem's periodic table dataset.
// PubChem is run by the US National Library of Medicine and its data is in the public domain.
// Run when you want to refresh the data:  node scripts/build-elements.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const SOURCE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON';
const CACHE = new URL('../pipeline/out/pubchem-elements.json', import.meta.url);
const OUT = new URL('../src/data/elements.json', import.meta.url);

let raw;
try {
  raw = JSON.parse(await readFile(CACHE, 'utf8'));
} catch {
  const res = await fetch(SOURCE, { headers: { 'User-Agent': 'ChemCSEC-harvester/0.1 (study tool)' } });
  if (!res.ok) throw new Error(`PubChem returned ${res.status}`);
  raw = await res.json();
}

const cols = raw.Table.Columns.Column;
const rows = raw.Table.Row.map((r) => Object.fromEntries(r.Cell.map((v, i) => [cols[i], v])));

// Noble-gas cores, written out so "[Ar]4s2 3d6" can be expanded into electrons per shell.
const CORE = { He: '1s2', Ne: '[He]2s2 2p6', Ar: '[Ne]3s2 3p6', Kr: '[Ar]4s2 3d10 4p6', Xe: '[Kr]5s2 4d10 5p6', Rn: '[Xe]6s2 4f14 5d10 6p6' };
function shells(config) {
  let c = config.replace(/\(.*?\)/g, '').trim();
  for (let guard = 0; guard < 8 && /\[(\w+)\]/.test(c); guard++) c = c.replace(/\[(\w+)\]/, (_, g) => CORE[g] + ' ');
  const out = [];
  for (const [, n, , count] of c.matchAll(/(\d)([spdf])(\d+)/g)) out[n - 1] = (out[n - 1] ?? 0) + Number(count);
  return Array.from(out, (x) => x ?? 0);
}

const PERIOD_START = [1, 3, 11, 19, 37, 55, 87, 119];
function position(z) {
  const period = PERIOD_START.findIndex((s, i) => z >= s && z < PERIOD_START[i + 1]) + 1;
  const i = z - PERIOD_START[period - 1] + 1; // place within the period, from 1
  if (period === 1) return { period, group: z === 1 ? 1 : 18, x: z === 1 ? 1 : 18, y: 1 };
  if (period <= 3) {
    const group = i <= 2 ? i : i + 10;
    return { period, group, x: group, y: period };
  }
  if (period <= 5) return { period, group: i, x: i, y: period };
  // Periods 6 and 7: fifteen f-block elements (La-Lu, Ac-Lr) sit in their own rows below.
  if (i <= 2) return { period, group: i, x: i, y: period };
  if (i <= 17) return { period, group: 0, x: i, y: period + 3 };
  return { period, group: i - 14, x: i - 14, y: period };
}

const num = (v) => (v === '' || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));
const elements = rows.map((r) => {
  const z = Number(r.AtomicNumber);
  const sh = shells(r.ElectronConfiguration);
  const total = sh.reduce((a, b) => a + b, 0);
  if (total !== z) throw new Error(`${r.Symbol}: shells ${sh} add up to ${total}, expected ${z}`);
  return {
    z, sym: r.Symbol, name: r.Name, mass: num(r.AtomicWeight), color: r.CPKHexColor || null,
    config: r.ElectronConfiguration.replace(/\s*\(.*?\)/g, ''), predicted: /predicted|calculated/i.test(r.ElectronConfiguration),
    shells: sh, en: num(r.Electronegativity), radius: num(r.AtomicRadius), ie: num(r.IonizationEnergy), ea: num(r.ElectronAffinity),
    ox: r.OxidationStates || null, state: r.StandardState.replace(/^Expected to be a /, '') || null, stateKnown: !/^Expected/.test(r.StandardState),
    mpK: num(r.MeltingPoint), bpK: num(r.BoilingPoint), density: num(r.Density), cat: r.GroupBlock, year: r.YearDiscovered || null,
    ...position(z),
  };
});

if (elements.length !== 118) throw new Error(`expected 118 elements, got ${elements.length}`);
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(OUT, JSON.stringify(elements));
const cats = [...new Set(elements.map((e) => e.cat))];
console.log(`wrote ${elements.length} elements; categories: ${cats.join(', ')}`);
console.log('checks:', ['Fe', 'Cu', 'Ca', 'La', 'Lu', 'Hf', 'Og'].map((s) => { const e = elements.find((x) => x.sym === s); return `${s} g${e.group} p${e.period} (${e.x},${e.y}) ${e.shells.join(',')}`; }).join(' | '));
