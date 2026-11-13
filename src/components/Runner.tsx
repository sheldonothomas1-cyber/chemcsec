import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fmt } from '../content/generators';
import { ALL_OBJECTIVES, topicOf } from '../content/syllabus';
import { objP } from '../engine/select';
import { checkTyped, type ServedQ } from '../engine/session';
import { getState, recordAnswers, type Attempt } from '../store';
import { Rich } from './Rich';

const LETTERS = ['A', 'B', 'C', 'D'];
const TAG_LABEL = { review: 'Review', new: 'New', challenge: 'Challenge' } as const;

export function QuestionView({
  q, picked, typed, onPick, onType, revealed,
}: {
  q: ServedQ;
  picked: number | null;
  typed: string;
  onPick: (i: number) => void;
  onType: (v: string) => void;
  revealed: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (q.kind === 'num' && !revealed) inputRef.current?.focus();
  }, [q.key, q.kind, revealed]);

  return (
    <div className="stack">
      <p className="q-stem"><Rich text={q.stem} /></p>
      {q.kind === 'mcq' ? (
        <div className="options" role="radiogroup" aria-label="Answer options">
          {q.options!.map((opt, i) => {
            const state = revealed ? (i === q.correctIndex ? 'right' : i === picked ? 'wrong' : '') : i === picked ? 'picked' : '';
            return (
              <button
                key={i} type="button" role="radio" aria-checked={i === picked}
                className={`option ${state}`} disabled={revealed} onClick={() => onPick(i)}
              >
                <span className="letter">{LETTERS[i]}</span>
                <span><Rich text={opt} /></span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="field">
          <label htmlFor="typed-answer">Your answer{q.signed ? ' (include the sign)' : ''}</label>
          <div className="answer-row">
            <input
              id="typed-answer" ref={inputRef} className="input" inputMode={q.signed ? 'text' : 'decimal'} autoComplete="off"
              value={typed} disabled={revealed} onChange={(e) => onType(e.target.value)}
              placeholder={q.signed ? 'e.g. +4' : 'Type a number'}
            />
            {q.unit && <span className="unit">{q.unit}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export function Solution({ q, ok }: { q: ServedQ; ok: boolean }) {
  const right = q.kind === 'num' ? `${fmt(q.answer!, q.signed)}${q.unit ? ' ' + q.unit : ''}` : null;
  return (
    <div className={`feedback ${ok ? 'right' : 'wrong'}`} role="status">
      <h3>{ok ? 'Correct' : 'Not yet'}</h3>
      {!ok && right && <p>The answer is <strong>{right}</strong>.</p>}
      {q.steps ? (
        <ol className="steps">{q.steps.map((st, i) => <li key={i}><Rich text={st} /></li>)}</ol>
      ) : (
        <p><Rich text={q.why} /></p>
      )}
    </div>
  );
}

/** Runs a practice session: one question at a time, feedback after each, a summary at the end. */
export function Runner({ questions, mode, title }: { questions: ServedQ[]; mode: Attempt['mode']; title: string }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [hint, setHint] = useState('');
  const started = useRef(Date.now());
  const before = useMemo(() => {
    const s = getState();
    return Object.fromEntries(questions.map((q) => [q.obj, objP(s, q.obj)]));
  }, [questions]);

  useEffect(() => {
    started.current = Date.now();
  }, [i]);

  if (!questions.length) {
    return (
      <div className="stack">
        <h1>Nothing to practise here yet</h1>
        <p className="muted">Start today's session from the home screen and reviews will begin to appear.</p>
        <Link className="btn primary" to="/">Go to Today</Link>
      </div>
    );
  }

  const done = i >= questions.length;
  if (done) return <Summary questions={questions} results={results} before={before} />;

  const q = questions[i];
  const ok = results[i];

  const check = () => {
    let correct: boolean;
    if (q.kind === 'mcq') {
      if (picked === null) return setHint('Choose an option first.');
      correct = picked === q.correctIndex;
    } else {
      const res = checkTyped(q, typed);
      if (res === null) return setHint('Type a number, for example 0.25');
      correct = res;
    }
    setHint('');
    recordAnswers([{ obj: q.obj, item: q.itemId, kind: q.kind, profile: q.profile, ok: correct, ms: Date.now() - started.current, mode }]);
    setResults((r) => [...r, correct]);
    setRevealed(true);
  };
  const next = () => {
    setPicked(null);
    setTyped('');
    setRevealed(false);
    setI((n) => n + 1);
    window.scrollTo({ top: 0 });
  };

  return (
    <form
      className="stack" style={{ gap: 20 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (revealed) next();
        else check();
      }}
    >
      <div className="stack tight">
        <div className="between small muted">
          <span>{title}</span>
          <span>Question {i + 1} of {questions.length}</span>
        </div>
        <div className="q-progress" aria-hidden="true">
          {questions.map((_, k) => <i key={k} className={k < results.length ? (results[k] ? 'right' : 'wrong') : k === i ? 'now' : ''} />)}
        </div>
      </div>
      <div className="row">
        {q.tag && <span className={`chip ${q.tag}`}>{TAG_LABEL[q.tag]}</span>}
        <span className="chip">{topicOf(q.obj).name}</span>
      </div>
      <QuestionView q={q} picked={picked} typed={typed} onPick={setPicked} onType={setTyped} revealed={revealed} />
      {revealed && <Solution q={q} ok={ok} />}
      {hint && <p className="small" style={{ color: 'var(--red)' }} role="alert">{hint}</p>}
      <div className="sticky-action">
        <button className="btn primary block" type="submit">
          {revealed ? (i + 1 === questions.length ? 'See how you did' : 'Next question') : 'Check answer'}
        </button>
      </div>
    </form>
  );
}

function Summary({ questions, results, before }: { questions: ServedQ[]; results: boolean[]; before: Record<string, number> }) {
  const s = getState();
  const right = results.filter(Boolean).length;
  const objs = [...new Set(questions.map((q) => q.obj))];
  const moved = objs
    .map((id) => ({ id, text: ALL_OBJECTIVES.find((o) => o.id === id)!.text, from: before[id], to: objP(s, id) }))
    .sort((a, b) => b.to - b.from - (a.to - a.from));
  const tomorrow = Date.now() + 36 * 3600_000;
  const soon = objs.filter((id) => s.cards[id] && s.cards[id].due < tomorrow).length;
  const best = moved[0];
  const weakest = [...moved].sort((a, b) => a.to - b.to)[0];

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="stack tight">
        <p className="muted">Session complete</p>
        <p className="score">{right}<span className="muted" style={{ fontSize: '0.45em' }}> / {questions.length}</span></p>
      </div>
      <div className="sheet stack">
        <p><strong>What you can do now.</strong> {best && best.to > best.from ? `Your strongest gain: ${best.text.toLowerCase()}.` : 'You kept your reviews on schedule.'}</p>
        <p><strong>The one to watch.</strong> {weakest && weakest.to < 0.6 ? `${weakest.text} is still shaky - reread that lesson before your next session.` : 'Nothing in this session is below the learning line.'}</p>
        <p><strong>What comes back.</strong> {soon > 0 ? `${soon} of these ${soon === 1 ? 'skills returns' : 'skills return'} for review within a day; the rest are spaced further out.` : 'These skills are spaced out over the coming days.'}</p>
      </div>
      <div>
        <h2>Mastery after this session</h2>
        <div style={{ marginTop: 8 }}>
          {moved.map((o) => (
            <div key={o.id} className="objective">
              <span>{o.text}</span>
              <span className="num small">{Math.round(o.from * 100)}% to {Math.round(o.to * 100)}%</span>
              <div className="bar" style={{ ['--m' as string]: o.to }}><span /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="row">
        <Link className="btn primary" to="/">Back to Today</Link>
        <Link className="btn" to="/progress">See my progress</Link>
      </div>
    </div>
  );
}
