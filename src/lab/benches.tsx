// The virtual lab's experiments. Each bench is a self-contained component, so lessons can
// embed the one that matches their topic and the Lab page can show them all.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Rich } from '../components/Rich';
import { ShellDiagram } from '../components/ShellDiagram';
import { EL_BY_SYMBOL } from '../data/periodic';
import {
  ACID_VOLUME_CM3, ANION_REAGENTS, ANIONS, CATIONS, CELLS, combineElements, DIP_METALS, displacement, finalGasVolume, gasVolumeAt,
  halogenDisplacement, HALOGENS, INDICATORS, LAB_ELEMENT, LAB_ELEMENTS, METAL, METAL_REAGENTS, metalReaction, METALS, SALT_SOLUTIONS, SERIES,
  titrationPH, type Cation, type MetalReagent, type RateRun,
} from './reactions';
import { OutcomeCard, Picker, Vessel } from './Vessel';

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

// ------------------------------------------------------------ combine two elements
export function ElementsBench() {
  const [a, setA] = useState('Na');
  const [b, setB] = useState('Cl');
  const out = combineElements(a, b);
  const syms = LAB_ELEMENTS.map((e) => e.sym);
  const label = (s: string) => `${s} ${LAB_ELEMENT[s].name}`;
  const atoms = [a, b].map((s) => EL_BY_SYMBOL[s]);
  return (
    <div className="stack">
      <p className="muted">Pick any two elements and heat them together. See whether they react, what forms, and why.</p>
      <Picker label="First element" options={syms} value={a} onChange={setA} render={label} />
      <Picker label="Second element" options={syms} value={b} onChange={setB} render={label} />
      <div className="bench">
        <div className="row" style={{ justifyContent: 'center' }}>
          {atoms.map((el, i) => <ShellDiagram key={i} shells={el.shells} label={el.sym} size={118} highlightOuter />)}
          <Vessel effects={out.effects} wet={false} solid={out.reacts ? undefined : '#8a8f94'} />
        </div>
        <div className="stack">
          {out.bond && (
            <p>
              <span className="chip review">{out.bond === 'ionic' ? 'Ionic bonding' : 'Covalent bonding'}</span>{' '}
              Product: <strong>{out.predicted ? <Rich text={`[[${out.product}]]`} /> : out.product}</strong>
            </p>
          )}
          <OutcomeCard out={out} />
        </div>
      </div>
      <p className="small muted">Outer-shell electrons are shown in orange: they are the ones that are transferred or shared.</p>
    </div>
  );
}

// ------------------------------------------------------------ metals with water, acid, oxygen
export function MetalsBench() {
  const [m, setM] = useState('Mg');
  const [r, setR] = useState<MetalReagent>('dilute hydrochloric acid');
  const out = metalReaction(m, r);
  const wet = r === 'cold water' || r.startsWith('dilute');
  return (
    <div className="stack">
      <p className="muted">Put a metal into water, steam, acid or a flame and compare how vigorously each one reacts.</p>
      <Picker label="Metal" options={METALS.map((x) => x.sym)} value={m} onChange={setM} render={(s) => `${s} ${METAL[s].name}`} />
      <Picker label="Add it to" options={METAL_REAGENTS} value={r} onChange={setR} render={cap} />
      <div className="bench">
        <div className="stack tight" style={{ alignItems: 'center' }}>
          <Vessel effects={out.effects} wet={wet} solid="#9aa0a6" caption={`${cap(METAL[m].name)}: ${METAL[m].look}`} />
          <SeriesLadder highlight={m} />
        </div>
        <OutcomeCard out={out} />
      </div>
    </div>
  );
}

/** The reactivity series as a ladder, with carbon and hydrogen marking the extraction and acid cut-offs. */
export function SeriesLadder({ highlight, onPick }: { highlight?: string; onPick?: (sym: string) => void }) {
  return (
    <ol className="ladder" aria-label="Reactivity series, most reactive first">
      {SERIES.map((s) => {
        const marker = s === 'C' || s === 'H';
        const cls = `rung ${marker ? 'marker' : ''} ${s === highlight ? 'on' : ''}`;
        const text = marker ? (s === 'C' ? 'carbon' : 'hydrogen') : METAL[s].name;
        return (
          <li key={s}>
            {onPick && !marker
              ? <button type="button" className={cls} onClick={() => onPick(s)} aria-pressed={s === highlight}><strong>{s}</strong> {text}</button>
              : <span className={cls}><strong>{s}</strong> {text}</span>}
          </li>
        );
      })}
    </ol>
  );
}

