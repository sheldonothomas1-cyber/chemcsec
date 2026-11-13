import { BY_SYMBOL } from './elements';

export interface Species {
  raw: string;
  atoms: Record<string, number>;
  charge: number;
}

const STATE = /\((s|l|g|aq)\)\s*$/;

/**
 * Parse one chemical species such as "Ca(OH)2", "SO4^2-", "H+", "CuSO4.5H2O", "e-".
 * Charges above 1 must use a caret ("Cu^2+") so "Cu2+" is never misread.
 */
export function parseSpecies(input: string): Species {
  const raw = input.trim();
  let s = raw.replace(STATE, '').trim();
  if (!s) throw new Error('Empty formula');

  let charge = 0;
  const caret = s.match(/\^\{?(\d*)([+-])\}?$/);
  if (caret) {
    charge = (caret[1] ? +caret[1] : 1) * (caret[2] === '+' ? 1 : -1);
    s = s.slice(0, caret.index);
  } else {
    const bare = s.match(/([+-])$/);
    if (bare) {
      charge = bare[1] === '+' ? 1 : -1;
      s = s.slice(0, -1);
    }
  }

  if (s === 'e') return { raw, atoms: {}, charge: charge || -1 };

  const atoms: Record<string, number> = {};
  for (const part of s.split('.')) {
    const lead = part.match(/^(\d+)(.*)$/);
    const mult = lead ? +lead[1] : 1;
    const body = lead ? lead[2] : part;
    const counted = parseGroup(body);
    for (const [el, n] of Object.entries(counted)) atoms[el] = (atoms[el] ?? 0) + n * mult;
  }
  if (Object.keys(atoms).length === 0) throw new Error(`Could not read "${raw}"`);
  return { raw, atoms, charge };
}

function parseGroup(body: string): Record<string, number> {
  let i = 0;
  const read = (): Record<string, number> => {
    const out: Record<string, number> = {};
    const add = (el: string, n: number) => (out[el] = (out[el] ?? 0) + n);
    while (i < body.length) {
      const ch = body[i];
      if (ch === '(' || ch === '[') {
        i++;
        const inner = read();
        const n = readInt();
        for (const [el, k] of Object.entries(inner)) add(el, k * n);
      } else if (ch === ')' || ch === ']') {
        i++;
        return out;
      } else if (/[A-Z]/.test(ch)) {
        let el = ch;
        i++;
        if (i < body.length && /[a-z]/.test(body[i])) el += body[i++];
        if (!BY_SYMBOL[el]) throw new Error(`Unknown element "${el}"`);
        add(el, readInt());
      } else {
        throw new Error(`Unexpected "${ch}" in "${body}"`);
      }
    }
    return out;
  };
  const readInt = (): number => {
    let digits = '';
    while (i < body.length && /\d/.test(body[i])) digits += body[i++];
    return digits ? +digits : 1;
  };
  return read();
}

/** Relative formula mass (g/mol) using CSEC-rounded atomic masses. */
export function molarMass(formula: string | Species): number {
  const sp = typeof formula === 'string' ? parseSpecies(formula) : formula;
  let total = 0;
  for (const [el, n] of Object.entries(sp.atoms)) total += BY_SYMBOL[el].ar * n;
  return round(total, 4);
}

export function massBreakdown(formula: string): { el: string; n: number; ar: number; sub: number }[] {
  const sp = parseSpecies(formula);
  return Object.entries(sp.atoms).map(([el, n]) => ({ el, n, ar: BY_SYMBOL[el].ar, sub: round(BY_SYMBOL[el].ar * n, 4) }));
}

export function round(x: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round((x + Number.EPSILON) * f) / f;
}

/** Round to significant figures, the way a mark scheme quotes a final answer. */
export function sig(x: number, figures = 3): number {
  if (x === 0) return 0;
  const mag = Math.floor(Math.log10(Math.abs(x)));
  const f = 10 ** (figures - 1 - mag);
  return Math.round(x * f) / f;
}
