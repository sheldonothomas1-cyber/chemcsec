// Visual breakdowns for organic chemistry: displayed formulae drawn from a tiny molecule
// description, and the fractionating tower.
import { useState } from 'react';
import { Rich } from '../components/Rich';
import { parseSpecies } from '../chem/formula';
import { Picker } from '../lab/Vessel';

interface Atom { el: string; x: number; y: number; mark?: boolean }
interface Bond { a: number; b: number; order: 1 | 2 }
export interface Molecule { atoms: Atom[]; bonds: Bond[] }

const VALENCE: Record<string, number> = { C: 4, H: 1, O: 2 };

/** A straight carbon chain with every hydrogen drawn, optionally with a C=C, an -OH or a -COOH end. */
export function chain(n: number, opts: { double?: number; end?: 'OH' | 'COOH' } = {}): Molecule {
  const atoms: Atom[] = [];
  const bonds: Bond[] = [];
  const add = (el: string, x: number, y: number, mark = false) => atoms.push({ el, x, y, mark }) - 1;
  const link = (a: number, b: number, order: 1 | 2 = 1) => bonds.push({ a, b, order });
  const carbons = Array.from({ length: n }, (_, i) => add('C', i * 2, 0));
  for (let i = 0; i < n - 1; i++) link(carbons[i], carbons[i + 1], opts.double === i ? 2 : 1);
  carbons.forEach((c, i) => {
    const last = i === n - 1;
    let used = (i > 0 ? (opts.double === i - 1 ? 2 : 1) : 0) + (!last ? (opts.double === i ? 2 : 1) : 0);
    const free: [number, number][] = [[0, -2], [0, 2]];
    if (i === 0) free.push([-2, 0]);
    if (last) free.push([2, 0]);
    if (last && opts.end === 'OH') {
      const o = add('O', i * 2 + 2, 0, true);
      link(c, o);
      link(o, add('H', i * 2 + 4, 0, true));
      used += 1;
      free.pop();
    }
    if (last && opts.end === 'COOH') {
      link(c, add('O', i * 2, -2, true), 2);
      const o = add('O', i * 2 + 2, 0, true);
      link(c, o);
      link(o, add('H', i * 2 + 4, 0, true));
      return;
    }
    for (const [dx, dy] of free.slice(0, 4 - used)) link(c, add('H', i * 2 + dx, dy));
  });
  return { atoms, bonds };
}

/** 2-methylpropane and ethyl ethanoate do not fit the straight-chain builder, so they are laid out by hand. */
const METHYLPROPANE: Molecule = (() => {
  const m = chain(3);
  const mid = 1;
  // Replace the lower hydrogen on the middle carbon with a CH3 group.
  const lower = m.atoms.findIndex((a) => a.el === 'H' && a.x === 2 && a.y === 2);
  m.atoms[lower] = { el: 'C', x: 2, y: 2 };
  for (const [x, y] of [[0, 2], [4, 2], [2, 4]]) m.bonds.push({ a: lower, b: m.atoms.push({ el: 'H', x, y }) - 1, order: 1 });
  void mid;
  return m;
})();
const ETHYL_ETHANOATE: Molecule = (() => {
  const atoms: Atom[] = [
    { el: 'C', x: 0, y: 0 }, { el: 'C', x: 2, y: 0 }, { el: 'O', x: 2, y: -2, mark: true }, { el: 'O', x: 4, y: 0, mark: true }, { el: 'C', x: 6, y: 0 }, { el: 'C', x: 8, y: 0 },
    { el: 'H', x: -2, y: 0 }, { el: 'H', x: 0, y: -2 }, { el: 'H', x: 0, y: 2 }, { el: 'H', x: 6, y: -2 }, { el: 'H', x: 6, y: 2 }, { el: 'H', x: 8, y: -2 }, { el: 'H', x: 8, y: 2 }, { el: 'H', x: 10, y: 0 },
  ];
  const b = (a: number, c: number, order: 1 | 2 = 1): Bond => ({ a, b: c, order });
  return { atoms, bonds: [b(0, 1), b(1, 2, 2), b(1, 3), b(3, 4), b(4, 5), b(0, 6), b(0, 7), b(0, 8), b(4, 9), b(4, 10), b(5, 11), b(5, 12), b(5, 13)] };
})();

/** Checks a drawing: every atom must have exactly the number of bonds its valence allows. */
export function valencesOk(m: Molecule): boolean {
  const count = m.atoms.map(() => 0);
  for (const bd of m.bonds) {
    count[bd.a] += bd.order;
    count[bd.b] += bd.order;
  }
  return m.atoms.every((a, i) => count[i] === VALENCE[a.el]);
}
export function molecularFormula(m: Molecule): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of m.atoms) out[a.el] = (out[a.el] ?? 0) + 1;
  return out;
}

