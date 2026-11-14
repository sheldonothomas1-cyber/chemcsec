import { Link } from 'react-router-dom';
import { ScaleDrill } from '../components/ScaleReader';
import { P3_ABOUT, P3_GUIDE, P3_SKILLS, P3_TOTAL, PAPER3 } from '../content/paper3';
import { useStore } from '../store';

/** Paper 03: practical skills, for the SBA and for private candidates sitting Paper 03/2. */
export function Paper3Hub() {
  const s = useStore();
  return (
    <div className="page">
      <header className="stack tight">
        <Link to="/exam" className="small">Exam practice</Link>
        <h1>Paper 03: practical skills</h1>
        <p className="muted">
          For the SBA (Paper 03/1) and for private candidates sitting the written alternative (Paper 03/2). Practise reading instruments,
          observations and inferences, graphs, calculations and planning an investigation.
        </p>
      </header>

      <section className="stack">
        <h2>Practice questions</h2>
        <p className="muted small">Write your answer, then mark it yourself against a mark scheme split into single marks.</p>
        <div className="list">
          {PAPER3.map((q) => {
            const last = s.p2[q.id];
            return (
              <Link key={q.id} to={`/exam/paper3/${q.id}`}>
                <span>
                  <h3>{q.title}</h3>
                  <span className="small muted">{P3_SKILLS[q.skill].name}, {P3_TOTAL(q)} marks</span>
                </span>
                <span className="go num">{last ? `${last.score}/${last.max}` : 'Start'}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="stack" id="read-the-scale">
        <h2>Read the scale</h2>
        <p className="muted small">Reading an instrument to the wrong number of decimal places loses easy marks. Keep going until it is automatic.</p>
        <ScaleDrill />
      </section>

      <section className="stack" id="p3-rules">
        <h2>The rules examiners mark by</h2>
        {P3_GUIDE.map((g) => (
          <details key={g.skill} className="sheet flat">
            <summary>
              <strong>{P3_SKILLS[g.skill].name}</strong>
              <span className="small muted"> ({P3_SKILLS[g.skill].short}): {g.title}</span>
            </summary>
            <ul className="steps" style={{ marginTop: 10 }}>
              {g.rules.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </details>
        ))}
      </section>

      <section className="stack">
        <h2>Practise in the virtual lab</h2>
        <div className="row">
          <Link className="btn" to="/lab/ions">Identify ions (observations and inferences)</Link>
          <Link className="btn" to="/lab/titration">Titration</Link>
          <Link className="btn" to="/lab/rates">Rates (graphs from data)</Link>
        </div>
      </section>

      <section className="stack">
        <h2>About Paper 03</h2>
        <dl className="facts-list">
          {P3_ABOUT.map(([dt, dd]) => <div key={dt}><dt>{dt}</dt><dd>{dd}</dd></div>)}
        </dl>
        <p className="small muted">
          Doing the SBA? Check your lab reports against the <Link to="/sba">SBA skills checklist</Link>. CXC's subject reports say where candidates lost
          Paper 03 marks; they are free on cxc.org (see <Link to="/resources">Resources</Link>).
        </p>
      </section>
    </div>
  );
}
