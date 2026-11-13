import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DisplacementBench, ElectrolysisBench, ElementsBench, IonTestsBench, MetalsBench, RatesBench, TitrationBench } from '../lab/benches';

export const BENCHES: { id: string; name: string; blurb: string; topic: string; el: () => ReactNode }[] = [
  { id: 'elements', name: 'Combine elements', blurb: 'Heat two elements together and see what forms', topic: 'A5', el: () => <ElementsBench /> },
  { id: 'metals', name: 'Metals', blurb: 'Metals with water, steam, acids and oxygen', topic: 'C1', el: () => <MetalsBench /> },
  { id: 'displacement', name: 'Displacement', blurb: 'Can one element push another out of its compound?', topic: 'C1', el: () => <DisplacementBench /> },
  { id: 'ions', name: 'Identify ions', blurb: 'Precipitate tests, and a mystery sample to solve', topic: 'C4', el: () => <IonTestsBench /> },
  { id: 'electrolysis', name: 'Electrolysis', blurb: 'Watch ions move and see what forms at each electrode', topic: 'A9', el: () => <ElectrolysisBench /> },
  { id: 'rates', name: 'Rates of reaction', blurb: 'Change concentration, temperature and surface area', topic: 'A10', el: () => <RatesBench /> },
  { id: 'titration', name: 'Titration', blurb: 'Find an unknown concentration, drop by drop', topic: 'A7', el: () => <TitrationBench /> },
];

export function Lab() {
  const { bench } = useParams();
  const current = BENCHES.find((b) => b.id === bench);
  if (!current) {
    return (
      <div className="page">
        <header className="stack tight">
          <h1>Virtual lab</h1>
          <p className="muted">Mock experiments you can run as often as you like. Every result follows the chemistry in the syllabus, and every equation is checked by the app.</p>
        </header>
        <div className="list">
          {BENCHES.map((b) => (
            <Link key={b.id} to={`/lab/${b.id}`}>
              <span>
                <h3>{b.name}</h3>
                <span className="small muted">{b.blurb}</span>
              </span>
              <span className="go">Open</span>
            </Link>
          ))}
        </div>
        <p className="small muted">A simulation shows what should happen, not how to handle chemicals safely. Real experiments need a teacher, goggles and a proper laboratory.</p>
      </div>
    );
  }
  return (
    <div className="page wide">
      <header className="stack tight">
        <Link to="/lab" className="small">Virtual lab</Link>
        <h1>{current.name}</h1>
      </header>
      {current.el()}
      <div className="row">
        <Link className="btn" to={`/learn/${current.topic}`}>Read the lesson for this</Link>
        <Link className="btn quiet" to={`/practice/topic/${current.topic}`}>Practise questions on it</Link>
      </div>
    </div>
  );
}
