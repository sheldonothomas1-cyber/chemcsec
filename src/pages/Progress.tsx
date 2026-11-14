import { Link } from 'react-router-dom';
import { TileLegend, TopicTile } from '../components/Tile';
import { SECTIONS, TOPICS, type SectionId } from '../content/syllabus';
import { dueByDay, overallMastery, predictedGrade, profileAccuracy, streak, topicBand, weaknesses } from '../engine/select';
import { useStore, type MockResult } from '../store';

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MockTrend({ mocks }: { mocks: MockResult[] }) {
  const pts = mocks.slice(-8).map((m) => m.score / m.size);
  const W = 320, H = 120, pad = 8;
  const x = (i: number) => (pts.length === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (pts.length - 1));
  const y = (v: number) => H - pad - v * (H - pad * 2);
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Mock scores: ${pts.map((p) => Math.round(p * 100) + '%').join(', ')}. The dashed line is 60%.`} style={{ width: '100%', maxWidth: 480, display: 'block' }}>
        <line x1={pad} x2={W - pad} y1={y(0.6)} y2={y(0.6)} stroke="var(--green)" strokeWidth="1.5" strokeDasharray="5 5" />
        <line x1={pad} x2={W - pad} y1={y(0)} y2={y(0)} stroke="var(--line)" strokeWidth="1" />
        {pts.length > 1 && <polyline fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinejoin="round" points={pts.map((p, i) => `${x(i)},${y(p)}`).join(' ')} />}
        {pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(p)} r="4.5" fill="var(--violet)" />)}
      </svg>
      <figcaption className="small muted">Your last {pts.length} mock {pts.length === 1 ? 'score' : 'scores'}. The dashed line is 60%, the exam-ready line.</figcaption>
    </figure>
  );
}

export function Progress() {
  const s = useStore();
  const overall = Math.round(overallMastery(s) * 100);
  const grade = predictedGrade(s);
  const weak = weaknesses(s);
  const profile = profileAccuracy(s);
  const due = dueByDay(s);
  const maxDue = Math.max(1, ...due);
  const today = new Date().getDay();
  const counts = { mastered: 0, nearly: 0, learning: 0, new: 0 };
  TOPICS.forEach((t) => counts[topicBand(s, t)]++);
  const answered = s.attempts.length;
  const right = s.attempts.filter((a) => a.ok).length;

  return (
    <div className="page">
      <header className="stack tight">
        <h1>Progress</h1>
        <p className="muted">Worked out from every answer you have given. Mastery is weighted by how much of Paper 01 each topic carries.</p>
      </header>

      <section className="facts" aria-label="Summary">
        <div>
          <div className="num">{overall}%</div>
          <div className="small muted">syllabus mastered</div>
        </div>
        <div>
          <div className="num">{grade ? grade.grade : '?'}</div>
          <div className="small muted">{grade ? `estimated grade (likely ${grade.range})` : 'grade estimate after 2 mocks'}</div>
        </div>
        <div>
          <div className="num">{streak(s)}</div>
          <div className="small muted">day streak</div>
        </div>
      </section>
      {grade && (
        <p className="small muted">
          The grade is a rough estimate from your last two mocks and your mastery. CXC does not publish fixed grade boundaries, so treat it as a direction, not a promise.
        </p>
      )}

      <section className="stack">
        <div className="between">
          <h2>Mastery map</h2>
          <span className="small muted">{counts.mastered} mastered, {counts.nearly + counts.learning} in progress, {counts.new} to start</span>
        </div>
        {(Object.keys(SECTIONS) as SectionId[]).map((sec) => (
          <div key={sec} className="stack tight">
            <p className="label muted">Section {sec}</p>
            <div className="tiles mini">
              {TOPICS.filter((t) => t.section === sec).map((t) => <TopicTile key={t.id} topic={t} mini />)}
            </div>
          </div>
        ))}
        <TileLegend />
      </section>

      <section className="stack">
        <h2>Revise these first</h2>
        {weak.length === 0 ? (
          <p className="muted">Answer some questions and your weakest objectives will be ranked here by the marks they put at risk.</p>
        ) : (
          <div className="list">
            {weak.map((w) => (
              <Link key={w.obj} to={`/practice/topic/${w.topic.id}`}>
                <span>
                  <h3>{w.text}</h3>
                  <span className="small muted">
                    {w.topic.name}, {Math.round(w.p * 100)}% mastery
                    {w.rootCause ? `. Likely held back by ${w.rootCause.name}.` : ''}
                  </span>
                </span>
                <span className="go">Practise</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="stack">
        <h2>Skill profiles</h2>
        <p className="muted small">CXC reports a grade for each profile as well as an overall grade, so a gap here matters.</p>
        {([['KC', 'Knowledge'], ['UK', 'Using knowledge'], ['XS', 'Experimental']] as const).map(([key, label]) => (
          <div key={key} className="meter">
            <span className="small">{label}</span>
            <div className="bar" style={{ ['--m' as string]: profile[key].pct ?? 0 }}><span /></div>
            <span className="num">{profile[key].pct === null ? '-' : `${Math.round(profile[key].pct * 100)}%`}</span>
          </div>
        ))}
        <p className="small muted">Accuracy on your most recent questions of each type. A dash means fewer than five answered so far.</p>
      </section>

      <section className="stack">
        <h2>Reviews coming up</h2>
        {due.map((n, i) => (
          <div key={i} className="meter">
            <span className="small">{i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY[(today + i) % 7]}</span>
            <div className="bar"><span style={{ width: `${(n / maxDue) * 100}%`, background: 'var(--blue)' }} /></div>
            <span className="num">{n}</span>
          </div>
        ))}
      </section>

      <section className="stack">
        <h2>Mock exams</h2>
        {s.mocks.some((m) => !m.focus) ? <MockTrend mocks={s.mocks.filter((m) => !m.focus)} /> : <p className="muted">No mocks yet. A 20-question quick mock takes 25 minutes.</p>}
        <div><Link className="btn" to="/exam">Go to exam practice</Link></div>
      </section>

      <section className="stack tight">
        <h2>All time</h2>
        <p className="muted">
          {answered} questions answered, {answered ? Math.round((right / answered) * 100) : 0}% correct, across {Object.keys(s.days).length} study {Object.keys(s.days).length === 1 ? 'day' : 'days'}.
        </p>
      </section>
    </div>
  );
}
