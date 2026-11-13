// Visual breakdowns for the Section A lessons. Each one shows the idea as a picture the
// learner can change, with the wording a mark scheme expects beside it.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Rich } from '../components/Rich';
import { ShellDiagram } from '../components/ShellDiagram';
import { molarMass } from '../chem/formula';
import { fmt } from '../content/generators';
import { ALL_ELEMENTS, EL_BY_SYMBOL } from '../data/periodic';
import { Picker } from '../lab/Vessel';

// ------------------------------------------------------------------ A1 particles
type StateName = 'Solid' | 'Liquid' | 'Gas';
const STATE_TEXT: Record<StateName, string> = {
  Solid: 'Particles touch in a regular pattern and only vibrate about fixed positions. Strong forces hold them in place, so a solid keeps its shape.',
  Liquid: 'Particles still touch, but are arranged randomly and slide past each other. The forces are weaker, so a liquid flows and takes the shape of its container.',
  Gas: 'Particles are far apart and move quickly in all directions. The forces between them are negligible, so a gas fills its container and can be compressed.',
};
export function ParticlesVisual() {
  const [state, setState] = useState<StateName>('Solid');
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const dots = [...svg.querySelectorAll('circle')];
    const N = dots.length, W = 240, H = 160, R = 9;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const home = dots.map((_, i) => ({ x: 42 + (i % 8) * 22, y: 66 + Math.floor(i / 8) * 22 }));
    const p = home.map((h, i) => state === 'Gas'
      ? { x: 20 + ((i * 53) % (W - 40)), y: 16 + ((i * 37) % (H - 32)), vx: Math.cos(i * 2.4) * 2.6, vy: Math.sin(i * 2.4) * 2.6 }
      : state === 'Liquid'
        ? { x: 30 + (i % 9) * 21 + (Math.floor(i / 9) % 2) * 9, y: 84 + Math.floor(i / 9) * 19, vx: Math.cos(i) * 0.5, vy: Math.sin(i * 1.7) * 0.3 }
        : { ...h, vx: 0, vy: 0 });
    let frame = 0, id = 0;
    const draw = () => {
      frame++;
      for (let i = 0; i < N; i++) {
        const q = p[i];
        let x = q.x, y = q.y;
        if (state === 'Solid') {
          x = home[i].x + Math.sin(frame * 0.5 + i * 1.3) * 1.3;
          y = home[i].y + Math.cos(frame * 0.45 + i * 2.1) * 1.3;
        } else {
          q.x += q.vx;
          q.y += q.vy;
          const top = state === 'Liquid' ? 80 : R;
          if (q.x < R || q.x > W - R) q.vx *= -1;
          if (q.y < top || q.y > H - R) q.vy *= -1;
          if (state === 'Liquid' && frame % 40 === i % 40) { q.vx = Math.cos(frame + i) * 0.6; q.vy = Math.sin(frame * 1.3 + i) * 0.35; }
          x = q.x;
          y = q.y;
        }
        dots[i].setAttribute('cx', x.toFixed(1));
        dots[i].setAttribute('cy', y.toFixed(1));
      }
      if (!still) id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, [state]);
  return (
    <div className="visual">
      <Picker label="State" options={['Solid', 'Liquid', 'Gas'] as const} value={state} onChange={setState} />
      <div className="visual-row">
        <svg ref={ref} viewBox="0 0 240 160" width="280" role="img" aria-label={`Particles in a ${state.toLowerCase()}`}>
          <rect x="1" y="1" width="238" height="158" rx="8" fill="var(--sunk)" stroke="var(--line)" />
          {Array.from({ length: 32 }, (_, i) => <circle key={i} r="9" fill="var(--blue)" opacity="0.9" />)}
        </svg>
      </div>
      <p>{STATE_TEXT[state]}</p>
      <p className="small muted">The particles themselves are identical in all three states. Only their arrangement, spacing and movement change.</p>
    </div>
  );
}

