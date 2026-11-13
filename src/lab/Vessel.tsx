import { useId } from 'react';
import { Rich } from '../components/Rich';
import type { Effects, Outcome } from './reactions';

/** A test tube that shows what an outcome looks like: colour, bubbles, flame, solid, precipitate. */
export function Vessel({ effects, wet = true, solid, caption, size = 150 }: { effects: Effects; wet?: boolean; solid?: string; caption?: string; size?: number }) {
  const id = useId();
  const liquid = wet ? effects.liquid ?? '#dbeaf0' : null;
  const n = (effects.bubbles ?? 0) * 4;
  const speed = 2.8 - 0.45 * (effects.bubbles ?? 0);
  const flameY = liquid ? 72 : 138;
  const parts = [
    liquid ? 'liquid' : 'dry tube',
    effects.bubbles ? ['', 'a few bubbles', 'steady bubbles', 'rapid bubbles', 'violent fizzing'][effects.bubbles] : '',
    effects.flame ? 'a flame' : '', effects.glow ? 'glowing solid' : '', effects.precipitate ? 'a precipitate' : '', effects.deposit ? 'a coating on the metal' : '',
  ].filter(Boolean);
  return (
    <figure className="vessel">
      <svg viewBox="0 -44 120 244" width={size * 0.6} height={size * 1.22} role="img" aria-label={`Test tube showing ${parts.join(', ')}`}>
        <defs>
          <clipPath id={`${id}-in`}><path d="M36 20 V150 a24 24 0 0 0 48 0 V20 Z" /></clipPath>
          <radialGradient id={`${id}-glow`}><stop offset="0" stopColor="#ffb347" stopOpacity="0.95" /><stop offset="1" stopColor="#ff5a1f" stopOpacity="0" /></radialGradient>
        </defs>
        <g clipPath={`url(#${id}-in)`}>
          {liquid && <rect x="30" y="72" width="60" height="110" fill={liquid} opacity="0.9" className="fade-fill" />}
          {effects.precipitate && <path d="M34 146 q26 -9 52 0 V180 H34 Z" fill={effects.precipitate} className="settle" />}
          {effects.glow && <circle cx="60" cy="158" r="30" fill={`url(#${id}-glow)`} className="pulse" />}
          {(solid || effects.solid || effects.deposit) && (
            <path d="M46 168 l5 -13 h18 l5 13 q-14 6 -28 0 Z" fill={effects.solid ?? solid ?? '#8a8f94'} stroke={effects.deposit ?? 'none'} strokeWidth={effects.deposit ? 5 : 0} strokeLinejoin="round" className="fade-fill" />
          )}
          {Array.from({ length: n }, (_, i) => (
            <circle key={i} cx={44 + ((i * 37) % 32)} cy="160" r={1.8 + (i % 3)} fill="#ffffff" opacity="0.85" className="bubble" style={{ animationDuration: `${speed + (i % 4) * 0.25}s`, animationDelay: `${-(i * speed) / n}s` }} />
          ))}
        </g>
        {effects.flame && (
          <g className="flame" style={{ transformOrigin: `60px ${flameY}px` }}>
            <path d={`M60 ${flameY - 46} C 78 ${flameY - 24}, 74 ${flameY - 4}, 60 ${flameY} C 46 ${flameY - 4}, 42 ${flameY - 24}, 60 ${flameY - 46} Z`} fill={effects.flame} opacity="0.9" stroke="var(--line)" strokeWidth="0.6" />
            <path d={`M60 ${flameY - 24} C 68 ${flameY - 13}, 66 ${flameY - 3}, 60 ${flameY - 1} C 54 ${flameY - 3}, 52 ${flameY - 13}, 60 ${flameY - 24} Z`} fill="#fff7d6" opacity="0.85" />
          </g>
        )}
        <path d="M36 20 V150 a24 24 0 0 0 48 0 V20" fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M31 20 H89" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      {caption && <figcaption className="small muted">{caption}</figcaption>}
    </figure>
  );
}

/** The written result of an experiment: what you see, the equation, and why. */
export function OutcomeCard({ out }: { out: Outcome }) {
  return (
    <div className="stack" aria-live="polite">
      <div className="row">
        <span className={`chip ${out.reacts ? 'ok' : ''}`}>{out.reacts ? 'Reaction' : 'No reaction'}</span>
        <h3>{out.headline}</h3>
      </div>
      <div>
        <p className="label">What you would see</p>
        <ul className="plain">{out.observations.map((o, i) => <li key={i}><Rich text={o} /></li>)}</ul>
      </div>
      {out.equation && (
        <div>
          <p className="label">Equation</p>
          <p className="equation"><Rich text={`[[${out.equation}]]`} /></p>
        </div>
      )}
      <div>
        <p className="label">Why</p>
        <p><Rich text={out.explain} /></p>
      </div>
      {out.note && <p className="small muted"><Rich text={out.note} /></p>}
      {out.safety && <p className="small" style={{ color: 'var(--red)' }}><strong>Safety:</strong> {out.safety}</p>}
    </div>
  );
}

/** A row of buttons for choosing one option, used all over the lab. */
export function Picker<T extends string>({ label, options, value, onChange, render }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; render?: (v: T) => string }) {
  return (
    <fieldset className="picker">
      <legend className="label">{label}</legend>
      <div className="row">
        {options.map((o) => (
          <button key={o} type="button" className={`btn pick ${o === value ? 'on' : ''}`} aria-pressed={o === value} onClick={() => onChange(o)}>
            {render ? render(o) : o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
