import { useMemo, useState, type CSSProperties } from 'react';
import { ShellDiagram } from '../components/ShellDiagram';
import { ALL_ELEMENTS, CATEGORIES, CSEC_NOTES, groupLabel, PROPERTIES, simpleIon, toC, type El } from '../data/periodic';

type ColourBy = 'category' | 'state' | string;

const fmt = (v: number | null, unit = '') => (v === null ? 'Not known' : `${Math.abs(v) >= 1000 ? Math.round(v) : Number(v.toPrecision(4))}${unit ? ' ' + unit : ''}`);

/** A value's place between the smallest and largest in the table, 0 to 1 (on a log scale for density). */
function scale(id: string): (e: El) => number | null {
  const prop = PROPERTIES.find((p) => p.id === id)!;
  const tx = (v: number) => (id === 'density' ? Math.log10(v) : v);
  const vals = ALL_ELEMENTS.map(prop.get).filter((v): v is number => v !== null).map(tx);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return (e) => {
    const v = prop.get(e);
    return v === null ? null : (tx(v) - lo) / (hi - lo);
  };
}

function TrendBars({ title, elements, selected, propId }: { title: string; elements: El[]; selected: El; propId: string }) {
  const prop = PROPERTIES.find((p) => p.id === propId)!;
  const vals = elements.map(prop.get);
  const known = vals.filter((v): v is number => v !== null);
  if (known.length < 2) return null;
  const lo = Math.min(0, ...known);
  const hi = Math.max(...known);
  return (
    <div className="stack tight">
      <p className="label">{title}</p>
      {elements.map((e, i) => (
        <div key={e.z} className="meter" style={{ gridTemplateColumns: '2.6em 1fr 5.5em' }}>
          <span className="num small" style={{ fontWeight: e.z === selected.z ? 800 : 500 }}>{e.sym}</span>
          <div className="bar">
            {vals[i] !== null && <span style={{ width: `${Math.max(2, ((vals[i]! - lo) / (hi - lo || 1)) * 100)}%`, background: e.z === selected.z ? 'var(--orange)' : 'var(--blue)' }} />}
          </div>
          <span className="num small">{vals[i] === null ? '-' : fmt(vals[i], prop.unit)}</span>
        </div>
      ))}
    </div>
  );
}

