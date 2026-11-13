// A small, safe arithmetic evaluator for the tutor's `calculate` tool.
// It parses the expression itself - nothing is ever passed to eval().
// Supports + - * / ^, brackets, scientific notation (6.02e23) and sqrt/log/ln/abs.

const FUNCS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  log: Math.log10,
  log10: Math.log10,
  ln: Math.log,
  abs: Math.abs,
};

export function calculate(expression: string): number {
  const src = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/,/g, '').replace(/\s+/g, '');
  if (!src) throw new Error('Empty expression');
  if (src.length > 200) throw new Error('Expression is too long');
  let i = 0;

  const peek = () => src[i];
  const expr = (): number => {
    let v = term();
    while (peek() === '+' || peek() === '-') v = src[i++] === '+' ? v + term() : v - term();
    return v;
  };
  const term = (): number => {
    let v = unary();
    while (peek() === '*' || peek() === '/') {
      if (src[i++] === '*') v *= unary();
      else {
        const d = unary();
        if (d === 0) throw new Error('Division by zero');
        v /= d;
      }
    }
    return v;
  };
  const unary = (): number => {
    if (peek() === '-') {
      i++;
      return -unary();
    }
    if (peek() === '+') {
      i++;
      return unary();
    }
    return power();
  };
  const power = (): number => {
    const base = primary();
    if (peek() === '^') {
      i++;
      return Math.pow(base, unary());
    }
    return base;
  };
  const primary = (): number => {
    if (peek() === '(') {
      i++;
      const v = expr();
      if (peek() !== ')') throw new Error('Missing closing bracket');
      i++;
      return v;
    }
    const name = src.slice(i).match(/^[a-z][a-z0-9]*/i)?.[0];
    if (name) {
      const fn = FUNCS[name.toLowerCase()];
      if (!fn || src[i + name.length] !== '(') throw new Error(`Unknown name "${name}"`);
      i += name.length + 1;
      const v = expr();
      if (peek() !== ')') throw new Error('Missing closing bracket');
      i++;
      return fn(v);
    }
    const num = src.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i)?.[0];
    if (!num) throw new Error(i >= src.length ? 'Expression ends too early' : `Unexpected "${src[i]}"`);
    i += num.length;
    return parseFloat(num);
  };

  const value = expr();
  if (i < src.length) throw new Error(`Unexpected "${src[i]}"`);
  if (!Number.isFinite(value)) throw new Error('Result is not a finite number');
  return value;
}
