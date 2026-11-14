import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Runner } from '../components/Runner';
import { GENERATORS } from '../content/generators';
import { ITEMS } from '../content/items';
import { SECTIONS, TOPICS, TOPIC_BY_ID, type SectionId } from '../content/syllabus';
import { dueObjectives } from '../engine/select';
import { buildChallenge, buildFocusSession, buildMistakes, buildReview, buildSmartSession, buildTopicSession, mistakeIds, type ServedQ } from '../engine/session';
import { TEMPLATES } from '../content/templates';
import { FOCUS_BY_ID } from '../content/focus';
import { getState, useStore, type Attempt } from '../store';

export function PracticeHub() {
  const s = useStore();
  const due = dueObjectives(s).length;
  const mistakes = mistakeIds(s).length;
  const modes = [
    { to: '/practice/smart', glyph: '10', bg: 'var(--blue-soft)', fg: 'var(--blue)', title: "Today's session", note: 'Ten questions chosen for you: reviews first, then new or weak objectives.' },
    { to: '/practice/review', glyph: String(due), bg: 'var(--green-soft)', fg: 'var(--green)', title: 'Reviews due', note: due ? 'Clear the skills that are due to be recalled today.' : 'Nothing is due right now.' },
    { to: '/practice/mistakes', glyph: String(mistakes), bg: 'var(--red-soft)', fg: 'var(--red)', title: 'Fix my mistakes', note: mistakes ? 'Questions you last got wrong, asked again (calculations come back with new numbers).' : 'Nothing to fix yet. Questions you get wrong will collect here.' },
    { to: '/practice/challenge', glyph: '×÷', bg: 'var(--violet-soft)', fg: 'var(--violet)', title: 'Mixed calculations', note: 'Moles, titrations, electrolysis and energy, shuffled together with fresh numbers. It feels harder than doing one type at a time, and that is why it works.' },
  ];
  return (
    <div className="page">
      <header className="stack tight">
        <h1>Practice</h1>
        <p className="muted">
          {ITEMS.length} written questions, plus {TEMPLATES.length} question types and {GENERATORS.length} calculation types that write a new question every time.
        </p>
      </header>
      <section className="list">
        {modes.map((m) => (
          <Link key={m.to} to={m.to}>
            <span className="mode">
              <span className="glyph num" style={{ background: m.bg, color: m.fg }}>{m.glyph}</span>
              <span>
                <h3>{m.title}</h3>
                <span className="small muted">{m.note}</span>
              </span>
            </span>
            <span className="go">Start</span>
          </Link>
        ))}
      </section>
      <section className="stack">
        <h2>Practise one topic</h2>
        {(Object.keys(SECTIONS) as SectionId[]).map((sec) => (
          <div key={sec} className="stack tight">
            <p className="label muted">Section {sec}: {SECTIONS[sec].name}</p>
            <div className="row">
              {TOPICS.filter((t) => t.section === sec).map((t) => (
                <Link key={t.id} className="btn" style={{ minHeight: 42, padding: '0 14px' }} to={`/practice/topic/${t.id}`}>{t.name}</Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function build(mode: string, arg?: string): { questions: ServedQ[]; title: string; mode: Attempt['mode'] } | null {
  const s = getState();
  switch (mode) {
    case 'smart': return { questions: buildSmartSession(s, 10), title: "Today's session", mode: 'session' };
    case 'review': return { questions: buildReview(s), title: 'Reviews due', mode: 'review' };
    case 'focus': return arg && FOCUS_BY_ID[arg] ? { questions: buildFocusSession(s, arg, 12), title: FOCUS_BY_ID[arg].name, mode: 'topic' } : null;
    case 'focus-hard': return arg && FOCUS_BY_ID[arg] ? { questions: buildFocusSession(s, arg, 12, true), title: `${FOCUS_BY_ID[arg].name}: harder`, mode: 'challenge' } : null;
    case 'mistakes': return { questions: buildMistakes(s), title: 'Fix my mistakes', mode: 'review' };
    case 'challenge': return { questions: buildChallenge(8), title: 'Mixed calculations', mode: 'challenge' };
    case 'topic': return arg && TOPIC_BY_ID[arg] ? { questions: buildTopicSession(s, arg, 9), title: TOPIC_BY_ID[arg].name, mode: 'topic' } : null;
    default: return null;
  }
}

export function PracticeRun() {
  const { mode = '', arg } = useParams();
  return <Run key={`${mode}/${arg ?? ''}`} mode={mode} arg={arg} />;
}

function Run({ mode, arg }: { mode: string; arg?: string }) {
  // Build the session once per visit so questions do not reshuffle while you answer.
  const [session] = useState(() => build(mode, arg));
  if (!session) {
    return (
      <div className="page">
        <h1>That practice mode does not exist</h1>
        <Link className="btn primary" to="/practice">See the practice modes</Link>
      </div>
    );
  }
  return (
    <div className="page">
      <Runner questions={session.questions} mode={session.mode} title={session.title} />
    </div>
  );
}