// ------------------------------------------------------------ displacement
export function DisplacementBench() {
  const [mode, setMode] = useState<'Metals' | 'Halogens'>('Metals');
  const [metal, setMetal] = useState('Fe');
  const [salt, setSalt] = useState('Cu');
  const [hal, setHal] = useState('Cl');
  const [halide, setHalide] = useState('Br');
  const sol = SALT_SOLUTIONS.find((s) => s.cation === salt)!;
  const out = mode === 'Metals' ? displacement(metal, salt) : halogenDisplacement(hal, halide);
  const hName = (s: string) => HALOGENS.find((h) => h.sym === s)!;
  return (
    <div className="stack">
      <p className="muted">Does one element push another out of its compound? Predict first, then test.</p>
      <Picker label="Type of displacement" options={['Metals', 'Halogens'] as const} value={mode} onChange={setMode} />
      {mode === 'Metals' ? (
        <>
          <Picker label="Dip a strip of" options={DIP_METALS} value={metal} onChange={setMetal} render={(s) => `${s} ${METAL[s].name}`} />
          <Picker label="into a solution of" options={SALT_SOLUTIONS.map((s) => s.cation)} value={salt} onChange={setSalt} render={(c) => SALT_SOLUTIONS.find((s) => s.cation === c)!.name} />
        </>
      ) : (
        <>
          <Picker label="Add" options={HALOGENS.map((h) => h.sym)} value={hal} onChange={setHal} render={(s) => hName(s).water} />
          <Picker label="to a solution of" options={HALOGENS.map((h) => h.sym)} value={halide} onChange={setHalide} render={(s) => `potassium ${hName(s).name.replace('ine', 'ide')}`} />
        </>
      )}
      <div className="bench">
        <div className="row" style={{ justifyContent: 'center' }}>
          {mode === 'Metals' && <Vessel effects={{ liquid: sol.colour }} solid="#9aa0a6" caption="Before" />}
          <Vessel effects={mode === 'Metals' ? { liquid: sol.colour, ...out.effects } : out.effects} solid={mode === 'Metals' ? '#9aa0a6' : undefined} caption={mode === 'Metals' ? 'After a few minutes' : 'After mixing'} />
        </div>
        <OutcomeCard out={out} />
      </div>
    </div>
  );
}

