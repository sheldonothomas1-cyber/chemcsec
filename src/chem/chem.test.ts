import { describe, expect, it } from 'vitest';
import { balance, balanceText, isBalanced } from './balance';
import { molarMass, parseSpecies } from './formula';
import { shells } from './elements';

describe('formula parser', () => {
  it('counts atoms through brackets and hydrates', () => {
    expect(parseSpecies('Ca(OH)2').atoms).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(parseSpecies('Al2(SO4)3').atoms).toEqual({ Al: 2, S: 3, O: 12 });
    expect(parseSpecies('CuSO4.5H2O').atoms).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
    expect(parseSpecies('CH3CH(CH3)CH3').atoms).toEqual({ C: 4, H: 10 });
  });
  it('reads charges and state symbols', () => {
    expect(parseSpecies('SO4^2-').charge).toBe(-2);
    expect(parseSpecies('Cu^2+(aq)').charge).toBe(2);
    expect(parseSpecies('OH-').charge).toBe(-1);
    expect(parseSpecies('e-')).toMatchObject({ atoms: {}, charge: -1 });
    expect(parseSpecies('H2O(l)').atoms).toEqual({ H: 2, O: 1 });
  });
  it('rejects nonsense', () => {
    expect(() => parseSpecies('Xx2')).toThrow();
    expect(() => parseSpecies('')).toThrow();
  });
  it('computes formula masses with CSEC-rounded values', () => {
    expect(molarMass('CaCO3')).toBe(100);
    expect(molarMass('H2SO4')).toBe(98);
    expect(molarMass('NaCl')).toBe(58.5);
    expect(molarMass('CuSO4.5H2O')).toBe(249.5);
    expect(molarMass('(NH4)2SO4')).toBe(132);
  });
});

describe('equation balancer', () => {
  it('finds smallest whole-number coefficients', () => {
    expect(balance(['H2', 'O2'], ['H2O'])).toEqual([2, 1, 2]);
    expect(balance(['C3H8', 'O2'], ['CO2', 'H2O'])).toEqual([1, 5, 3, 4]);
    expect(balance(['Al', 'HCl'], ['AlCl3', 'H2'])).toEqual([2, 6, 2, 3]);
    expect(balance(['Pb(NO3)2'], ['PbO', 'NO2', 'O2'])).toEqual([2, 2, 4, 1]);
  });
  it('balances charge in ionic and half equations', () => {
    expect(balance(['Fe^2+', 'Cl2'], ['Fe^3+', 'Cl-'])).toEqual([2, 1, 2, 2]);
    expect(balance(['OH-'], ['H2O', 'O2', 'e-'])).toEqual([4, 2, 1, 4]);
    expect(balance(['Al^3+', 'e-'], ['Al'])).toEqual([1, 3, 1]);
  });
  it('returns null when no unique balance exists', () => {
    expect(balance(['H2'], ['O2'])).toBeNull();
  });
  it('checks typed equations', () => {
    expect(isBalanced('2H2 + O2 -> 2H2O')).toBe(true);
    expect(isBalanced('H2 + O2 -> H2O')).toBe(false);
    expect(isBalanced('Cu^2+ + 2e- -> Cu')).toBe(true);
    expect(isBalanced('Cu^2+ + e- -> Cu')).toBe(false);
    expect(isBalanced('N2(g) + 3H2(g) <=> 2NH3(g)')).toBe(true);
    expect(balanceText('Fe2O3 + CO -> Fe + CO2')?.text).toBe('Fe2O3 + 3CO -> 2Fe + 3CO2');
  });
});

describe('electron shells', () => {
  it('fills 2,8,8,2', () => {
    expect(shells(11)).toEqual([2, 8, 1]);
    expect(shells(20)).toEqual([2, 8, 8, 2]);
    expect(shells(1)).toEqual([1]);
    expect(shells(21)).toBeNull();
  });
});
