import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TopicTile } from '../components/Tile';
import { TOPICS, TOPIC_BY_ID } from '../content/syllabus';
import { daysToExam, dueChecks, dueObjectives, nextTopic, overallMastery, streak, todayStats } from '../engine/select';
import { setProfile, useStore } from '../store';

function greeting(name: string) {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return name ? `${part}, ${name}` : part;
}

function Welcome() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  return (
    <form
      className="sheet stack"
      onSubmit={(e) => {
        e.preventDefault();
        setProfile({ name: name.trim(), examDate: date || null, onboarded: true });
      }}
    >
      <h2>Set up in ten seconds</h2>
      <p className="muted">Both are optional. Everything you enter stays on this device.</p>
      <div className="field">
        <label htmlFor="w-name">What should we call you?</label>
        <input id="w-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
      </div>
      <div className="field">
        <label htmlFor="w-date">When is your Chemistry exam?</label>
        <input id="w-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <span className="small muted">Check your timetable from CXC or your school. You can change this later.</span>
      </div>
      <button className="btn primary" type="submit">Save and start</button>
    </form>
  );
}

export function Today() {
  const s = useStore();
  const due = dueObjectives(s).length;
  const reviewN = Math.min(due, 6);
  const challengeN = 1;
  const newN = 10 - reviewN - challengeN;
  const stats = todayStats(s);
  const next = nextTopic(s);
  const checks = dueChecks(s);
  const days = daysToExam(s);
  const started = s.attempts.length > 0;

  return (
    <div className="page">
      <section className="hero">
        <p className="muted">{greeting(s.name)}</p>
        {started ? (
          <>
            <div>
              <div className="hero-count">{due}</div>
              <h1>{due === 1 ? 'review is due today' : 'reviews are due today'}</h1>
            </div>
            <p className="muted">
              {due > 0
                ? 'These are skills you are about to forget. Recalling them now is what makes them stick.'
                : 'You are up to date. Today\'s session will move you into new material.'}
            </p>
          </>
        ) : (
          <>
            <h1>Ten questions a day gets you through the whole syllabus</h1>
            <p className="muted">
              Answer, get an explanation, and the app works out what to bring back and when. Start with a session, or read a lesson first.
            </p>
          </>
        )}
        <div className="stack tight">
          <div className="session-plan" role="img" aria-label={`Today's session: ${reviewN} review, ${newN} new or weak, ${challengeN} challenge`}>
            <span style={{ width: `${reviewN * 10}%`, background: 'var(--blue)' }} />
            <span style={{ width: `${newN * 10}%`, background: 'var(--orange)' }} />
            <span style={{ width: `${challengeN * 10}%`, background: 'var(--violet)' }} />
          </div>
          <div className="row small">
            <span className="chip review">{reviewN} review</span>
            <span className="chip new">{newN} new or weak</span>
            <span className="chip challenge">{challengeN} challenge</span>
          </div>
        </div>
        <div className="row">
          <Link className="btn primary" to="/practice/smart">Start today's session</Link>
          <span className="small muted">10 questions, about 10 minutes</span>
        </div>
      </section>

      {!s.onboarded && <Welcome />}

      <section className="facts" aria-label="Your numbers">
        <div>
          <div className="num">{streak(s)}</div>
          <div className="small muted">day streak</div>
        </div>
        <div>
          <div className="num">{stats.questions}</div>
          <div className="small muted">answered today</div>
        </div>
        <div>
          <div className="num">{days === null ? `${Math.round(overallMastery(s) * 100)}%` : Math.max(days, 0)}</div>
          <div className="small muted">{days === null ? 'of syllabus mastered' : days >= 0 ? 'days to your exam' : 'exam date has passed'}</div>
        </div>
      </section>

      <section className="stack">
        <h2>Up next</h2>
        <div className="lesson-head">
          <TopicTile topic={next} />
          <div className="stack tight">
            <h3>{next.name}</h3>
            <p className="muted">{next.blurb}</p>
            <div className="row">
              <Link className="btn" to={`/learn/${next.id}`}>Read the lesson</Link>
              <Link className="btn quiet" to={`/practice/topic/${next.id}`}>Practise it</Link>
            </div>
          </div>
        </div>
      </section>

      {checks.length > 0 && (
        <section className="stack">
          <h2>Recall questions due</h2>
          <div className="list">
            {checks.map((id) => (
              <Link key={id} to={`/learn/${id}#recall`}>
                <span>
                  <h3>{TOPIC_BY_ID[id].name}</h3>
                  <span className="small muted">Answer from memory, then rate yourself</span>
                </span>
                <span className="go">Open</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="stack">
        <div className="between">
          <h2>Your syllabus</h2>
          <Link to="/learn">Open the map</Link>
        </div>
        <div className="tiles mini">
          {TOPICS.map((t) => <TopicTile key={t.id} topic={t} mini />)}
        </div>
      </section>
    </div>
  );
}
