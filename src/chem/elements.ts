// Element data used across the app. Relative atomic masses are rounded the way
// CSEC data sheets present them (Cl = 35.5, Cu = 63.5), so answers match exam working.
export type ElementKind = 'metal' | 'nonmetal' | 'metalloid' | 'noble';

export interface Element {
  z: number;
  sym: string;
  name: string;
  ar: number;
  group: number; // 1-18, 0 when not shown on the grid
  period: number;
  kind: ElementKind;
}

const RAW = `
1 H Hydrogen 1 1 1 nonmetal
2 He Helium 4 18 1 noble
3 Li Lithium 7 1 2 metal
4 Be Beryllium 9 2 2 metal
5 B Boron 11 13 2 metalloid
6 C Carbon 12 14 2 nonmetal
7 N Nitrogen 14 15 2 nonmetal
8 O Oxygen 16 16 2 nonmetal
9 F Fluorine 19 17 2 nonmetal
10 Ne Neon 20 18 2 noble
11 Na Sodium 23 1 3 metal
12 Mg Magnesium 24 2 3 metal
13 Al Aluminium 27 13 3 metal
14 Si Silicon 28 14 3 metalloid
15 P Phosphorus 31 15 3 nonmetal
16 S Sulfur 32 16 3 nonmetal
17 Cl Chlorine 35.5 17 3 nonmetal
18 Ar Argon 40 18 3 noble
19 K Potassium 39 1 4 metal
20 Ca Calcium 40 2 4 metal
21 Sc Scandium 45 3 4 metal
22 Ti Titanium 48 4 4 metal
23 V Vanadium 51 5 4 metal
24 Cr Chromium 52 6 4 metal
25 Mn Manganese 55 7 4 metal
26 Fe Iron 56 8 4 metal
27 Co Cobalt 59 9 4 metal
28 Ni Nickel 59 10 4 metal
29 Cu Copper 63.5 11 4 metal
30 Zn Zinc 65 12 4 metal
31 Ga Gallium 70 13 4 metal
32 Ge Germanium 73 14 4 metalloid
33 As Arsenic 75 15 4 metalloid
34 Se Selenium 79 16 4 nonmetal
35 Br Bromine 80 17 4 nonmetal
36 Kr Krypton 84 18 4 noble
37 Rb Rubidium 85.5 0 5 metal
38 Sr Strontium 88 0 5 metal
47 Ag Silver 108 0 5 metal
50 Sn Tin 119 0 5 metal
53 I Iodine 127 0 5 nonmetal
55 Cs Caesium 133 0 6 metal
56 Ba Barium 137 0 6 metal
78 Pt Platinum 195 0 6 metal
79 Au Gold 197 0 6 metal
80 Hg Mercury 201 0 6 metal
82 Pb Lead 207 0 6 metal
`;

export const ELEMENTS: Element[] = RAW.trim()
  .split('\n')
  .map((line) => {
    const [z, sym, name, ar, group, period, kind] = line.trim().split(/\s+/);
    return { z: +z, sym, name, ar: +ar, group: +group, period: +period, kind: kind as ElementKind };
  });

export const BY_SYMBOL: Record<string, Element> = Object.fromEntries(ELEMENTS.map((e) => [e.sym, e]));

/** Electron arrangement in CSEC shell notation (valid for the first 20 elements). */
export function shells(z: number): number[] | null {
  if (z < 1 || z > 20) return null;
  const caps = [2, 8, 8, 2];
  const out: number[] = [];
  let left = z;
  for (const cap of caps) {
    if (left <= 0) break;
    const n = Math.min(cap, left);
    out.push(n);
    left -= n;
  }
  return out;
}
