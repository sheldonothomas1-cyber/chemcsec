import { parseSpecies, type Species } from './formula';

export interface Term {
  coef: number;
  species: Species;
}
export interface Equation {
  left: Term[];
  right: Term[];
}

const ARROW = /\s*(?:<=>|<->|->|→|⇌|=)\s*/;

export function parseEquation(text: string): Equation {
  const sides = text.trim().split(ARROW);
  if (sides.length !== 2) throw new Error('Write the equation with one arrow, e.g. H2 + O2 -> H2O');
  const side = (s: string): Term[] =>
    s
      .split(/\s+\+\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => {
        const m = t.match(/^(\d+)\s*(.+)$/);
        return m ? { coef: +m[1], species: parseSpecies(m[2]) } : { coef: 1, species: parseSpecies(t) };
      });
  const eq = { left: side(sides[0]), right: side(sides[1]) };
  if (!eq.left.length || !eq.right.length) throw new Error('Both sides of the equation need at least one substance');
  return eq;
}

function tally(terms: Term[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const { coef, species } of terms) {
    for (const [el, n] of Object.entries(species.atoms)) out[el] = (out[el] ?? 0) + n * coef;
    out['charge'] = (out['charge'] ?? 0) + species.charge * coef;
  }
  return out;
}

/** True when atoms of every element AND total charge match on both sides. */
export function isBalanced(text: string): boolean {
  const eq = parseEquation(text);
  const l = tally(eq.left);
  const r = tally(eq.right);
  const keys = new Set([...Object.keys(l), ...Object.keys(r)]);
  for (const k of keys) if ((l[k] ?? 0) !== (r[k] ?? 0)) return false;
  return true;
}

// ---- exact rational arithmetic for the solver ----
type Frac = [number, number];
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const norm = ([n, d]: Frac): Frac => {
  if (n === 0) return [0, 1];
  const g = gcd(n, d) * (d < 0 ? -1 : 1);
  return [n / g, d / g];
};
const sub = (a: Frac, b: Frac): Frac => norm([a[0] * b[1] - b[0] * a[1], a[1] * b[1]]);
const mul = (a: Frac, b: Frac): Frac => norm([a[0] * b[0], a[1] * b[1]]);
const div = (a: Frac, b: Frac): Frac => norm([a[0] * b[1], a[1] * b[0]]);

/**
 * Find the smallest whole-number coefficients that balance the equation
 * (atoms and charge). Returns null if there is no unique balance.
 */
export function balance(left: string[], right: string[]): number[] | null {
  const species = [...left, ...right].map(parseSpecies);
  const keys = new Set<string>();
  species.forEach((s) => Object.keys(s.atoms).forEach((k) => keys.add(k)));
  const rows: Frac[][] = [...keys].map((k) =>
    species.map((s, i): Frac => [(s.atoms[k] ?? 0) * (i < left.length ? 1 : -1), 1]),
  );
  if (species.some((s) => s.charge !== 0)) {
    rows.push(species.map((s, i): Frac => [s.charge * (i < left.length ? 1 : -1), 1]));
  }

  const n = species.length;
  const pivots: number[] = [];
  let r = 0;
  for (let c = 0; c < n && r < rows.length; c++) {
    const p = rows.findIndex((row, i) => i >= r && row[c][0] !== 0);
    if (p === -1) continue;
    [rows[r], rows[p]] = [rows[p], rows[r]];
    const pv = rows[r][c];
    rows[r] = rows[r].map((x) => div(x, pv));
    for (let i = 0; i < rows.length; i++) {
      if (i !== r && rows[i][c][0] !== 0) {
        const f = rows[i][c];
        rows[i] = rows[i].map((x, j) => sub(x, mul(f, rows[r][j])));
      }
    }
    pivots.push(c);
    r++;
  }
  const free = [...Array(n).keys()].filter((c) => !pivots.includes(c));
  if (free.length !== 1) return null;

  const sol: Frac[] = Array.from({ length: n }, (): Frac => [0, 1]);
  sol[free[0]] = [1, 1];
  pivots.forEach((c, i) => (sol[c] = norm([-rows[i][free[0]][0], rows[i][free[0]][1]])));

  const lcm = sol.reduce((acc, [, d]) => (acc * d) / gcd(acc, d), 1);
  let ints = sol.map(([nn, d]) => (nn * lcm) / d);
  if (ints.every((x) => x < 0)) ints = ints.map((x) => -x);
  if (ints.some((x) => x <= 0)) return null;
  const g = ints.reduce((a, b) => gcd(a, b));
  return ints.map((x) => x / g);
}

/** Balance a typed equation and return it as text, e.g. "2H2 + O2 -> 2H2O". */
export function balanceText(text: string): { coefs: number[]; text: string } | null {
  const eq = parseEquation(text);
  const l = eq.left.map((t) => t.species.raw);
  const r = eq.right.map((t) => t.species.raw);
  const coefs = balance(l, r);
  if (!coefs) return null;
  const fmt = (names: string[], offset: number) =>
    names.map((nm, i) => (coefs[i + offset] === 1 ? '' : coefs[i + offset]) + nm).join(' + ');
  return { coefs, text: `${fmt(l, 0)} -> ${fmt(r, l.length)}` };
}
