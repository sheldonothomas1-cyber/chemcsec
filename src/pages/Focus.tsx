import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Rich } from '../components/Rich';
import { LessonVideos } from '../components/LessonVideos';
import { FOCUS_AREAS, FOCUS_BY_ID, type FocusArea } from '../content/focus';
import { ALL_OBJECTIVES, TOPIC_BY_ID } from '../content/syllabus';
import { BAND_LABEL, band } from '../engine/bkt';
import { objN, objP } from '../engine/select';
import { toggleSba, useStore, type AppState } from '../store';

const OBJ_TEXT: Record<string, string> = Object.fromEntries(ALL_OBJECTIVES.map((o) => [o.id, o.text]));
const mastery = (s: AppState, f: FocusArea) => f.objectives.reduce((sum, o) => sum + objP(s, o), 0) / f.objectives.length;
const skillKey = (f: FocusArea, i: number) => `focus:${f.id}:${i}`;

export function FocusHub() {
  const s = useStore();
  const ranked = [...FOCUS_AREAS].sort((a, b) => mastery(s, a) - mastery(s, b));
  return (
    <div className="page">
      <header className="stack tight">
        <h1>Focus areas</h1>
        <p className="muted">
          Seven parts of the syllabus that carry the most marks and cause the most trouble. Each has a study guide with step-by-step methods, extra questions, drills and a timed paper. Today's session also brings these in first.
        </p>
      </header>
      <div className="list">
        {FOCUS_AREAS.map((f) => {
          const m = mastery(s, f);
          const done = f.skills.filter((_, i) => s.sba[skillKey(f, i)]).length;
          return (
            <Link key={f.id} to={`/focus/${f.id}`}>
              <span className="stack tight" style={{ flex: 1 }}>
                <h3>{f.name}</h3>
                <span className="bar" style={{ '--m': m } as CSSProperties}><span /></span>
                <span className="small muted">{Math.round(m * 100)}% mastery, {done} of {f.skills.length} skills ticked off</span>
              </span>
              <span className="go">Open</span>
            </Link>
          );
        })}
      </div>
      {ranked[0] && mastery(s, ranked[0]) < 0.85 && (
        <p className="sheet flat">Your weakest focus area right now is <Link to={`/focus/${ranked[0].id}`}><strong>{ranked[0].name}</strong></Link>. A 12-question drill there is the best use of ten minutes.</p>
      )}
    </div>
  );
}

export function FocusPage() {
  const { id = '' } = useParams();
  const s = useStore();
  const f = FOCUS_BY_ID[id];
  if (!f) {
    return (
      <div className="page">
        <h1>That focus area does not exist</h1>
        <Link className="btn primary" to="/focus">See the focus areas</Link>
      </div>
    );
  }
  const m = mastery(s, f);
  return (
    <div className="page">
      <header className="stack">
        <Link to="/focus" className="small">Focus areas</Link>
        <h1>{f.name}</h1>
        <p className="muted">{f.why}</p>
        <div className="stack tight">
          <div className="bar" style={{ '--m': m } as CSSProperties}><span /></div>
          <p className="small muted">{Math.round(m * 100)}% mastery across {f.objectives.length} objectives</p>
        </div>
        <div className="row">
          <Link className="btn primary" to={`/practice/focus/${f.id}`}>Drill: 12 questions</Link>
          <Link className="btn" to={`/practice/focus-hard/${f.id}`}>Harder drill</Link>
          <Link className="btn violet" to={`/exam/focus/${f.id}`}>Timed paper: 15 questions</Link>
        </div>
      </header>

      <section className="stack">
        <h2>Methods, step by step</h2>
        {f.methods.map((meth) => (
          <details key={meth.title} className="sheet flat method">
            <summary><strong>{meth.title}</strong><span className="small muted"> {meth.when}</span></summary>
            <ol className="steps" style={{ marginTop: 10 }}>{meth.steps.map((st, i) => <li key={i}><Rich text={st} /></li>)}</ol>
            {meth.example && (
              <div className="feedback right" style={{ marginTop: 12 }}>
                <p className="label">Worked example</p>
                <p><Rich text={meth.example.q} /></p>
                <ol className="steps">{meth.example.working.map((w, i) => <li key={i}><Rich text={w} /></li>)}</ol>
              </div>
            )}
          </details>
        ))}
      </section>

      <section className="stack">
        <h2>How to get the marks</h2>
        <ul className="plain">{f.examTips.map((t, i) => <li key={i}><Rich text={t} /></li>)}</ul>
      </section>

      <section className="stack">
        <h2>Skills checklist</h2>
        <p className="small muted">Tick a skill when you could do it in an exam without help.</p>
        <div>
          {f.skills.map((sk, i) => (
            <label key={i} className="check">
              <input type="checkbox" checked={!!s.sba[skillKey(f, i)]} onChange={() => toggleSba(skillKey(f, i))} />
              <span>{sk}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="stack">
        <h2>Your objectives</h2>
        <div>
          {f.objectives.map((o) => {
            const p = objP(s, o);
            return (
              <div key={o} className="objective">
                <span>{OBJ_TEXT[o]}</span>
                <span className="small muted">{BAND_LABEL[band(p, objN(s, o))]}</span>
                <div className="bar" style={{ '--m': p } as CSSProperties}><span /></div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="stack">
        <h2>Lessons and practice</h2>
        <div className="row">
          {f.lessons.map((t) => <Link key={t} className="btn" to={`/learn/${t}`}>Lesson: {TOPIC_BY_ID[t].name}</Link>)}
          {f.lab?.map((l) => <Link key={l.id + l.label} className="btn quiet" to={`/lab/${l.id}`}>{l.label}</Link>)}
        </div>
      </section>

      {f.lessons.slice(0, 1).map((t) => <LessonVideos key={t} topic={t} />)}
    </div>
  );
}
