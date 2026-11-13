import { Link } from 'react-router-dom';
import { Rich } from '../components/Rich';
import { ANION_LIST, CATION_LIST, SOLUBILITY_RULES } from '../content/ions';
import { ANIONS, CATIONS, GAS_TESTS } from '../lab/reactions';
import { SeriesLadder } from '../lab/benches';

/** Everything a CSEC student is expected to know by heart, on one page. */
export function Reference() {
  return (
    <div className="page">
      <header className="stack tight">
        <h1>Quick reference</h1>
        <p className="muted">The facts you need at your fingertips. Built from the same data the lab and the questions use.</p>
      </header>

      <section className="stack">
        <h2>Common ions</h2>
        <div className="scroll-x">
          <table className="data">
            <thead><tr><th>Positive ions</th><th>Negative ions</th></tr></thead>
            <tbody>
              {Array.from({ length: Math.max(CATION_LIST.length, ANION_LIST.length) }, (_, i) => (
                <tr key={i}>
                  <td>{CATION_LIST[i] && <>{CATION_LIST[i].name} <Rich text={`[[${CATION_LIST[i].formula}]]`} /></>}</td>
                  <td style={{ textAlign: 'left' }}>{ANION_LIST[i] && <>{ANION_LIST[i].name} <Rich text={`[[${ANION_LIST[i].formula}]]`} /></>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted"><Rich text="To write a formula, take enough of each ion for the charges to cancel: [[Al^3+]] and [[SO4^2-]] give [[Al2(SO4)3]]." /></p>
      </section>

      <section className="stack">
        <h2>Solubility rules</h2>
        <div>
          {SOLUBILITY_RULES.map(([rule, ex]) => (
            <div key={rule} className="trap"><p className="label">{rule}</p><p className="muted">{ex}</p></div>
          ))}
        </div>
      </section>

      <section className="stack">
        <h2>Reactivity series</h2>
        <SeriesLadder />
        <p className="small muted">Above carbon: extracted by electrolysis. Below carbon: reduced with carbon. Above hydrogen: react with dilute acids to give hydrogen.</p>
      </section>

      <section className="stack">
        <h2>Tests for cations</h2>
        <div className="scroll-x">
          <table className="data">
            <thead><tr><th>Ion</th><th>Sodium hydroxide</th><th>Aqueous ammonia</th></tr></thead>
            <tbody>
              {CATIONS.map((c) => (
                <tr key={c.id}>
                  <td><Rich text={`[[${c.formula}]]`} /></td>
                  <td style={{ textAlign: 'left' }}>{c.naoh.few} {c.naoh.excess}</td>
                  <td style={{ textAlign: 'left' }}>{c.nh3.few} {c.nh3.excess}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">Aluminium and lead(II) look the same with both alkalis; potassium iodide gives a yellow precipitate only with lead(II).</p>
      </section>

      <section className="stack">
        <h2>Tests for anions</h2>
        <div className="scroll-x">
          <table className="data">
            <thead><tr><th>Ion</th><th>Test</th><th>Positive result</th></tr></thead>
            <tbody>
              {ANIONS.map((a) => {
                const t = Object.values(a.tests).find((x) => x.positive)!;
                return <tr key={a.id}><td><Rich text={`[[${a.formula}]]`} /></td><td style={{ textAlign: 'left' }}>{t.reagent}</td><td style={{ textAlign: 'left' }}>{t.result}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="stack">
        <h2>Tests for gases</h2>
        <div className="scroll-x">
          <table className="data">
            <thead><tr><th>Gas</th><th>Test</th><th>Result</th></tr></thead>
            <tbody>{GAS_TESTS.map((g) => <tr key={g.formula}><td>{g.gas}</td><td style={{ textAlign: 'left' }}>{g.test}</td><td style={{ textAlign: 'left' }}>{g.result}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="stack">
        <h2>Numbers to know</h2>
        <dl className="facts-list">
          <div><dt>One mole of particles</dt><dd>6.0 × 10²³</dd></div>
          <div><dt>Volume of 1 mol of any gas at r.t.p.</dt><dd>24 dm³</dd></div>
          <div><dt>Charge on 1 mol of electrons (Faraday)</dt><dd>96 500 C</dd></div>
          <div><dt>Specific heat capacity of water</dt><dd>4.2 J g⁻¹ °C⁻¹</dd></div>
          <div><dt>Volume conversion</dt><dd>1 dm³ = 1000 cm³</dd></div>
        </dl>
      </section>

      <p className="small muted">See the <Link to="/periodic-table">periodic table</Link> for every element, or try any of this in the <Link to="/lab">virtual lab</Link>.</p>
    </div>
  );
}