// ------------------------------------------------------------ identifying ions
type Alkali = 'naoh' | 'nh3' | 'ki';
const ALKALI_NAME: Record<Alkali, string> = { naoh: 'Sodium hydroxide solution', nh3: 'Aqueous ammonia', ki: 'Potassium iodide solution' };
export function IonTestsBench() {
  const [kind, setKind] = useState<'Cations' | 'Anions' | 'Mystery sample'>('Cations');
  const [cat, setCat] = useState('Cu');
  const [alkali, setAlkali] = useState<Alkali>('naoh');
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [an, setAn] = useState('SO4');
  const [anTest, setAnTest] = useState<'acid' | 'barium' | 'silver' | 'nitrate'>('barium');
  const [mystery, setMystery] = useState(() => CATIONS[Math.floor(Math.random() * CATIONS.length)].id);
  const [guess, setGuess] = useState<string | null>(null);

  const cation: Cation = CATIONS.find((c) => c.id === (kind === 'Mystery sample' ? mystery : cat))!;
  const test = cation[alkali];
  const anion = ANIONS.find((x) => x.id === an)!;
  const reset = () => setStage(0);

  if (kind === 'Anions') {
    const t = anion.tests[anTest];
    return (
      <div className="stack">
        <IonKind kind={kind} setKind={(k) => { setKind(k); reset(); }} />
        <Picker label="Solution containing" options={ANIONS.map((x) => x.id)} value={an} onChange={setAn} render={(id) => `${ANIONS.find((x) => x.id === id)!.name} ions`} />
        <Picker label="Add" options={['acid', 'barium', 'silver', 'nitrate'] as const} value={anTest} onChange={setAnTest} render={(k) => cap(ANION_REAGENTS[k])} />
        <div className="bench">
          <Vessel effects={{ precipitate: t.precipitate, bubbles: t.bubbles ? 2 : 0 }} caption={`${cap(anion.name)} solution`} />
          <div className="stack">
            <div className="row"><span className={`chip ${t.positive ? 'ok' : ''}`}>{t.positive ? 'Positive test' : 'Observation'}</span></div>
            <p><Rich text={t.result} /></p>
            {t.equation && <p className="equation"><Rich text={`[[${t.equation}]]`} /></p>}
            {!t.positive && <p className="small muted">This reagent does not identify {anion.name} ions. Try another.</p>}
          </div>
        </div>
      </div>
    );
  }

  const shown = stage === 0 ? null : stage === 1 ? test.few : test.excess;
  const effects = stage === 0 ? { liquid: cation.solution }
    : stage === 1 ? { liquid: cation.solution, precipitate: test.precipitate }
      : { liquid: test.dissolvesInExcess ? test.excessLiquid ?? '#dbeaf0' : cation.solution, precipitate: test.dissolvesInExcess ? undefined : test.precipitate, bubbles: test.gas ? 1 : 0 };
  const isMystery = kind === 'Mystery sample';
  return (
    <div className="stack">
      <IonKind kind={kind} setKind={(k) => { setKind(k); reset(); setGuess(null); }} />
      {isMystery
        ? <p className="muted">This tube holds one unknown cation. Test fresh samples with each reagent, a few drops and then in excess, and work out what it is.</p>
        : <Picker label="Solution containing" options={CATIONS.map((c) => c.id)} value={cat} onChange={(v) => { setCat(v); reset(); }} render={(id) => `${CATIONS.find((c) => c.id === id)!.name} ions`} />}
      <Picker label="Reagent" options={['naoh', 'nh3', 'ki'] as const} value={alkali} onChange={(v) => { setAlkali(v); reset(); }} render={(k) => ALKALI_NAME[k]} />
      <div className="bench">
        <Vessel effects={effects} caption={isMystery ? 'Unknown solution' : `${cap(cation.name)} solution`} />
        <div className="stack">
          <div className="row">
            <button className="btn primary" type="button" disabled={stage >= 1} onClick={() => setStage(1)}>Add a few drops</button>
            <button className="btn" type="button" disabled={stage !== 1} onClick={() => setStage(2)}>Add excess</button>
            <button className="btn quiet" type="button" disabled={stage === 0} onClick={reset}>Fresh sample</button>
          </div>
          {shown ? <p aria-live="polite"><strong>Observation:</strong> <Rich text={shown} /></p> : <p className="muted">Nothing added yet.</p>}
          {!isMystery && stage > 0 && test.equation && <p className="equation"><Rich text={`[[${test.equation}]]`} /></p>}
          {!isMystery && cation.extra && <p className="small muted"><Rich text={cation.extra} /></p>}
        </div>
      </div>
      {isMystery && (
        <div className="sheet flat stack">
          <Picker label="Which cation is it?" options={CATIONS.map((c) => c.id)} value={guess ?? ''} onChange={setGuess} render={(id) => CATIONS.find((c) => c.id === id)!.name} />
          {guess === mystery && <p className="feedback right"><strong>Correct.</strong> It is the {cation.name} ion, <Rich text={`[[${cation.formula}]]`} />.</p>}
          {guess && guess !== mystery && (
            <p className="feedback wrong">
              {LOOKALIKE.has(guess) && LOOKALIKE.has(mystery)
                ? 'Close. Aluminium and lead(II) behave the same with both alkalis. Test a fresh sample with potassium iodide solution to tell them apart.'
                : 'Not that one. Compare your observations with each reagent, a few drops and then in excess, and try again.'}
            </p>
          )}
          <div><button className="btn" type="button" onClick={() => { setMystery(CATIONS[Math.floor(Math.random() * CATIONS.length)].id); setGuess(null); reset(); }}>New mystery sample</button></div>
        </div>
      )}
    </div>
  );
}
const LOOKALIKE = new Set(['Al', 'Pb']);
function IonKind({ kind, setKind }: { kind: 'Cations' | 'Anions' | 'Mystery sample'; setKind: (k: 'Cations' | 'Anions' | 'Mystery sample') => void }) {
  return <Picker label="What are you testing?" options={['Cations', 'Anions', 'Mystery sample'] as const} value={kind} onChange={setKind} />;
}