export function MoleculeDrawing({ m, label }: { m: Molecule; label: string }) {
  const U = 17;
  const xs = m.atoms.map((a) => a.x), ys = m.atoms.map((a) => a.y);
  const minX = Math.min(...xs) - 1, minY = Math.min(...ys) - 1;
  const w = (Math.max(...xs) - minX + 1) * U, h = (Math.max(...ys) - minY + 1) * U;
  const px = (a: Atom) => (a.x - minX) * U, py = (a: Atom) => (a.y - minY) * U;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={Math.min(w * 1.25, 340)} role="img" aria-label={`Displayed formula of ${label}`}>
      {m.bonds.map((bd, i) => {
        const a = m.atoms[bd.a], c = m.atoms[bd.b];
        const horizontal = a.y === c.y;
        const off = bd.order === 2 ? 2.6 : 0;
        return [-1, 1].slice(0, bd.order).map((s) => (
          <line key={`${i}${s}`} x1={px(a) + (horizontal ? 0 : s * off)} y1={py(a) + (horizontal ? s * off : 0)} x2={px(c) + (horizontal ? 0 : s * off)} y2={py(c) + (horizontal ? s * off : 0)} stroke="var(--ink)" strokeWidth="1.5" />
        ));
      })}
      {m.atoms.map((a, i) => (
        <g key={i}>
          <circle cx={px(a)} cy={py(a)} r="7.5" fill={a.mark ? 'var(--orange-soft)' : 'var(--surface)'} />
          <text x={px(a)} y={py(a)} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight={a.el === 'H' ? 500 : 700} fill={a.mark ? 'var(--orange)' : 'var(--ink)'}>{a.el}</text>
        </g>
      ))}
    </svg>
  );
}

const STEM = ['', 'meth', 'eth', 'prop', 'but', 'pent', 'hex'];
export const HYDROCARBONS: { name: string; formula: string; m: Molecule; family: 'alkane' | 'alkene'; note?: string }[] = [
  ...[1, 2, 3, 4, 5].map((n) => ({ name: `${STEM[n]}ane`, formula: `C${n === 1 ? '' : n}H${2 * n + 2}`, m: chain(n), family: 'alkane' as const })),
  { name: '2-methylpropane', formula: 'C4H10', m: METHYLPROPANE, family: 'alkane', note: 'An isomer of butane: the same molecular formula, but the carbon atoms are joined in a branched arrangement.' },
  ...[2, 3, 4].map((n) => ({ name: n === 4 ? 'but-1-ene' : `${STEM[n]}ene`, formula: `C${n}H${2 * n}`, m: chain(n, { double: 0 }), family: 'alkene' as const })),
];
export const ORGANIC_FAMILY: { name: string; formula: string; m: Molecule; group: string; text: string }[] = [
  { name: 'ethanol', formula: 'C2H5OH', m: chain(2, { end: 'OH' }), group: 'hydroxyl group, -OH', text: 'An alcohol. Burns, reacts with sodium, and is oxidised to ethanoic acid by acidified potassium dichromate(VI).' },
  { name: 'ethanoic acid', formula: 'CH3COOH', m: chain(2, { end: 'COOH' }), group: 'carboxyl group, -COOH', text: 'A weak acid: only the hydrogen on the -COOH group can be released as an ion. Reacts with metals, bases and carbonates.' },
  { name: 'ethyl ethanoate', formula: 'CH3COOC2H5', m: ETHYL_ETHANOATE, group: 'ester link, -COO-', text: 'An ester, made when ethanoic acid and ethanol join and a molecule of water is lost. Esters have sweet, fruity smells.' },
];

const formulaOf = (m: Molecule) => {
  const f = molecularFormula(m);
  return ['C', 'H', 'O'].filter((e) => f[e]).map((e) => `${e}${f[e] === 1 ? '' : f[e]}`).join('');
};

export function HydrocarbonVisual() {
  const [name, setName] = useState('butane');
  const h = HYDROCARBONS.find((x) => x.name === name)!;
  const atoms = parseSpecies(h.formula).atoms;
  return (
    <div className="visual">
      <Picker label="Molecule" options={HYDROCARBONS.map((x) => x.name)} value={name} onChange={setName} />
      <div className="visual-row"><MoleculeDrawing m={h.m} label={h.name} /></div>
      <dl className="facts-list">
        <div><dt>Molecular formula</dt><dd><Rich text={`[[${formulaOf(h.m)}]]`} /></dd></div>
        <div><dt>Family</dt><dd>{h.family === 'alkane' ? 'alkane, CₙH₂ₙ₊₂' : 'alkene, CₙH₂ₙ'}</dd></div>
        <div><dt>Bonding</dt><dd>{h.family === 'alkane' ? 'single bonds only (saturated)' : 'contains C=C (unsaturated)'}</dd></div>
        <div><dt>Atoms</dt><dd>{atoms.C} carbon, {atoms.H} hydrogen</dd></div>
      </dl>
      <p>{h.note ?? (h.family === 'alkane'
        ? 'Every carbon has four single bonds. With no room to add anything, alkanes react by substitution: a hydrogen is swapped for a halogen in ultraviolet light.'
        : 'The double bond can open so that each carbon bonds to something new. That is addition, and it is why alkenes decolourise bromine water at once.')}</p>
    </div>
  );
}

