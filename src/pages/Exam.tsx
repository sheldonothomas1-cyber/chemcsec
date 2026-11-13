import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Rich } from '../components/Rich';
import { QuestionView, Solution } from '../components/Runner';
import { COMMAND_WORDS, PAPER2, P2_TOTAL } from '../content/paper2';
import { SECTIONS, TOPIC_BY_ID, topicOf } from '../content/syllabus';
import { buildMock, LEVELS, MOCK_MINUTES, recommendedLevel, type Level, type ServedQ } from '../engine/session';
import { getState } from '../store';
import { recordAnswers, saveMock, saveP2, useStore, type MockResult } from '../store';

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const dateText = (t: number) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export function ExamHub() {
  const s = useStore();
  return (
    <div className="page">
      <header className="stack tight">
        <h1>Exam practice</h1>
        <p className="muted">
          Papers built to the shape of the real exam, using original questions. Nothing here is copied from CXC papers.
        </p>
      </header>

      <section className="stack">
        <h2>Paper 01: multiple choice</h2>
        <div className="list">
          <Link to="/exam/paper1/60">
            <span>
              <h3>Full mock paper</h3>
              <span className="small muted">60 questions in 1 hour 15 minutes, weighted across Sections A, B and C like the real paper</span>
            </span>
            <span className="go">Start</span>
          </Link>
          <Link to="/exam/paper1/20">
            <span>
              <h3>Quick mock</h3>
              <span className="small muted">20 questions in 25 minutes, same balance of topics</span>
            </span>
            <span className="go">Start</span>
          </Link>
        </div>
        {s.mocks.length > 0 && (
          <div className="stack tight">
            <p className="label">Your mock results</p>
            {s.mocks.slice(-5).reverse().map((m) => (
              <div key={m.t} className="meter">
                <span className="small muted">{dateText(m.t)}{m.level && m.level > 1 ? ` ${LEVELS[m.level as Level].name}` : ''}</span>
                <div className="bar" style={{ ['--m' as string]: m.score / m.size }}><span /></div>
                <span className="num">{pct(m.score, m.size)}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stack">
        <h2>Paper 02: written questions</h2>
        <p className="muted">
          Write your answer, then mark it yourself against a mark scheme split into single marks. Honest marking is the fastest way to learn what examiners reward.
        </p>
        <div className="list">
          {PAPER2.map((q) => {
            const last = s.p2[q.id];
            return (
              <Link key={q.id} to={`/exam/paper2/${q.id}`}>
                <span>
                  <h3>{q.title}</h3>
                  <span className="small muted">{q.kind}, {P2_TOTAL(q)} marks</span>
                </span>
                <span className="go num">{last ? `${last.score}/${last.max}` : 'Start'}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="stack">
        <h2>How the real exam is set</h2>
        <dl className="facts-list">
          <div><dt>Paper 01</dt><dd>60 multiple-choice questions, 60 marks</dd></div>
          <div><dt>Paper 02</dt><dd>6 compulsory questions (1 data analysis, 2 structured, 3 extended), 100 marks</dd></div>
          <div><dt>Paper 03/1 or 03/2</dt><dd>School-based assessment, or the written alternative for private candidates</dd></div>
        </dl>
        <p className="small muted">
          Mock papers here follow that shape with original questions. The best guide to real questions is CXC's own subject reports, where examiners say what each question tested and where candidates lost marks. They are free on cxc.org; past papers are sold in the CXC Store. See <Link to="/resources">Resources</Link>.
        </p>
      </section>

      <section className="stack">
        <h2>What the command words want</h2>
        <div>
          {COMMAND_WORDS.map(([word, means]) => (
            <div key={word} className="trap">
              <p className="label">{word}</p>
              <p className="muted">{means}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="small muted">
        For real past papers, buy the official eBook from the CXC Store and use it alongside this app. See <Link to="/resources">Resources</Link>.
      </p>
    </div>
  );
}

function clock(seconds: number) {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function Paper1() {
  const { size = '20' } = useParams();
  const n = size === '60' ? 60 : 20;
  return <Paper1Run key={n} size={n} />;
}

function Paper1Run({ size }: { size: number }) {
  const [level, setLevel] = useState<Level>(() => recommendedLevel(getState()));
  const [questions, setQuestions] = useState<ServedQ[]>([]);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(size).fill(null));
  const [flags, setFlags] = useState<boolean[]>(() => Array(size).fill(false));
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(MOCK_MINUTES(size) * 60);
  const [result, setResult] = useState<MockResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const startedAt = useRef(0);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000));
    const bySection: MockResult['bySection'] = {};
    const byProfile: MockResult['byProfile'] = {};
    const byTopic: MockResult['byTopic'] = {};
    let score = 0;
    questions.forEach((q, k) => {
      const ok = answers[k] === q.correctIndex;
      if (ok) score++;
      const topic = topicOf(q.obj);
      for (const [map, key] of [[bySection, topic.section], [byProfile, q.profile], [byTopic, topic.id]] as const) {
        const cur = map[key] ?? [0, 0];
        map[key] = [cur[0] + (ok ? 1 : 0), cur[1] + 1];
      }
    });
    const perQ = ((Date.now() - startedAt.current) / questions.length) | 0;
    recordAnswers(questions.map((q, k) => ({
      obj: q.obj, item: q.itemId, kind: 'mcq' as const, profile: q.profile, ok: answers[k] === q.correctIndex, ms: perQ, mode: 'mock' as const,
    })));
    const r: MockResult = { t: Date.now(), size, score, minutes, bySection, byProfile, byTopic, level, items: questions.map((q) => q.itemId) };
    saveMock(r);
    setResult(r);
    window.scrollTo({ top: 0 });
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (!started || result) return;
    const id = setInterval(() => {
      const remaining = MOCK_MINUTES(size) * 60 - Math.floor((Date.now() - startedAt.current) / 1000);
      setLeft(remaining);
      if (remaining <= 0) finishRef.current();
    }, 1000);
    return () => clearInterval(id);
  }, [started, result, size]);

  if (!started) {
    return (
      <div className="page">
        <Link to="/exam" className="small">Exam practice</Link>
        <h1>{size === 60 ? 'Full mock paper' : 'Quick mock'}</h1>
        <ul className="plain">
          <li>{size} multiple-choice questions, {MOCK_MINUTES(size)} minutes.</li>
          <li>No feedback until the end, just like the exam.</li>
          <li>You can flag questions and come back to them.</li>
          <li>Have a calculator and rough paper ready. The clock starts when you press the button.</li>
          <li>Every paper is different: questions are drawn fresh each time, and ones from your last three papers are avoided.</li>
        </ul>
        <fieldset className="stack tight" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="label" style={{ padding: 0, marginBottom: 6 }}>Difficulty</legend>
          {([1, 2, 3] as Level[]).map((l) => (
            <label key={l} className="check">
              <input type="radio" name="mock-level" checked={level === l} onChange={() => setLevel(l)} />
              <span><strong>{LEVELS[l].name}.</strong> {LEVELS[l].note}{l === recommendedLevel(getState()) ? ' (suggested from your last paper)' : ''}</span>
            </label>
          ))}
        </fieldset>
        <div className="row">
          <button
            className="btn violet" type="button"
            onClick={() => {
              const avoid = new Set(getState().mocks.slice(-3).flatMap((m) => m.items ?? []));
              setQuestions(buildMock(size, level, undefined, avoid));
              startedAt.current = Date.now();
              setStarted(true);
            }}
          >
            Start the clock
          </button>
        </div>
      </div>
    );
  }

  if (result) return <MockReport result={result} questions={questions} answers={answers} />;

  const q = questions[i];
  const answered = answers.filter((a) => a !== null).length;
  const setAnswer = (v: number) => setAnswers((a) => a.map((x, k) => (k === i ? v : x)));

  return (
    <div className="page" style={{ gap: 18 }}>
      <div className="exam-bar">
        <span className="small muted">Question {i + 1} of {size}, {answered} answered</span>
        <span className={`timer ${left < 300 ? 'low' : ''}`} aria-label={`Time left ${clock(left)}`}>{clock(left)}</span>
      </div>
      <QuestionView q={q} picked={answers[i]} typed="" onPick={setAnswer} onType={() => {}} revealed={false} />
      <div className="row">
        <button className="btn" type="button" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button>
        <button className="btn primary" type="button" disabled={i === size - 1} onClick={() => setI(i + 1)}>Next</button>
        <button className="btn quiet" type="button" onClick={() => setFlags((f) => f.map((x, k) => (k === i ? !x : x)))}>
          {flags[i] ? 'Remove flag' : 'Flag for later'}
        </button>
      </div>
      <hr className="rule" />
      <div className="palette" aria-label="Jump to a question">
        {questions.map((_, k) => (
          <button
            key={k} type="button" onClick={() => setI(k)}
            className={`${answers[k] !== null ? 'done' : ''} ${flags[k] ? 'flag' : ''} ${k === i ? 'now' : ''}`}
            aria-label={`Question ${k + 1}${answers[k] !== null ? ', answered' : ''}${flags[k] ? ', flagged' : ''}`}
          >
            {k + 1}
          </button>
        ))}
      </div>
      {confirming ? (
        <div className="sheet stack">
          <p>
            <strong>Hand in this paper?</strong>{' '}
            {answered < size ? `${size - answered} ${size - answered === 1 ? 'question is' : 'questions are'} unanswered and will be marked wrong.` : 'All questions are answered.'}
          </p>
          <div className="row">
            <button className="btn violet" type="button" onClick={finish}>Hand in paper</button>
            <button className="btn" type="button" onClick={() => setConfirming(false)}>Keep working</button>
          </div>
        </div>
      ) : (
        <button className="btn violet" type="button" onClick={() => setConfirming(true)}>Hand in paper</button>
      )}
    </div>
  );
}

function MockReport({ result, questions, answers }: { result: MockResult; questions: ServedQ[]; answers: (number | null)[] }) {
  const [showAll, setShowAll] = useState(false);
  const weak = useMemo(
    () => Object.entries(result.byTopic).map(([id, [r, t]]) => ({ id, lost: t - r, r, t })).filter((x) => x.lost > 0).sort((a, b) => b.lost - a.lost).slice(0, 5),
    [result],
  );
  const p = pct(result.score, result.size);
  const review = questions.map((q, k) => ({ q, k, ok: answers[k] === q.correctIndex })).filter((x) => showAll || !x.ok);

  return (
    <div className="page">
      <header className="stack tight">
        <p className="muted">Paper handed in after {result.minutes} min</p>
        <p className="score">{p}%</p>
        <p>
          {result.score} of {result.size} correct.{' '}
          {p >= 60 ? 'That is above the 60% line this app treats as exam-ready. Hold it across your next two mocks.' : 'Aim to hold 60% or more across several mocks. The list below shows where your marks went.'}
        </p>
      </header>

      <section className="stack">
        <h2>By section</h2>
        {Object.entries(result.bySection).sort().map(([sec, [r, t]]) => (
          <div key={sec} className="meter">
            <span className="small">Section {sec}</span>
            <div className="bar" style={{ ['--m' as string]: r / t }}><span /></div>
            <span className="num">{r}/{t}</span>
          </div>
        ))}
        <p className="small muted">{Object.keys(result.bySection).sort().map((k) => `${k}: ${SECTIONS[k as 'A'].name}`).join('. ')}.</p>
      </section>

      <section className="stack">
        <h2>By skill profile</h2>
        {([['KC', 'Knowledge'], ['UK', 'Using knowledge'], ['XS', 'Experimental']] as const).map(([key, label]) => {
          const [r, t] = result.byProfile[key] ?? [0, 0];
          return t ? (
            <div key={key} className="meter">
              <span className="small">{label}</span>
              <div className="bar" style={{ ['--m' as string]: r / t }}><span /></div>
              <span className="num">{r}/{t}</span>
            </div>
          ) : null;
        })}
      </section>

      {weak.length > 0 && (
        <section className="stack">
          <h2>Where the marks went</h2>
          <div className="list">
            {weak.map((w) => (
              <Link key={w.id} to={`/learn/${w.id}`}>
                <span>
                  <h3>{TOPIC_BY_ID[w.id].name}</h3>
                  <span className="small muted">{w.lost} of {w.t} marks lost</span>
                </span>
                <span className="go">Revise</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="stack">
        <div className="between">
          <h2>{showAll ? 'Every question' : 'Questions you missed'}</h2>
          <button className="btn quiet" type="button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show only missed' : 'Show all'}</button>
        </div>
        {review.length === 0 && <p className="muted">You did not miss any. </p>}
        {review.map(({ q, k, ok }) => (
          <div key={q.key} className="sheet flat stack">
            <p className="small muted">Question {k + 1}, {topicOf(q.obj).name}</p>
            <QuestionView q={q} picked={answers[k]} typed="" onPick={() => {}} onType={() => {}} revealed />
            <Solution q={q} ok={ok} />
          </div>
        ))}
      </section>

      <div className="row">
        <Link className="btn primary" to="/progress">See my revision priorities</Link>
        <Link className="btn" to="/exam">Back to exam practice</Link>
      </div>
    </div>
  );
}

export function Paper2() {
  const { id = '' } = useParams();
  return <Paper2Run key={id} id={id} />;
}

function Paper2Run({ id }: { id: string }) {
  const q = PAPER2.find((x) => x.id === id);
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  if (!q) {
    return (
      <div className="page">
        <h1>That question does not exist</h1>
        <Link className="btn primary" to="/exam">Back to exam practice</Link>
      </div>
    );
  }
  const total = P2_TOTAL(q);
  const score = Object.values(ticks).filter(Boolean).length;
  const allShown = q.parts.every((_, i) => shown[i]);

  return (
    <div className="page">
      <header className="stack tight">
        <Link to="/exam" className="small">Exam practice</Link>
        <p className="muted small">{q.kind}, {total} marks</p>
        <h1>{q.title}</h1>
        <p><Rich text={q.intro} /></p>
        {q.table && (
          <div className="scroll-x">
            <table className="data">
              <tbody>
                <tr>{q.table.head.map((h, i) => <th key={i} scope={i === 0 ? 'row' : 'col'}>{h}</th>)}</tr>
                {q.table.rows.map((row, r) => (
                  <tr key={r}>{row.map((c, i) => <td key={i}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </header>

      {q.parts.map((part, i) => (
        <section key={i} className="stack">
          <div className="between">
            <h2>Part ({String.fromCharCode(97 + i)})</h2>
            <span className="chip">{part.marks} {part.marks === 1 ? 'mark' : 'marks'}</span>
          </div>
          <p className="q-stem"><Rich text={part.q} /></p>
          <div className="field">
            <label htmlFor={`p2-${i}`}>Your answer</label>
            <textarea id={`p2-${i}`} className="input" />
          </div>
          {shown[i] ? (
            <div className="sheet flat stack tight">
              <p className="label">Tick each mark you earned</p>
              {part.points.map((pt, k) => (
                <label key={k} className="check">
                  <input
                    type="checkbox" checked={!!ticks[`${i}-${k}`]}
                    onChange={(e) => {
                      setTicks({ ...ticks, [`${i}-${k}`]: e.target.checked });
                      setSaved(false);
                    }}
                  />
                  <span><Rich text={pt} /></span>
                </label>
              ))}
              <p className="small muted" style={{ marginTop: 6 }}><strong>A full-mark answer:</strong> <Rich text={part.model} /></p>
            </div>
          ) : (
            <div><button className="btn" type="button" onClick={() => setShown({ ...shown, [i]: true })}>Show the mark scheme</button></div>
          )}
        </section>
      ))}

      <section className="sheet stack">
        <p className="score">{score}<span className="muted" style={{ fontSize: '0.45em' }}> / {total}</span></p>
        {saved ? (
          <p className="muted">Saved. Come back to this question in a week and try to beat it.</p>
        ) : (
          <div className="row">
            <button
              className="btn primary" type="button" disabled={!allShown}
              onClick={() => {
                saveP2(q.id, score, total);
                setSaved(true);
              }}
            >
              Save my mark
            </button>
            {!allShown && <span className="small muted">Open every mark scheme first</span>}
          </div>
        )}
      </section>
    </div>
  );
}
