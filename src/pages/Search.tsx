import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchAll, type HitKind } from '../search';

const IDEAS = ['mole', 'titration', 'Na', 'electrolysis', 'test for chloride', 'esters', 'burette', 'planning and design', 'rates graph', 'isotopes'];

/** One search box for the whole app. Works offline: everything it searches is on the device. */
export function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [kind, setKind] = useState<HitKind | 'All'>('All');
  const results = useMemo(() => searchAll(query, 80), [query]);
  const kinds = useMemo(() => [...new Set(results.map((r) => r.kind))], [results]);
  const shown = kind === 'All' || !kinds.includes(kind) ? results : results.filter((r) => r.kind === kind);
  const setQuery = (q: string) => setParams(q ? { q } : {}, { replace: true });

  return (
    <div className="page">
      <header className="stack tight">
        <h1>Search</h1>
        <p className="muted">Topics, lessons, elements, lab experiments, exam questions, videos and pages. Works offline.</p>
      </header>
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search-q" className="sr-only">Search ChemCSEC</label>
        <input
          id="search-q" className="input search-input" type="search" autoFocus autoComplete="off" enterKeyHint="search"
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: mole, Na, titration, test for chloride"
        />
      </form>

      {!query && (
        <section className="stack tight">
          <p className="label">Try one of these</p>
          <div className="row">
            {IDEAS.map((x) => <button key={x} type="button" className="btn" style={{ minHeight: 40, padding: '0 14px' }} onClick={() => setQuery(x)}>{x}</button>)}
          </div>
        </section>
      )}

      {query && results.length === 0 && (
        <p className="muted">
          Nothing matched "{query}". Try one key word, such as "acid" or "electrolysis", or ask the <Link to="/tutor">AI tutor</Link>.
        </p>
      )}

      {kinds.length > 1 && (
        <div className="row" role="group" aria-label="Show only">
          {(['All', ...kinds] as const).map((k) => (
            <button key={k} type="button" className={`btn pick ${kind === k || (k === 'All' && !kinds.includes(kind as HitKind)) ? 'on' : ''}`}
              style={{ minHeight: 36, padding: '0 12px' }} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {k}
            </button>
          ))}
        </div>
      )}

      {shown.length > 0 && (
        <>
          <p className="small muted" role="status">{shown.length === 80 ? 'Top 80 results' : `${shown.length} result${shown.length === 1 ? '' : 's'}`}</p>
          <div className="list">
            {shown.map((r) => (
              <Link key={`${r.kind}|${r.title}|${r.to}`} to={r.to}>
                <span>
                  <h3>{r.title}</h3>
                  <span className="small muted">{r.sub}</span>
                </span>
                <span className="chip">{r.kind}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