function Detail({ e, trend, setTrend }: { e: El; trend: string; setTrend: (id: string) => void }) {
  const cat = CATEGORIES[e.cat];
  const ion = simpleIon(e);
  const groupMates = e.group > 0 ? ALL_ELEMENTS.filter((x) => x.group === e.group) : [];
  const periodMates = ALL_ELEMENTS.filter((x) => x.period === e.period && x.group > 0);
  const outer = e.shells[e.shells.length - 1];
  const facts: [string, string][] = [
    ['Atomic number', String(e.z)],
    ['Relative atomic mass', e.mass === null ? 'Not known' : String(Number(e.mass.toPrecision(6)))],
    ['Position', `${groupLabel(e)}, Period ${e.period}`],
    ['State at room temperature', e.state ? `${e.state}${e.stateKnown ? '' : ' (predicted)'}` : 'Not known'],
    ['Electrons in each shell', e.shells.join(', ')],
    ['Electron configuration', `${e.config}${e.predicted ? ' (predicted)' : ''}`],
    ['Melting point', fmt(toC(e.mpK), '°C')],
    ['Boiling point', fmt(toC(e.bpK), '°C')],
    ['Density', fmt(e.density, 'g/cm³')],
    ['Electronegativity', fmt(e.en)],
    ['First ionisation energy', fmt(e.ie, 'eV')],
    ['Atomic radius', fmt(e.radius, 'pm')],
    ['Oxidation states', e.ox ?? 'Not known'],
    ['Discovered', e.year ?? 'Not known'],
  ];
  return (
    <section className="sheet stack" aria-live="polite">
      <div className="el-head">
        <div className={`pt-cell big cat-${cat.cls}`}>
          <small>{e.z}</small>
          <strong>{e.sym}</strong>
          <span>{e.mass === null ? '' : Number(e.mass.toPrecision(4))}</span>
        </div>
        <div className="stack tight">
          <h2>{e.name}</h2>
          <p className="muted">{cat.label.replace(/ \(.*\)/, '')}</p>
          {ion && <p>Usual ion: <strong>{ion}</strong></p>}
        </div>
      </div>

      {CSEC_NOTES[e.sym] && (
        <div className="feedback right">
          <p className="label">For CSEC</p>
          <p>{CSEC_NOTES[e.sym]}</p>
        </div>
      )}

      <div className="el-body">
        <div className="stack tight" style={{ alignItems: 'center' }}>
          <ShellDiagram shells={e.shells} label={e.sym} size={190} highlightOuter />
          <p className="small muted" style={{ textAlign: 'center' }}>
            {e.shells.length} {e.shells.length === 1 ? 'shell' : 'shells'}, {outer} outer {outer === 1 ? 'electron' : 'electrons'} (orange)
          </p>
        </div>
        <dl className="facts-list">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="stack">
        <div className="field">
          <label htmlFor="pt-trend">See the trend in</label>
          <select id="pt-trend" className="input" value={trend} onChange={(ev) => setTrend(ev.target.value)}>
            {PROPERTIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        {groupMates.length > 1 && <TrendBars title={`Down ${groupLabel(e).replace(/ \(.*\)/, '')}`} elements={groupMates} selected={e} propId={trend} />}
        <TrendBars title={`Across Period ${e.period}`} elements={periodMates} selected={e} propId={trend} />
        {PROPERTIES.find((p) => p.id === trend)?.note && <p className="small muted">{PROPERTIES.find((p) => p.id === trend)!.note}</p>}
      </div>
    </section>
  );
}

export function PeriodicTable() {
  const [selected, setSelected] = useState<El>(ALL_ELEMENTS[10]);
  const [colourBy, setColourBy] = useState<ColourBy>('category');
  const [query, setQuery] = useState('');
  const [trend, setTrend] = useState('radius');

  const scaler = useMemo(() => (colourBy === 'category' || colourBy === 'state' ? null : scale(colourBy)), [colourBy]);
  const q = query.trim().toLowerCase();
  const matches = (e: El) => !q || e.name.toLowerCase().includes(q) || e.sym.toLowerCase() === q || String(e.z) === q;
  const found = q ? ALL_ELEMENTS.filter(matches) : [];

  const cellProps = (e: El): { className: string; style: CSSProperties } => {
    let cls = 'pt-cell';
    const style: Record<string, string | number> = { gridColumn: e.x, gridRow: e.y };
    if (colourBy === 'category') cls += ` cat-${CATEGORIES[e.cat].cls}`;
    else if (colourBy === 'state') cls += ` state-${(e.state ?? 'unknown').toLowerCase()}`;
    else {
      const t = scaler!(e);
      if (t === null) cls += ' no-data';
      else style['--t'] = t;
      cls += ' heat';
    }
    if (e.z === selected.z) cls += ' on';
    if (q && !matches(e)) cls += ' dim';
    return { className: cls, style: style as CSSProperties };
  };

  return (
    <div className="page wide">
      <header className="stack tight">
        <h1>Periodic table</h1>
        <p className="muted">All 118 elements. Tap one to see its shells, properties and what CSEC expects you to know about it.</p>
      </header>

      <div className="row" style={{ alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: '1 1 200px' }}>
          <label htmlFor="pt-search">Find an element</label>
          <input
            id="pt-search" className="input" value={query} placeholder="Name, symbol or atomic number"
            onChange={(ev) => {
              setQuery(ev.target.value);
              const v = ev.target.value.trim().toLowerCase();
              const hit = v && ALL_ELEMENTS.find((e) => e.sym.toLowerCase() === v || e.name.toLowerCase() === v || String(e.z) === v);
              if (hit) setSelected(hit);
            }}
          />
        </div>
        <div className="field" style={{ flex: '1 1 200px' }}>
          <label htmlFor="pt-colour">Colour the table by</label>
          <select id="pt-colour" className="input" value={colourBy} onChange={(ev) => setColourBy(ev.target.value)}>
            <option value="category">Type of element</option>
            <option value="state">State at room temperature</option>
            {PROPERTIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
      </div>
      {q && <p className="small muted" role="status">{found.length === 0 ? 'No element matches that.' : `${found.length} ${found.length === 1 ? 'match' : 'matches'}: ${found.slice(0, 8).map((e) => e.name).join(', ')}${found.length > 8 ? '...' : ''}`}</p>}

      <div className="scroll-x">
        <div className="pt-grid" role="grid" aria-label="Periodic table of the elements">
          {ALL_ELEMENTS.map((e) => (
            <button key={e.z} type="button" {...cellProps(e)} onClick={() => setSelected(e)} aria-label={`${e.name}, atomic number ${e.z}`} aria-pressed={e.z === selected.z}>
              <small>{e.z}</small>
              <strong>{e.sym}</strong>
            </button>
          ))}
          <span className="pt-note" style={{ gridColumn: '3', gridRow: 6 }}>57-71</span>
          <span className="pt-note" style={{ gridColumn: '3', gridRow: 7 }}>89-103</span>
        </div>
      </div>

      {colourBy === 'category' ? (
        <div className="legend">
          {Object.values(CATEGORIES).map((c) => <span key={c.cls}><i className={`cat-${c.cls}`} style={{ borderColor: 'transparent' }} />{c.label}</span>)}
        </div>
      ) : colourBy === 'state' ? (
        <div className="legend">
          {['Solid', 'Liquid', 'Gas'].map((st) => <span key={st}><i className={`state-${st.toLowerCase()}`} style={{ borderColor: 'transparent' }} />{st}</span>)}
        </div>
      ) : (
        <p className="small muted">Darker blue means a higher value. Cells with a dashed outline have no measured value.</p>
      )}

      <Detail e={selected} trend={trend} setTrend={setTrend} />

      <p className="small muted">
        Element data from PubChem (National Library of Medicine, public domain). For calculations, CSEC papers give rounded relative atomic masses, which the app's calculators use.
      </p>
    </div>
  );
}