// ------------------------------------------------------------ electrolysis
export function ElectrolysisBench() {
  const [id, setId] = useState('NaCl-conc');
  const [on, setOn] = useState(true);
  const cell = CELLS.find((c) => c.id === id)!;
  const positive = cell.ions.filter((i) => i.endsWith('+'));
  const negative = cell.ions.filter((i) => i.endsWith('-'));
  return (
    <div className="stack">
      <p className="muted">Choose an electrolyte and switch on the current. Watch which ions move to each electrode and what forms there.</p>
      <div className="field">
        <label htmlFor="cell-pick">Electrolyte</label>
        <select id="cell-pick" className="input" value={id} onChange={(e) => setId(e.target.value)}>
          {CELLS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="bench">
        <div className="stack tight" style={{ alignItems: 'center' }}>
          <svg viewBox="0 0 260 230" width="260" role="img" aria-label={`Electrolysis cell: ${cell.cathode.product} forms at the cathode, ${cell.anode.product} at the anode`} className={on ? 'cell on' : 'cell'}>
            <path d="M70 34 V14 H190 V34" fill="none" stroke="var(--ink)" strokeWidth="2" />
            <rect x="112" y="4" width="36" height="20" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
            <text x="121" y="19" fontSize="13" fontWeight="700" fill="var(--ink)">-</text><text x="134" y="19" fontSize="13" fontWeight="700" fill="var(--ink)">+</text>
            <path d="M30 70 V205 a12 12 0 0 0 12 12 H218 a12 12 0 0 0 12 -12 V70" fill={cell.liquid} fillOpacity="0.55" stroke="var(--ink)" strokeWidth="2.4" />
            <rect x="62" y="34" width="16" height="150" fill={cell.cathode.deposit ?? '#3a3f44'} stroke="var(--ink)" strokeWidth="1.5" />
            <rect x="182" y="34" width="16" height={cell.anode.dissolves ? 120 : 150} fill={cell.electrodes.startsWith('copper') ? '#a14a2a' : '#3a3f44'} stroke="var(--ink)" strokeWidth="1.5" />
            <text x="70" y="226" textAnchor="middle" fontSize="10" fill="var(--muted)">cathode (-)</text>
            <text x="190" y="226" textAnchor="middle" fontSize="10" fill="var(--muted)">anode (+)</text>
            {on && positive.map((ionName, i) => <IonDot key={ionName} label={ionName} x={150} y={104 + i * 42} to={-58} colour="var(--blue)" />)}
            {on && negative.map((ionName, i) => <IonDot key={ionName} label={ionName} x={110} y={124 + i * 42} to={58} colour="var(--orange)" />)}
            {on && cell.cathode.gas && [0, 1, 2, 3].map((i) => <circle key={i} cx={56 + (i % 2) * 28} cy="180" r="3" fill="#fff" stroke="var(--muted)" strokeWidth="0.5" className="bubble tall" style={{ animationDelay: `${-i * 0.55}s` }} />)}
            {on && cell.anode.gas && [0, 1, 2, 3].map((i) => <circle key={i} cx={176 + (i % 2) * 28} cy="180" r="3" fill="#fff" stroke="var(--muted)" strokeWidth="0.5" className="bubble tall" style={{ animationDelay: `${-i * 0.55}s` }} />)}
          </svg>
          <button className="btn" type="button" onClick={() => setOn(!on)} aria-pressed={on}>{on ? 'Switch off the current' : 'Switch on the current'}</button>
          <p className="small muted">Electrodes: {cell.electrodes}. Ions present: {cell.ions.map((i, k) => <span key={i}>{k > 0 && ', '}<Rich text={`[[${i}]]`} /></span>)}</p>
        </div>
        <div className="stack">
          {(['cathode', 'anode'] as const).map((side) => (
            <div key={side}>
              <p className="label">{side === 'cathode' ? 'At the cathode (negative): reduction' : 'At the anode (positive): oxidation'}</p>
              <p>Product: <strong>{cell[side].product}</strong>. {cell[side].observe}</p>
              <p className="equation"><Rich text={`[[${cell[side].half}]]`} /></p>
            </div>
          ))}
          <div><p className="label">Why these products</p><p>{cell.why}</p></div>
          <p className="small muted">{cell.after}</p>
        </div>
      </div>
    </div>
  );
}
function IonDot({ label, x, y, to, colour }: { label: string; x: number; y: number; to: number; colour: string }) {
  return (
    <g className="ion" style={{ ['--dx' as string]: `${to}px` }}>
      <circle cx={x} cy={y} r="13" fill={colour} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="8.5" fontWeight="700" fill="var(--on-accent)">{label.replace('^', '').replace(/(\d)([+-])$/, '$1$2')}</text>
    </g>
  );
}

// ------------------------------------------------------------ rates of reaction
const RUN_COLOURS = ['var(--blue)', 'var(--orange)', 'var(--violet)'];
const T_MAX = 300;
export function RatesBench() {
  const [run, setRun] = useState<RateRun>({ concentration: 1, temperature: 25, size: 'small chips' });
  const [saved, setSaved] = useState<RateRun[]>([]);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - (t / T_MAX) * 6000;
    const tick = (now: number) => {
      const next = Math.min(T_MAX, ((now - start) / 6000) * T_MAX);
      setT(next);
      if (next < T_MAX) raf.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const change = (patch: Partial<RateRun>) => {
    setRun({ ...run, ...patch });
    setT(0);
    setPlaying(false);
  };
  const W = 320, H = 200, L = 40, B = 28, vMax = 250;
  const x = (s: number) => L + (s / T_MAX) * (W - L - 8);
  const y = (v: number) => H - B - (v / vMax) * (H - B - 10);
  const line = (r: RateRun, upTo = T_MAX) => Array.from({ length: 61 }, (_, i) => (i * T_MAX) / 60).filter((s) => s <= upTo + 0.01).map((s) => `${x(s).toFixed(1)},${y(gasVolumeAt(r, s)).toFixed(1)}`).join(' ');
  const now = gasVolumeAt(run, t);
  const describe = (r: RateRun) => `${r.concentration} mol dm⁻³, ${r.temperature} °C, ${r.size}`;

  return (
    <div className="stack">
      <p className="muted">Excess marble chips react with {ACID_VOLUME_CM3} cm³ of hydrochloric acid. Change one thing at a time and compare the curves.</p>
      <Picker label="Acid concentration (mol dm⁻³)" options={['0.5', '1', '2'] as const} value={String(run.concentration) as '0.5' | '1' | '2'} onChange={(v) => change({ concentration: Number(v) })} />
      <Picker label="Temperature (°C)" options={['15', '25', '35', '45'] as const} value={String(run.temperature) as '15' | '25' | '35' | '45'} onChange={(v) => change({ temperature: Number(v) })} />
      <Picker label="Marble" options={['large chips', 'small chips', 'powder'] as const} value={run.size} onChange={(v) => change({ size: v })} render={cap} />
      <div className="bench">
        <div className="stack tight">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Graph of gas volume against time. Current run reaches ${Math.round(finalGasVolume(run))} cubic centimetres.`} style={{ width: '100%', maxWidth: 420 }}>
            {[0, 50, 100, 150, 200, 250].map((v) => <g key={v}><line x1={L} x2={W - 8} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="0.7" /><text x={L - 5} y={y(v) + 3} textAnchor="end" fontSize="9" fill="var(--muted)">{v}</text></g>)}
            {[0, 60, 120, 180, 240, 300].map((s) => <text key={s} x={x(s)} y={H - B + 12} textAnchor="middle" fontSize="9" fill="var(--muted)">{s}</text>)}
            <text x={(W + L) / 2} y={H - 2} textAnchor="middle" fontSize="9.5" fill="var(--muted)">time / s</text>
            <text x="10" y={H / 2} textAnchor="middle" fontSize="9.5" fill="var(--muted)" transform={`rotate(-90 10 ${H / 2})`}>volume of gas / cm³</text>
            {saved.map((r, i) => <polyline key={i} points={line(r)} fill="none" stroke={RUN_COLOURS[(i + 1) % 3]} strokeWidth="1.8" strokeDasharray="5 4" />)}
            <polyline points={line(run, t)} fill="none" stroke={RUN_COLOURS[0]} strokeWidth="2.6" strokeLinejoin="round" />
            {t > 0 && <circle cx={x(t)} cy={y(now)} r="4" fill={RUN_COLOURS[0]} />}
          </svg>
          <div className="row">
            <button className="btn primary" type="button" onClick={() => { if (t >= T_MAX) setT(0); setPlaying(true); }} disabled={playing}>{t > 0 && t < T_MAX ? 'Continue' : 'Start the reaction'}</button>
            <button className="btn" type="button" disabled={t < T_MAX || saved.length >= 2} onClick={() => { setSaved([...saved, run]); setT(0); }}>Keep this curve to compare</button>
            {saved.length > 0 && <button className="btn quiet" type="button" onClick={() => setSaved([])}>Clear</button>}
          </div>
        </div>
        <div className="stack">
          <p aria-live="polite"><strong>Gas syringe:</strong> <span className="num">{Math.round(now)}</span> cm³ after <span className="num">{Math.round(t)}</span> s</p>
          <ul className="plain small">
            <li><span style={{ color: RUN_COLOURS[0] }}>Solid line</span>: {describe(run)}</li>
            {saved.map((r, i) => <li key={i}><span style={{ color: RUN_COLOURS[(i + 1) % 3] }}>Dashed line {i + 1}</span>: {describe(r)}</li>)}
          </ul>
          <div>
            <p className="label">What to notice</p>
            <ul className="plain">
              <li>A steeper curve means a faster reaction: more collisions each second have enough energy to react.</li>
              <li>The curve flattens when the acid runs out. The final volume depends only on how much acid there was.</li>
              <li>Doubling the concentration doubles the final volume, because there is twice as much acid.</li>
            </ul>
          </div>
          <p className="small muted">The curves come from a simplified model (rate doubles for each 10 °C). Real experiments show the same patterns with less tidy numbers.</p>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ titration
const UNKNOWNS = [0.06, 0.08, 0.1, 0.12, 0.15];
export function TitrationBench() {
  const [conc, setConc] = useState(() => UNKNOWNS[Math.floor(Math.random() * UNKNOWNS.length)]);
  const [ind, setInd] = useState<keyof typeof INDICATORS>('phenolphthalein');
  const [added, setAdded] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState<null | boolean>(null);
  const acid = 0.1, flask = 25;
  const pH = titrationPH(conc, flask, acid, added);
  const colour = INDICATORS[ind].colour(pH);
  const endPoint = (conc * flask) / acid;
  const past = added > endPoint + 0.3;
  const add = (v: number) => setAdded((a) => Math.min(50, Math.round((a + v) * 100) / 100));
  const fresh = (newUnknown: boolean) => {
    if (newUnknown) setConc(UNKNOWNS[Math.floor(Math.random() * UNKNOWNS.length)]);
    setAdded(0);
    setAnswer('');
    setChecked(null);
  };
  const steps = useMemo(() => [
    `Moles of HCl = ${acid.toFixed(3)} × ${endPoint.toFixed(2)} ÷ 1000 = ${((acid * endPoint) / 1000).toPrecision(3)} mol`,
    'Mole ratio HCl : NaOH is 1 : 1, so the flask held the same number of moles of NaOH.',
    `Concentration of NaOH = ${((acid * endPoint) / 1000).toPrecision(3)} ÷ (25.0 ÷ 1000) = ${conc.toFixed(3)} mol dm⁻³`,
  ], [conc, endPoint]);

  return (
    <div className="stack">
      <p className="muted">
        The flask holds 25.0 cm³ of sodium hydroxide of unknown concentration. Run in 0.100 mol dm⁻³ hydrochloric acid from the burette until the indicator just changes, then calculate the concentration.
      </p>
      <Picker label="Indicator" options={Object.keys(INDICATORS) as (keyof typeof INDICATORS)[]} value={ind} onChange={setInd} render={cap} />
      <div className="bench">
        <div className="stack tight" style={{ alignItems: 'center' }}>
          <svg viewBox="0 0 140 250" width="150" role="img" aria-label={`Burette reading ${added.toFixed(2)} cubic centimetres over a conical flask`}>
            <rect x="62" y="6" width="16" height="130" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.8" />
            <rect x="63.5" y={8 + (added / 50) * 126} width="13" height={126 - (added / 50) * 126} fill="#dbeaf0" />
            {[0, 10, 20, 30, 40, 50].map((v) => <g key={v}><line x1="78" x2="84" y1={8 + (v / 50) * 126} y2={8 + (v / 50) * 126} stroke="var(--ink)" strokeWidth="1" /><text x="87" y={11 + (v / 50) * 126} fontSize="8" fill="var(--muted)">{v}</text></g>)}
            <path d="M68 136 V152 M72 136 V152" stroke="var(--ink)" strokeWidth="1.8" />
            <path d="M52 160 H88 L86 172 L122 236 a6 6 0 0 1 -5 9 H23 a6 6 0 0 1 -5 -9 L54 172 Z" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M40 200 L21 236 a4 4 0 0 0 3 6 H116 a4 4 0 0 0 3 -6 L100 200 Z" fill={colour} className="fade-fill" />
          </svg>
          <p className="num" aria-live="polite">Burette: {added.toFixed(2)} cm³</p>
        </div>
        <div className="stack">
          <div className="row">
            <button className="btn" type="button" onClick={() => add(5)}>Add 5 cm³</button>
            <button className="btn" type="button" onClick={() => add(1)}>Add 1 cm³</button>
            <button className="btn primary" type="button" onClick={() => add(0.05)}>Add one drop</button>
          </div>
          <p>
            Flask colour: <strong>{INDICATORS[ind].nameAt(pH)}</strong>.{' '}
            {past ? 'You have overshot the end point. Start a fresh run and add drop by drop near the colour change.' : `Expect ${INDICATORS[ind].change} at the end point.`}
          </p>
          <div className="row">
            <button className="btn quiet" type="button" onClick={() => fresh(false)}>Repeat with a fresh 25.0 cm³</button>
            <button className="btn quiet" type="button" onClick={() => fresh(true)}>New unknown solution</button>
          </div>
          <form
            className="stack tight"
            onSubmit={(e) => {
              e.preventDefault();
              const v = parseFloat(answer);
              if (Number.isFinite(v)) setChecked(Math.abs(v - conc) <= conc * 0.03);
            }}
          >
            <div className="field">
              <label htmlFor="titre-answer">Your value for the NaOH concentration (mol dm⁻³)</label>
              <div className="answer-row">
                <input id="titre-answer" className="input" inputMode="decimal" value={answer} onChange={(e) => { setAnswer(e.target.value); setChecked(null); }} />
                <button className="btn primary" type="submit">Check</button>
              </div>
            </div>
            {checked !== null && (
              <div className={`feedback ${checked ? 'right' : 'wrong'}`} role="status">
                <h3>{checked ? 'Correct' : 'Not yet'}</h3>
                {!checked && <p>Use the burette reading at the moment the colour first changed (about {endPoint.toFixed(2)} cm³).</p>}
                <ol className="steps">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
              </div>
            )}
          </form>
          <p className="small muted"><Rich text="[[NaOH + HCl -> NaCl + H2O]]. In a real titration you would do a rough run first, then repeat until two titres agree within 0.10 cm³." /></p>
        </div>
      </div>
    </div>
  );
}