// ------------------------------------------------------------------ A2 chromatography
const DYES = [{ name: 'yellow dye', colour: '#e9b800', rf: 0.85 }, { name: 'red dye', colour: '#d6336c', rf: 0.55 }, { name: 'blue dye', colour: '#1c7ed6', rf: 0.25 }];
export function ChromatographyVisual() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    let id = 0;
    const tick = (now: number) => {
      const v = Math.min(1, (now - start) / 5000);
      setProgress(v);
      if (v < 1) id = requestAnimationFrame(tick);
      else setRunning(false);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [running]);
  const base = 170, top = 30, front = base - progress * (base - top);
  return (
    <div className="visual">
      <div className="visual-row">
        <svg viewBox="0 0 200 210" width="210" role="img" aria-label="Paper chromatography of black ink separating into three dyes">
          <path d="M40 40 V200 H160 V40" fill="none" stroke="var(--ink)" strokeWidth="2" />
          <rect x="41" y="186" width="118" height="13" fill="#bfe3f2" />
          <rect x="78" y="14" width="44" height="182" fill="#fbfbf6" stroke="var(--line)" />
          <rect x="78" y={front} width="44" height={196 - front} fill="#bfe3f2" opacity="0.45" />
          <line x1="78" x2="122" y1={base} y2={base} stroke="var(--muted)" strokeDasharray="3 3" />
          {progress > 0 && <line x1="72" x2="128" y1={front} y2={front} stroke="var(--blue)" strokeWidth="1.2" />}
          {progress === 0
            ? <circle cx="100" cy={base} r="6" fill="#222" />
            : DYES.map((d) => <ellipse key={d.name} cx="100" cy={base - d.rf * (base - front)} rx="7" ry="5" fill={d.colour} opacity="0.9" />)}
          <text x="130" y={base + 3} fontSize="8" fill="var(--muted)">start line</text>
          {progress > 0 && <text x="130" y={front + 3} fontSize="8" fill="var(--blue)">solvent front</text>}
        </svg>
        <div className="stack" style={{ flex: '1 1 220px' }}>
          <div className="row">
            <button className="btn primary" type="button" disabled={running} onClick={() => { setProgress(0); setRunning(true); }}>{progress >= 1 ? 'Run it again' : 'Stand the paper in solvent'}</button>
          </div>
          {progress >= 1 ? (
            <ul className="plain">
              {DYES.map((d) => <li key={d.name}><strong style={{ color: d.colour }}>{d.name}</strong>: travelled {(d.rf * 14).toFixed(1)} cm of the solvent's 14.0 cm, so R<sub>f</sub> = {d.rf.toFixed(2)}</li>)}
            </ul>
          ) : <p className="muted">A spot of black ink sits on the start line, above the level of the solvent.</p>}
          <p>The solvent carries each dye up the paper. The more soluble a dye is in the solvent, and the less it sticks to the paper, the further it travels.</p>
          <p className="small muted">R<sub>f</sub> = distance moved by the dye ÷ distance moved by the solvent front. The start line is drawn in pencil because pencil does not dissolve.</p>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ A3 atom builder
const FIRST20 = ALL_ELEMENTS.slice(0, 20);
const ION_CHANGE: Record<string, number> = { Li: -1, Na: -1, K: -1, Be: -2, Mg: -2, Ca: -2, Al: -3, N: 3, O: 2, S: 2, F: 1, Cl: 1 };
export function AtomVisual() {
  const [sym, setSym] = useState('Na');
  const [asIon, setAsIon] = useState(false);
  const el = EL_BY_SYMBOL[sym];
  const change = ION_CHANGE[sym] ?? 0;
  const mass = Math.round(el.mass ?? 0);
  const shells = useMemo(() => {
    if (!asIon || !change) return el.shells;
    const s = [...el.shells];
    if (change < 0) s.pop();
    else s[s.length - 1] += change;
    return s;
  }, [el, asIon, change]);
  const electrons = shells.reduce((a, b) => a + b, 0);
  const charge = el.z - electrons;
  const chargeText = charge === 0 ? '' : `${Math.abs(charge) === 1 ? '' : Math.abs(charge)}${charge > 0 ? '+' : '-'}`;
  return (
    <div className="visual">
      <Picker label="Element (first 20)" options={FIRST20.map((e) => e.sym)} value={sym} onChange={(s) => { setSym(s); setAsIon(false); }} />
      <div className="visual-row">
        <ShellDiagram shells={shells} label={`${sym}${chargeText}`} size={190} highlightOuter />
        <div className="stack" style={{ flex: '1 1 220px' }}>
          <h3>{el.name}{charge !== 0 ? ' ion' : ' atom'}</h3>
          <dl className="facts-list">
            <div><dt>Protons (atomic number)</dt><dd>{el.z}</dd></div>
            <div><dt>Neutrons (mass number {mass} - {el.z})</dt><dd>{mass - el.z}</dd></div>
            <div><dt>Electrons</dt><dd>{electrons}</dd></div>
            <div><dt>Electron arrangement</dt><dd>{shells.join(',')}</dd></div>
            <div><dt>Charge</dt><dd>{charge === 0 ? '0 (neutral)' : chargeText}</dd></div>
          </dl>
          {change !== 0 ? (
            <div><button className="btn" type="button" onClick={() => setAsIon(!asIon)}>{asIon ? 'Show the neutral atom' : `Show the ion it forms`}</button></div>
          ) : <p className="small muted">{el.cat === 'Noble gas' ? 'Its outer shell is already full, so it does not form ions.' : 'This element usually bonds by sharing electrons rather than forming a simple ion.'}</p>}
          {asIon && change !== 0 && <p>{change < 0 ? `It loses ${-change} outer ${change === -1 ? 'electron' : 'electrons'}, leaving a full shell underneath. Protons now outnumber electrons, so the ion is positive.` : `It gains ${change} ${change === 1 ? 'electron' : 'electrons'} to fill its outer shell. Electrons now outnumber protons, so the ion is negative.`}</p>}
        </div>
      </div>
      <p className="small muted">Mass number shown is for the most common atom of the element. The protons never change: they decide which element it is.</p>
    </div>
  );
}

// ------------------------------------------------------------------ A4 group trends
const FAMILIES = {
  'Group I': { members: ['Li', 'Na', 'K'], text: 'One outer electron each, so they react in the same way. Going down, the outer electron is further from the nucleus and more shielded, so it is lost more easily: reactivity increases.' },
  'Group II': { members: ['Be', 'Mg', 'Ca'], text: 'Two outer electrons each. As in Group I, more shells mean the outer electrons are held less tightly, so reactivity increases down the group.' },
  'Group VII': { members: ['F', 'Cl', 'Br'], text: 'Seven outer electrons each: they react by gaining one more. Going down, the outer shell is further from the nucleus, so an extra electron is attracted less strongly: reactivity decreases.' },
  'Period 3': { members: ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'], text: 'Same number of shells, one more outer electron each time. The elements change from metals (Na, Mg, Al) through a metalloid (Si) to non-metals (P, S, Cl) and a noble gas (Ar).' },
} as const;
export function GroupTrendVisual() {
  const [fam, setFam] = useState<keyof typeof FAMILIES>('Group I');
  const f = FAMILIES[fam];
  return (
    <div className="visual">
      <Picker label="Compare" options={Object.keys(FAMILIES) as (keyof typeof FAMILIES)[]} value={fam} onChange={setFam} />
      <div className="visual-row">
        {f.members.map((s) => (
          <figure key={s}>
            <ShellDiagram shells={EL_BY_SYMBOL[s].shells} label={s} size={f.members.length > 4 ? 78 : 112} highlightOuter />
            <figcaption className="small muted">{EL_BY_SYMBOL[s].shells.join(',')}</figcaption>
          </figure>
        ))}
      </div>
      <p>{f.text}</p>
    </div>
  );
}

// ------------------------------------------------------------------ A5 bonding
export function BondingVisual() {
  const [kind, setKind] = useState<'Ionic' | 'Covalent' | 'Metallic'>('Ionic');
  const [done, setDone] = useState(false);
  return (
    <div className="visual">
      <Picker label="Type of bonding" options={['Ionic', 'Covalent', 'Metallic'] as const} value={kind} onChange={(k) => { setKind(k); setDone(false); }} />
      {kind === 'Ionic' && (
        <>
          <div className="visual-row">
            <ShellDiagram shells={done ? [2, 8] : [2, 8, 1]} label={done ? 'Na+' : 'Na'} size={140} highlightOuter={!done} />
            <div className="stack tight" style={{ alignSelf: 'center', alignItems: 'center' }}>
              <span className="chip new">{done ? 'attraction' : '1 electron'}</span>
              <span aria-hidden="true" style={{ fontSize: '1.6rem', lineHeight: 1 }}>{done ? '↔' : '→'}</span>
            </div>
            <ShellDiagram shells={done ? [2, 8, 8] : [2, 8, 7]} label={done ? 'Cl-' : 'Cl'} size={140} highlightOuter />
          </div>
          <div className="row"><button className="btn primary" type="button" onClick={() => setDone(!done)}>{done ? 'Reset' : 'Transfer the electron'}</button></div>
          <p>{done
            ? 'Sodium has lost its outer electron and chlorine has gained it. Both now have full outer shells, and the opposite charges attract strongly in every direction, building a giant lattice.'
            : 'A metal atom with one outer electron meets a non-metal atom that is one electron short of a full shell.'}</p>
        </>
      )}
      {kind === 'Covalent' && (
        <>
          <div className="visual-row">
            <svg viewBox="0 0 260 150" width="300" role="img" aria-label="Dot and cross diagram of a water molecule">
              <circle cx="130" cy="72" r="46" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
              <circle cx="62" cy="98" r="30" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
              <circle cx="198" cy="98" r="30" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
              <text x="130" y="77" textAnchor="middle" fontWeight="700" fontSize="15" fill="var(--ink)">O</text>
              <text x="52" y="103" textAnchor="middle" fontWeight="700" fontSize="15" fill="var(--ink)">H</text>
              <text x="208" y="103" textAnchor="middle" fontWeight="700" fontSize="15" fill="var(--ink)">H</text>
              {[[88, 84], [172, 84]].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill="var(--blue)" />
                  <text x={x} y={y + 16} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--orange)">×</text>
                </g>
              ))}
              {[[112, 30], [124, 27], [136, 27], [148, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="var(--blue)" />)}
            </svg>
          </div>
          <p>Two non-metals share electrons. In water, oxygen shares one pair with each hydrogen: a dot from oxygen and a cross from hydrogen in each overlap. Oxygen keeps two pairs to itself.</p>
          <p className="small muted">The bonds inside the molecule are strong, but the forces between separate molecules are weak, which is why simple molecular substances melt and boil easily.</p>
        </>
      )}
      {kind === 'Metallic' && (
        <>
          <div className="visual-row">
            <svg viewBox="0 0 260 130" width="300" role="img" aria-label="Metal ions in a sea of moving electrons">
              <rect x="2" y="2" width="256" height="126" rx="8" fill="var(--sunk)" stroke="var(--line)" />
              {Array.from({ length: 15 }, (_, i) => (
                <g key={i}>
                  <circle cx={34 + (i % 5) * 48} cy={26 + Math.floor(i / 5) * 39} r="14" fill="var(--blue)" />
                  <text x={34 + (i % 5) * 48} y={31 + Math.floor(i / 5) * 39} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--on-accent)">+</text>
                </g>
              ))}
              {Array.from({ length: 12 }, (_, i) => (
                <circle key={i} cx={58 + (i % 4) * 48} cy={46 + Math.floor(i / 4) * 30} r="4" fill="var(--orange)" className="ion" style={{ ['--dx' as string]: `${i % 2 ? 40 : -40}px`, animationDuration: `${2.4 + (i % 3) * 0.7}s`, animationDelay: `${-i * 0.4}s` }} />
              ))}
            </svg>
          </div>
          <p>Metal atoms give up their outer electrons into a shared "sea". The positive ions are held together by their attraction to these free-moving (delocalised) electrons.</p>
          <p className="small muted">The moving electrons carry current, so metals conduct. Layers of ions can slide without breaking the attraction, so metals bend instead of shattering.</p>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ A6 mole map
export function MoleMapVisual() {
  const [formula, setFormula] = useState('CO2');
  const [mass, setMass] = useState('4.4');
  let mr: number | null = null;
  try {
    mr = molarMass(formula);
  } catch {
    mr = null;
  }
  const g = parseFloat(mass);
  const n = mr && g > 0 ? g / mr : null;
  const node = (label: string, value: string, how: string) => (
    <div className="sheet flat stack tight" style={{ flex: '1 1 150px' }}>
      <p className="label">{label}</p>
      <p className="num" style={{ fontSize: '1.3rem', fontWeight: 700 }}>{value}</p>
      <p className="small muted">{how}</p>
    </div>
  );
  return (
    <div className="visual">
      <div className="row">
        <div className="field" style={{ flex: '1 1 130px' }}>
          <label htmlFor="mm-f">Formula</label>
          <input id="mm-f" className="input" value={formula} onChange={(e) => setFormula(e.target.value)} autoCapitalize="off" spellCheck={false} />
        </div>
        <div className="field" style={{ flex: '1 1 130px' }}>
          <label htmlFor="mm-g">Mass in grams</label>
          <input id="mm-g" className="input" inputMode="decimal" value={mass} onChange={(e) => setMass(e.target.value)} />
        </div>
      </div>
      {mr === null ? <p role="alert" style={{ color: 'var(--red)' }}>Check the formula: capitals matter (CO2, not co2).</p> : (
        <>
          <p>Formula mass of <Rich text={`[[${formula}]]`} /> = <strong>{mr}</strong>. Everything goes through moles:</p>
          <div className="row" style={{ alignItems: 'stretch' }}>
            {node('Moles', n === null ? '-' : `${fmt(n)} mol`, `mass ÷ formula mass = ${g > 0 ? g : '?'} ÷ ${mr}`)}
            {node('Particles', n === null ? '-' : `${(n * 6.0e23).toExponential(2).replace('e+', ' × 10^')}`, 'moles × 6.0 × 10²³')}
            {node('Gas volume at r.t.p.', n === null ? '-' : `${fmt(n * 24)} dm³`, 'moles × 24 dm³ (only if it is a gas)')}
            {node('In 250 cm³ of solution', n === null ? '-' : `${fmt(n / 0.25)} mol dm⁻³`, 'moles ÷ 0.250 dm³')}
          </div>
        </>
      )}
      <p className="small muted">Never go from one mass straight to another. Mass to moles, mole ratio from the equation, then moles to the answer.</p>
    </div>
  );
}

// ------------------------------------------------------------------ A7 pH scale
const UI_COLOURS = ['#d92121', '#e2441c', '#ea6a1c', '#f08c1e', '#f4b01f', '#f2d024', '#d2d32a', '#3fae49', '#2a9d8f', '#2a7fb8', '#2b63b3', '#3b4fb0', '#4b3fa6', '#5a3399', '#63288c'];
const EXAMPLES: [number, string][] = [[1, 'stomach acid'], [2, 'lime juice'], [3, 'vinegar'], [5.6, 'unpolluted rain'], [7, 'pure water'], [8, 'sea water'], [9, 'baking soda solution'], [10.5, 'milk of magnesia'], [12.4, 'limewater'], [14, 'sodium hydroxide solution']];
export function PhScaleVisual() {
  const [pH, setPH] = useState(7);
  const near = EXAMPLES.reduce((a, b) => (Math.abs(b[0] - pH) < Math.abs(a[0] - pH) ? b : a));
  const kind = pH < 7 ? (pH <= 3 ? 'strongly acidic' : 'weakly acidic') : pH === 7 ? 'neutral' : pH >= 11 ? 'strongly alkaline' : 'weakly alkaline';
  const exp = Math.round(pH);
  return (
    <div className="visual">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', borderRadius: 8, overflow: 'hidden' }} aria-hidden="true">
        {UI_COLOURS.map((c, i) => <div key={i} style={{ background: c, height: 34, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700, outline: i === exp ? '3px solid var(--ink)' : 'none', outlineOffset: -3 }}>{i}</div>)}
      </div>
      <div className="field">
        <label htmlFor="ph-slider">pH: <span className="num">{pH.toFixed(1)}</span> ({kind})</label>
        <input id="ph-slider" type="range" min="0" max="14" step="0.1" value={pH} onChange={(e) => setPH(Number(e.target.value))} />
      </div>
      <dl className="facts-list">
        <div><dt>Something with about this pH</dt><dd>{near[1]}</dd></div>
        <div><dt>Universal indicator</dt><dd><span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, background: UI_COLOURS[exp], verticalAlign: 'middle', marginRight: 6 }} />{exp <= 2 ? 'red' : exp <= 4 ? 'orange' : exp <= 6 ? 'yellow' : exp === 7 ? 'green' : exp <= 10 ? 'blue' : 'purple'}</dd></div>
        <div><dt>Litmus</dt><dd>{pH < 5 ? 'red' : pH > 8 ? 'blue' : 'purple'}</dd></div>
        <div><dt>Methyl orange</dt><dd>{pH < 3.1 ? 'red' : pH <= 4.4 ? 'orange' : 'yellow'}</dd></div>
        <div><dt>Phenolphthalein</dt><dd>{pH < 8.2 ? 'colourless' : 'pink'}</dd></div>
      </dl>
      <p>Each step down the scale means ten times more <Rich text="[[H+]]" /> ions. A solution of pH 2 is ten times more acidic than one of pH 3, and a hundred times more than pH 4.</p>
    </div>
  );
}

// ------------------------------------------------------------------ A8 redox
export function RedoxVisual() {
  const [done, setDone] = useState(false);
  return (
    <div className="visual">
      <div className="visual-row">
        <svg viewBox="0 0 320 150" width="340" role="img" aria-label={done ? 'Zinc has become a zinc ion and the copper ion has become a copper atom' : 'A zinc atom next to a copper ion'}>
          <circle cx="80" cy="66" r="38" fill={done ? '#cfd6dc' : '#8a8f94'} className="fade-fill" />
          <text x="80" y="72" textAnchor="middle" fontSize="18" fontWeight="700" fill="#10242e">{done ? 'Zn²⁺' : 'Zn'}</text>
          <circle cx="240" cy="66" r="38" fill={done ? '#a14a2a' : '#3d8fe0'} className="fade-fill" />
          <text x="240" y="72" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">{done ? 'Cu' : 'Cu²⁺'}</text>
          {[0, 1].map((i) => (
            <g key={i} style={{ transform: `translateX(${done ? 122 : 0}px)`, transition: 'transform 1.1s ease-in-out' }}>
              <circle cx={102} cy={48 + i * 34} r="9" fill="var(--orange)" />
              <text x={102} y={52 + i * 34} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">e⁻</text>
            </g>
          ))}
          <text x="80" y="128" textAnchor="middle" fontSize="11" fill="var(--muted)">oxidation number {done ? '+2' : '0'}</text>
          <text x="240" y="128" textAnchor="middle" fontSize="11" fill="var(--muted)">oxidation number {done ? '0' : '+2'}</text>
        </svg>
      </div>
      <div className="row"><button className="btn primary" type="button" onClick={() => setDone(!done)}>{done ? 'Reset' : 'Transfer the electrons'}</button></div>
      <dl className="facts-list">
        <div><dt>Zinc loses 2 electrons</dt><dd>oxidised (OIL)</dd></div>
        <div><dt>Copper(II) ions gain 2 electrons</dt><dd>reduced (RIG)</dd></div>
        <div><dt>Zinc supplies the electrons</dt><dd>reducing agent</dd></div>
        <div><dt>Copper(II) ions take them</dt><dd>oxidising agent</dd></div>
      </dl>
      <p className="equation"><Rich text="[[Zn -> Zn^2+ + 2e-]] and [[Cu^2+ + 2e- -> Cu]]" /></p>
    </div>
  );
}

// ------------------------------------------------------------------ A11 energy profile
export function EnergyProfileVisual() {
  const [kind, setKind] = useState<'Exothermic' | 'Endothermic'>('Exothermic');
  const [catalyst, setCatalyst] = useState(false);
  const exo = kind === 'Exothermic';
  const r = exo ? 80 : 130, p = exo ? 140 : 70, peak = 28, peakCat = Math.min(r, p) - 22;
  const curve = (top: number) => `M20 ${r} H80 C 120 ${r}, 125 ${top}, 150 ${top} C 175 ${top}, 180 ${p}, 220 ${p} H290`;
  return (
    <div className="visual">
      <Picker label="Type of reaction" options={['Exothermic', 'Endothermic'] as const} value={kind} onChange={setKind} />
      <div className="visual-row">
        <svg viewBox="0 0 310 190" width="340" role="img" aria-label={`Energy profile for an ${kind.toLowerCase()} reaction${catalyst ? ' with a catalyst' : ''}`}>
          <line x1="20" y1="10" x2="20" y2="175" stroke="var(--ink)" strokeWidth="1.5" /><line x1="20" y1="175" x2="300" y2="175" stroke="var(--ink)" strokeWidth="1.5" />
          <text x="12" y="92" fontSize="10" fill="var(--muted)" textAnchor="middle" transform="rotate(-90 12 92)">energy</text>
          <text x="160" y="187" fontSize="10" fill="var(--muted)" textAnchor="middle">progress of reaction</text>
          {catalyst && <path d={curve(peakCat)} fill="none" stroke="var(--green)" strokeWidth="2" strokeDasharray="5 4" />}
          <path d={curve(peak)} fill="none" stroke="var(--blue)" strokeWidth="2.6" />
          <text x="50" y={r - 6} fontSize="10" textAnchor="middle" fill="var(--ink)">reactants</text>
          <text x="258" y={p - 6} fontSize="10" textAnchor="middle" fill="var(--ink)">products</text>
          <line x1="100" y1={r} x2="100" y2={peak} stroke="var(--orange)" strokeWidth="1.4" />
          <text x="96" y={(r + peak) / 2} fontSize="9.5" textAnchor="end" fill="var(--orange)">activation energy</text>
          <line x1="250" y1={r} x2="250" y2={p} stroke="var(--violet)" strokeWidth="1.6" markerEnd="none" />
          <line x1="225" y1={r} x2="275" y2={r} stroke="var(--line)" strokeDasharray="3 3" />
          <text x="256" y={(r + p) / 2 + 3} fontSize="10" fontWeight="700" fill="var(--violet)">ΔH {exo ? 'negative' : 'positive'}</text>
        </svg>
      </div>
      <label className="check"><input type="checkbox" checked={catalyst} onChange={(e) => setCatalyst(e.target.checked)} /><span>Add a catalyst</span></label>
      <p>{exo
        ? 'The products have less energy than the reactants. The difference has been given out to the surroundings as heat, so the temperature rises and ΔH is negative.'
        : 'The products have more energy than the reactants. The difference has been taken in from the surroundings, so the temperature falls and ΔH is positive.'}</p>
      {catalyst && <p className="small muted">The catalyst gives a route with a lower hill (green dashes), so more collisions succeed. The start and end levels have not moved, so ΔH is unchanged.</p>}
    </div>
  );
}
