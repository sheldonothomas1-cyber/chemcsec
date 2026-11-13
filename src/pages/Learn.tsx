import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { LessonVideos } from '../components/LessonVideos';
import { Rich } from '../components/Rich';
import { VISUALS } from '../visuals';
import { TileLegend, TopicTile } from '../components/Tile';
import { LESSON_BY_TOPIC, phetUrl } from '../content/lessons';
import { SECTIONS, TOPICS, TOPIC_BY_ID, type SectionId } from '../content/syllabus';
import { BAND_LABEL, band } from '../engine/bkt';
import type { ReviewGrade } from '../engine/scheduler';
import { blockers, objN, objP } from '../engine/select';
import { rateLessonCheck, useStore } from '../store';

export function LearnMap() {
  return (
    <div className="page wide">
      <header className="stack tight">
        <h1>The whole syllabus on one page</h1>
        <p className="muted">
          Eighteen topics in the order CXC sets them out. Each tile fills as you master it, turning from orange to green.
        </p>
        <TileLegend />
      </header>
      {(Object.keys(SECTIONS) as SectionId[]).map((sec) => (
        <section key={sec} className="stack">
          <div>
            <h2>Section {sec}: {SECTIONS[sec].name}</h2>
            <p className="muted small">{SECTIONS[sec].note}</p>
          </div>
          <div className="tiles">
            {TOPICS.filter((t) => t.section === sec).map((t) => <TopicTile key={t.id} topic={t} />)}
          </div>
        </section>
      ))}
      <p className="small muted">
        Topic wording is this app's working summary of syllabus CXC 21/G/SYLL 13. For the official objectives, download the free
        syllabus eBook from the CXC Store (see <Link to="/resources">Resources</Link>).
      </p>
    </div>
  );
}

const RATINGS: [ReviewGrade, string][] = [
  ['again', 'I got it wrong'],
  ['hard', 'Partly right'],
  ['good', 'Right'],
  ['easy', 'Right and easy'],
];

