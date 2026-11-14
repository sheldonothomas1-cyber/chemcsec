import { useState } from 'react';
import { checkScale, makeScaleTask, type ScaleTask } from '../content/paper3';

const NAMES: Record<ScaleTask['kind'], string> = { burette: 'Burette', thermometer: 'Thermometer', cylinder: 'Measuring cylinder' };
const HINTS: Record<ScaleTask['kind'], string> = {
  burette: 'Burettes read downwards from 0 at the top. Each small mark is 0.1 cm³. Read the bottom of the meniscus and give 2 decimal places, ending in 0 or 5.',
  thermometer: 'Each mark is 1 °C. Read the top of the liquid to the nearest half degree and give 1 decimal place.',
  cylinder: 'Each mark is 1 cm³. Read the bottom of the meniscus to the nearest half mark and give 1 decimal place.',
};

/** A close-up of the scale around the reading. Pure SVG, drawn from the task. */
export function ScaleDrawing({ task }: { task: ScaleTask }) {
  const { kind, value } = task;
  const H = 300; // drawn height of the visible window
  const top = 20;
  const down = kind === 'burette'; // burette numbers increase downwards
  // The visible window: 3 cm³ for a burette (0.1 marks), 10 units otherwise (1 marks).
  const span = down ? 3 : 10;
  const minor = down ? 0.1 : 1;
  const lo = down ? Math.max(0, Math.floor(value) - 1) : Math.floor(value) - 4;
  const hi = lo + span;
  const y = (v: number) => (down ? top + ((v - lo) / span) * H : top + H - ((v - lo) / span) * H);
  const ticks: { v: number; len: number; label?: string }[] = [];
  const n = Math.round(span / minor);
  for (let i = 0; i <= n; i++) {
    const v = Math.round((lo + i * minor) * 100) / 100;
    const whole = Math.abs(v - Math.round(v)) < 1e-6;
    if (down) ticks.push({ v, len: whole ? 26 : Math.abs((v * 10) % 5) < 1e-6 ? 18 : 10, label: whole ? String(v) : undefined });
    else ticks.push({ v, len: v % 5 === 0 ? 26 : 12, label: v % 5 === 0 ? String(v) : undefined });
  }
  const isThermo = kind === 'thermometer';
  const x0 = isThermo ? 66 : 50;
  const x1 = isThermo ? 84 : 110;
  const ym = y(value);
  const label = `${NAMES[kind]} scale from ${down ? lo : hi} to ${down ? hi : lo}${task.unit === '°C' ? ' degrees' : ' cubic centimetres'}`;

  return (
    <svg viewBox="0 0 220 340" width="220" height="340" role="img" aria-label={label} className="scale-drawing">
      {/* tube */}
      <rect x={x0} y={top - 10} width={x1 - x0} height={H + 20} fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" rx={isThermo ? 9 : 2} />
      {/* liquid */}
      {isThermo ? (
        <rect x={x0 + 5} y={ym} width={x1 - x0 - 10} height={top + H + 10 - ym} fill="#d0453a" />
      ) : (
        <path
          // Concave meniscus: its lowest point sits exactly on the reading; liquid fills below it.
          d={`M${x0 + 1},${ym - 7} Q${(x0 + x1) / 2},${ym + 7} ${x1 - 1},${ym - 7} L${x1 - 1},${top + H + 10} L${x0 + 1},${top + H + 10} Z`}
          fill="#7fb6ea" opacity="0.75"
        />
      )}
      {/* scale */}
      {ticks.map((t) => (
        <g key={t.v}>
          <line x1={x1} x2={x1 + t.len} y1={y(t.v)} y2={y(t.v)} stroke="var(--ink)" strokeWidth={t.label ? 1.6 : 1} />
          {t.label && <text x={x1 + t.len + 6} y={y(t.v) + 5} fontSize="15" fill="var(--ink)" fontWeight="600">{t.label}</text>}
        </g>
      ))}
      <text x="8" y={top + 4} fontSize="12" fill="var(--muted)">{task.unit}</text>
    </svg>
  );
}

/** One reading at a time; checks both the value and the number of decimal places. */
export function ScaleDrill() {
  const [task, setTask] = useState(() => makeScaleTask(Math.random));
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<ReturnType<typeof checkScale> | null>(null);
  const [score, setScore] = useState({ right: 0, done: 0 });
  const next = (kind?: ScaleTask['kind']) => {
    setTask(makeScaleTask(Math.random, kind));
    setTyped('');
    setResult(null);
  };
  const answer = task.value.toFixed(task.decimals);
  return (
    <div className="sheet stack">
      <div className="row">
        {(Object.keys(NAMES) as ScaleTask['kind'][]).map((k) => (
          <button key={k} type="button" className={`btn pick ${task.kind === k ? 'on' : ''}`} aria-pressed={task.kind === k} onClick={() => next(k)}>{NAMES[k]}</button>
        ))}
      </div>
      <div className="scale-row">
        <ScaleDrawing task={task} />
        <form
          className="stack tight"
          onSubmit={(e) => {
            e.preventDefault();
            if (result || !typed.trim()) return;
            const r = checkScale(task, typed);
            setResult(r);
            setScore((s) => ({ right: s.right + (r.ok ? 1 : 0), done: s.done + 1 }));
          }}
        >
          <p className="muted small">{HINTS[task.kind]}</p>
          <label htmlFor="scale-in" className="label">Your reading ({task.unit})</label>
          <input id="scale-in" className="input" inputMode="decimal" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} disabled={!!result} />
          {!result ? (
            <div><button className="btn primary" type="submit">Check</button></div>
          ) : (
            <div className="stack tight" role="status">
              <p>
                {result.ok
                  ? <strong>Correct: {answer} {task.unit}.</strong>
                  : result.valueOk
                    ? <><strong>Right value, wrong precision.</strong> Record it as {answer} {task.unit}: {task.decimals} decimal place{task.decimals > 1 ? 's' : ''}. Examiners take the mark away for this.</>
                    : <><strong>Not quite.</strong> The reading is {answer} {task.unit}.</>}
              </p>
              <div><button className="btn primary" type="button" onClick={() => next()}>Next reading</button></div>
            </div>
          )}
          {score.done > 0 && <p className="small muted">{score.right} of {score.done} correct this session</p>}
        </form>
      </div>
    </div>
  );
}