export function OrganicFamilyVisual() {
  const [name, setName] = useState('ethanol');
  const o = ORGANIC_FAMILY.find((x) => x.name === name)!;
  return (
    <div className="visual">
      <Picker label="Compound" options={ORGANIC_FAMILY.map((x) => x.name)} value={name} onChange={setName} />
      <div className="visual-row"><MoleculeDrawing m={o.m} label={o.name} /></div>
      <p><span className="chip new">Functional group</span> {o.group} (highlighted)</p>
      <p>{o.text}</p>
      <p className="equation"><Rich text="[[CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O]]" /></p>
      <p className="small muted">Acid + alcohol gives ester + water, with concentrated sulfuric acid as the catalyst.</p>
    </div>
  );
}

// ------------------------------------------------------------------ fractionating tower
const FRACTIONS = [
  { name: 'Refinery gas', carbons: 'C1 to C4', boil: 'below 40 °C', use: 'Bottled cooking gas (LPG) and fuel for the refinery itself.', colour: '#f6e7a1' },
  { name: 'Petrol (gasoline)', carbons: 'C5 to C10', boil: '40 to 175 °C', use: 'Fuel for cars.', colour: '#f2c96b' },
  { name: 'Kerosene', carbons: 'C10 to C16', boil: '150 to 240 °C', use: 'Jet fuel, and fuel for lamps and stoves.', colour: '#e6a34f' },
  { name: 'Diesel', carbons: 'C14 to C20', boil: '220 to 350 °C', use: 'Fuel for trucks, buses, boats and generators.', colour: '#c97b3a' },
  { name: 'Fuel and lubricating oils', carbons: 'C20 to C50', boil: 'above 350 °C', use: 'Fuel for ships and power stations; lubricants and waxes.', colour: '#8a5a33' },
  { name: 'Bitumen', carbons: 'above C50', boil: 'residue, does not boil off', use: 'Surfacing roads and waterproofing roofs.', colour: '#3a2c24' },
];
export function ColumnVisual() {
  const [i, setI] = useState(1);
  const f = FRACTIONS[i];
  return (
    <div className="visual">
      <div className="visual-row">
        <svg viewBox="0 0 230 250" width="250" role="img" aria-label="Fractionating tower with six fractions, coolest at the top">
          <rect x="60" y="14" width="70" height="222" rx="12" fill="var(--sunk)" stroke="var(--ink)" strokeWidth="2" />
          {FRACTIONS.map((fr, k) => (
            <g key={fr.name} onClick={() => setI(k)} style={{ cursor: 'pointer' }}>
              <rect x="62" y={18 + k * 36} width="66" height="34" fill={fr.colour} opacity={k === i ? 1 : 0.55} />
              <line x1="130" x2="150" y1={35 + k * 36} y2={35 + k * 36} stroke="var(--ink)" strokeWidth="1.5" />
              <text x="154" y={38 + k * 36} fontSize="9.5" fontWeight={k === i ? 700 : 400} fill="var(--ink)">{fr.name.split(' ')[0]}</text>
            </g>
          ))}
          <path d="M14 214 H60" stroke="var(--ink)" strokeWidth="1.5" />
          <text x="4" y="206" fontSize="8.5" fill="var(--muted)">heated</text><text x="4" y="228" fontSize="8.5" fill="var(--muted)">crude oil</text>
          <text x="44" y="30" fontSize="8.5" fill="var(--blue)" textAnchor="end">cooler</text>
          <text x="44" y="232" fontSize="8.5" fill="var(--red)" textAnchor="end">hotter</text>
        </svg>
        <div className="stack" style={{ flex: '1 1 210px' }}>
          <Picker label="Fraction" options={FRACTIONS.map((x) => x.name)} value={f.name} onChange={(n) => setI(FRACTIONS.findIndex((x) => x.name === n))} />
          <dl className="facts-list">
            <div><dt>Carbon atoms per molecule</dt><dd>{f.carbons}</dd></div>
            <div><dt>Boiling range</dt><dd>{f.boil}</dd></div>
          </dl>
          <p>{f.use}</p>
        </div>
      </div>
      <p>Crude oil vapour rises up the tower and cools. Each hydrocarbon condenses at the level where the temperature is just below its boiling point: small molecules near the top, large ones near the bottom.</p>
      <p className="small muted">Ranges are approximate and overlap; different refineries cut the fractions slightly differently. This is a physical separation: no molecules are broken.</p>
    </div>
  );
}
