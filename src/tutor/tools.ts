// Tools the tutor model must use instead of doing chemistry arithmetic itself.
// Each one runs the app's own tested chemistry engine in the browser.
import type Anthropic from '@anthropic-ai/sdk';
import { balanceText, isBalanced, parseEquation } from '../chem/balance';
import { BY_SYMBOL, shells } from '../chem/elements';
import { massBreakdown, molarMass, sig } from '../chem/formula';
import { calculate } from './calc';

type Tool = Anthropic.Beta.BetaTool;

const stringTool = (name: string, description: string, param: string, paramDescription: string): Tool => ({
  name,
  description,
  // Requests are streamed, so inputs stream as generated; runTool validates them before use.
  eager_input_streaming: true,
  input_schema: {
    type: 'object',
    properties: { [param]: { type: 'string', description: paramDescription } },
    required: [param],
    additionalProperties: false,
  },
});

export const TUTOR_TOOLS: Tool[] = [
  stringTool(
    'formula_mass',
    'Relative formula mass of a compound, using the rounded relative atomic masses that CSEC papers give (for example Cl = 35.5, Cu = 63.5). Returns the per-element breakdown and the total. Use this for every formula mass; never add atomic masses yourself.',
    'formula',
    'A chemical formula such as CaCO3, Ca(OH)2 or CuSO4.5H2O. Capitalisation matters.',
  ),
  stringTool(
    'balance_equation',
    'Balance a chemical equation by atoms and charge, returning the smallest whole-number coefficients. Works for ionic and half-equations. Use it whenever you need a balanced equation you have not already verified.',
    'equation',
    'Unbalanced equation with spaces around each plus sign and -> as the arrow, e.g. "Fe2O3 + CO -> Fe + CO2" or "Fe^2+ + Cl2 -> Fe^3+ + Cl-". Write electrons as e-.',
  ),
  stringTool(
    'check_equation',
    'Check whether an equation exactly as written (with its coefficients) is balanced for every element and for charge. Use it on a learner\'s equation, and on any equation you are about to show.',
    'equation',
    'Equation with coefficients, e.g. "2H2 + O2 -> 2H2O" or "Cu^2+ + 2e- -> Cu".',
  ),
  stringTool(
    'calculate',
    'Evaluate an arithmetic expression exactly. Use it for every numerical step (moles, concentrations, percentages, q = mcΔT, Q = It). Supports + - * / ^, brackets, numbers like 6.02e23, and sqrt(), log(), ln(), abs().',
    'expression',
    'An arithmetic expression such as "0.100 * 25.0 / 1000" or "(28 / 80) * 100".',
  ),
  stringTool(
    'element_data',
    'Look up an element: name, atomic number, the relative atomic mass CSEC uses, group, period and (for the first 20 elements) the electron arrangement.',
    'symbol',
    'Element symbol, e.g. Na, Cl, Fe.',
  ),
];

export interface ToolOutcome {
  /** JSON text returned to the model. */
  content: string;
  isError: boolean;
  /** One line shown to the learner so they can see what was computed. */
  summary: string;
}

const ok = (data: unknown, summary: string): ToolOutcome => ({ content: JSON.stringify(data), isError: false, summary });
const fail = (message: string): ToolOutcome => ({ content: JSON.stringify({ error: message }), isError: true, summary: '' });

function tally(eq: ReturnType<typeof parseEquation>, side: 'left' | 'right'): Record<string, number> {
  const out: Record<string, number> = {};
  for (const { coef, species } of eq[side]) {
    for (const [el, n] of Object.entries(species.atoms)) out[el] = (out[el] ?? 0) + n * coef;
    if (species.charge) out.charge = (out.charge ?? 0) + species.charge * coef;
  }
  return out;
}

/** Run one tool call. Input comes from the model, so it is validated before anything uses it. */
export function runTool(name: string, input: unknown): ToolOutcome {
  const tool = TUTOR_TOOLS.find((t) => t.name === name);
  if (!tool) return fail(`Unknown tool "${name}"`);
  const param = (tool.input_schema.required as string[])[0];
  const value = input && typeof input === 'object' ? (input as Record<string, unknown>)[param] : undefined;
  if (typeof value !== 'string' || !value.trim() || value.length > 300) {
    return { content: JSON.stringify({ INVALID_JSON: JSON.stringify(input ?? null) }), isError: true, summary: '' };
  }
  const arg = value.trim();
  try {
    switch (name) {
      case 'formula_mass': {
        const total = molarMass(arg);
        return ok({ formula: arg, breakdown: massBreakdown(arg), formula_mass: total }, `Formula mass of [[${arg}]] = ${total}`);
      }
      case 'balance_equation': {
        const res = balanceText(arg);
        if (!res) return fail('No unique balance exists. Check that every element appears on both sides and the formulae are correct.');
        return ok({ balanced: res.text, coefficients: res.coefs }, `Balanced: [[${res.text}]]`);
      }
      case 'check_equation': {
        const eq = parseEquation(arg);
        const balanced = isBalanced(arg);
        return ok(
          { equation: arg, balanced, left: tally(eq, 'left'), right: tally(eq, 'right') },
          `Checked [[${arg}]]: ${balanced ? 'balanced' : 'not balanced'}`,
        );
      }
      case 'calculate': {
        const result = calculate(arg);
        return ok({ expression: arg, result, to_3_significant_figures: sig(result, 3) }, `${arg} = ${sig(result, 4)}`);
      }
      case 'element_data': {
        const el = BY_SYMBOL[arg];
        if (!el) return fail(`No data for "${arg}". Use the element symbol with correct capitals, e.g. Na.`);
        return ok(
          { symbol: el.sym, name: el.name, atomic_number: el.z, relative_atomic_mass: el.ar, group: el.group || null, period: el.period, kind: el.kind, electron_arrangement: shells(el.z) },
          `Looked up ${el.name}`,
        );
      }
      default:
        return fail(`Unknown tool "${name}"`);
    }
  } catch (e) {
    return fail((e as Error).message);
  }
}