function Recall({ topicId }: { topicId: string }) {
  const lesson = LESSON_BY_TOPIC[topicId];
  const [answer, setAnswer] = useState('');
  const [shown, setShown] = useState(false);
  const [rated, setRated] = useState(false);
  return (
    <section className="sheet stack" id="recall">
      <h2>Recall question</h2>
      <p className="q-stem"><Rich text={lesson.check.q} /></p>
      {!shown ? (
        <>
          <div className="field">
            <label htmlFor="recall-answer">Write your answer from memory</label>
            <textarea id="recall-answer" className="input" value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </div>
          <button className="btn primary" type="button" onClick={() => setShown(true)}>Show the model answer</button>
        </>
      ) : (
        <>
          {answer.trim() && (
            <div>
              <p className="label">Your answer</p>
              <p className="muted">{answer}</p>
            </div>
          )}
          <div className="feedback right">
            <p className="label">Model answer</p>
            <p><Rich text={lesson.check.a} /></p>
          </div>
          {rated ? (
            <p className="muted">Saved. This question will come back when you are about to forget it.</p>
          ) : (
            <div className="stack tight">
              <p className="label">How did you do?</p>
              <div className="row">
                {RATINGS.map(([grade, label]) => (
                  <button
                    key={grade} className="btn" type="button"
                    onClick={() => {
                      rateLessonCheck(topicId, grade);
                      setRated(true);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function TopicPage() {
  const { topicId = '' } = useParams();
  const { hash } = useLocation();
  const s = useStore();
  const topic = TOPIC_BY_ID[topicId];
  const lesson = LESSON_BY_TOPIC[topicId];
  const [sim, setSim] = useState(false);

  useEffect(() => {
    setSim(false);
    if (hash === '#recall') document.getElementById('recall')?.scrollIntoView();
  }, [topicId, hash]);

  if (!topic || !lesson) {
    return (
      <div className="page">
        <h1>That topic does not exist</h1>
        <Link className="btn primary" to="/learn">Open the syllabus map</Link>
      </div>
    );
  }
  const waitingOn = blockers(s, topic);
  const idx = TOPICS.indexOf(topic);
  const nextT = TOPICS[idx + 1];

  return (
    <div className="page">
      <header className="stack">
        <Link to="/learn" className="small">All topics</Link>
        <div className="lesson-head">
          <TopicTile topic={topic} link={false} />
          <div className="stack tight">
            <p className="muted small">Section {topic.section}: {SECTIONS[topic.section].name}</p>
            <h1>{topic.name}</h1>
          </div>
        </div>
        {waitingOn.length > 0 && (
          <p className="sheet flat small">
            This topic builds on{' '}
            {waitingOn.map((b, i) => (
              <span key={b.id}>{i > 0 && ' and '}<Link to={`/learn/${b.id}`}>{b.name}</Link></span>
            ))}
            . You can read on, but it will be easier once that is above 60%.
          </p>
        )}
        <div className="row">
          <Link className="btn primary" to={`/practice/topic/${topic.id}`}>Practise this topic</Link>
          <Link className="btn" to={`/tutor?topic=${topic.id}`}>Ask the tutor</Link>
          <a className="btn quiet" href="#recall">Jump to the recall question</a>
        </div>
      </header>

      <section className="reps" aria-label="The idea in three ways">
        <div className="rep">
          <h3>What you can see</h3>
          <p><Rich text={lesson.see} /></p>
        </div>
        <div className="rep">
          <h3>The particle picture</h3>
          <p><Rich text={lesson.picture} /></p>
        </div>
        <div className="rep">
          <h3>In symbols</h3>
          <p><Rich text={lesson.symbols} /></p>
        </div>
        {lesson.context && (
          <div className="rep">
            <h3>In the Caribbean</h3>
            <p><Rich text={lesson.context} /></p>
          </div>
        )}
      </section>

      {VISUALS[topic.id] && (
        <section className="stack">
          <h2>{VISUALS[topic.id].title}</h2>
          <div key={topic.id}>{VISUALS[topic.id].render()}</div>
          {VISUALS[topic.id].lab && <div><Link className="btn" to={`/lab/${VISUALS[topic.id].lab!.id}`}>{VISUALS[topic.id].lab!.label}</Link></div>}
        </section>
      )}

      <section className="stack">
        <h2>Mistakes that cost marks</h2>
        <div>
          {lesson.traps.map(([wrong, fix], i) => (
            <div key={i} className="trap">
              <p className="wrong"><Rich text={wrong} /></p>
              <p className="fix"><Rich text={fix} /></p>
            </div>
          ))}
        </div>
      </section>

      <section className="sheet stack">
        <h2>Worked example</h2>
        <p className="q-stem"><Rich text={lesson.worked.q} /></p>
        <ol className="steps">
          {lesson.worked.steps.map((st, i) => <li key={i}><Rich text={st} /></li>)}
        </ol>
      </section>

      <section className="stack">
        <h2>Key points</h2>
        <ul className="plain">
          {lesson.key.map((k, i) => <li key={i}><Rich text={k} /></li>)}
        </ul>
      </section>

      <LessonVideos topic={topic.id} />

      <Recall key={topic.id} topicId={topic.id} />

      {lesson.sim && (
        <section className="stack">
          <h2>Try it: {lesson.sim.name}</h2>
          {sim ? (
            <iframe className="sim-frame" src={phetUrl(lesson.sim.slug)} title={`${lesson.sim.name} simulation`} allowFullScreen />
          ) : (
            <div className="row">
              <button className="btn" type="button" onClick={() => setSim(true)}>Load the simulation</button>
              <span className="small muted">Needs an internet connection</span>
            </div>
          )}
          <p className="small muted">
            Simulation by PhET Interactive Simulations, University of Colorado Boulder (phet.colorado.edu), embedded unmodified under PhET's open licence.
          </p>
        </section>
      )}

      <section className="stack">
        <h2>What you need to be able to do</h2>
        <div>
          {topic.objectives.map((o) => {
            const p = objP(s, o.id);
            const b = band(p, objN(s, o.id));
            return (
              <div key={o.id} className="objective">
                <span>{o.text}</span>
                <span className="small muted">{BAND_LABEL[b]}</span>
                <div className="bar" style={{ '--m': p } as CSSProperties}><span /></div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="row">
        <Link className="btn primary" to={`/practice/topic/${topic.id}`}>Practise this topic</Link>
        {nextT && <Link className="btn" to={`/learn/${nextT.id}`}>Next topic: {nextT.name}</Link>}
      </div>
    </div>
  );
}
