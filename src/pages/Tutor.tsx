import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Rich } from '../components/Rich';
import { SECTIONS, TOPICS, TOPIC_BY_ID, type SectionId } from '../content/syllabus';
import { topicEvidence, topicMastery } from '../engine/select';
import { getState } from '../store';
import {
  activeKey, activeModel, createSession, explainError, loadSettings, providerById, PROVIDERS, saveSettings,
  type ProviderId, type TutorSettings,
} from '../tutor/providers';
import { lessonNotes } from '../tutor/retrieve';
import { addUsage, costUsd, ZERO_USAGE, type TutorSession, type Usage } from '../tutor/types';

interface Bubble {
  role: 'learner' | 'tutor' | 'notice';
  text: string;
  tools?: string[];
}

/**
 * Google Play requires apps with AI-generated content to let people flag it. This opens a
 * pre-filled issue on the project's GitHub page; the learner sees it and chooses to send it.
 * Only the tutor's reply is included, never the learner's own messages or progress.
 */
const REPORT_BASE = 'https://github.com/sheldonothomas1-cyber/chemcsec/issues/new';
function reportUrl(reply: string): string {
  const quoted = reply.slice(0, 1500).replace(/\n/g, '\n> ');
  const body = `**What is wrong with this reply?** (wrong chemistry, unsafe, offensive, other)\n\n\n**The tutor's reply:**\n\n> ${quoted}`;
  return `${REPORT_BASE}?${new URLSearchParams({ title: 'AI tutor reply report', labels: 'tutor-report', body })}`;
}

// The conversation lives outside the component so it survives moving between screens.
// It is cleared on "New chat", when the provider, model or key changes, and on reload.
const chat = {
  session: null as TutorSession | null,
  bubbles: [] as Bubble[],
  usage: { ...ZERO_USAGE } as Usage,
};
const LONG_CHAT = 24;

/** Tutor replies are plain text with [[chemistry]], **one bold term** and numbered or dashed lines. */
function TutorText({ text }: { text: string }) {
  const inline = (s: string, key: number): ReactNode =>
    s.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={`${key}-${i}`}><Rich text={part} /></strong> : <Rich key={`${key}-${i}`} text={part} />));
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{inline(it, i)}</li>);
    blocks.push(list.ordered ? <ol className="steps" key={blocks.length}>{items}</ol> : <ul className="plain" key={blocks.length}>{items}</ul>);
    list = null;
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const num = line.match(/^\d+[.)]\s+(.*)$/);
    const dash = line.match(/^[-•*]\s+(.*)$/);
    if (num || dash) {
      const ordered = !!num;
      if (!list || list.ordered !== ordered) {
        flush();
        list = { ordered, items: [] };
      }
      list.items.push((num ?? dash)![1]);
    } else {
      flush();
      if (line) blocks.push(<p key={blocks.length}>{inline(line, blocks.length)}</p>);
    }
  }
  flush();
  return <div className="stack" style={{ gap: 10 }}>{blocks}</div>;
}

/** Choose who answers, which model, and manage the key. Used for first-time setup and in-chat settings. */
function TutorSetup({ settings, onChange }: { settings: TutorSettings; onChange: (s: TutorSettings) => void }) {
  const [draftKey, setDraftKey] = useState('');
  const provider = providerById(settings.provider);
  const saved = !!settings.keys[provider.id];
  const pick = (id: ProviderId) => {
    setDraftKey('');
    onChange({ ...settings, provider: id });
  };
  return (
    <section className="sheet stack">
      <fieldset className="stack tight" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label" style={{ padding: 0, marginBottom: 6 }}>Who should answer?</legend>
        {PROVIDERS.map((p) => (
          <label key={p.id} className="check">
            <input type="radio" name="tutor-provider" checked={provider.id === p.id} onChange={() => pick(p.id)} />
            <span>
              <strong>{p.name}, by {p.company}</strong> <span className={`chip ${p.free ? 'ok' : ''}`}>{p.free ? 'Free' : 'Paid'}</span>
              <br />
              <span className="muted">{p.summary}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="stack tight" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label" style={{ padding: 0, marginBottom: 6 }}>Model</legend>
        {provider.models.map((m) => (
          <label key={m.id} className="check">
            <input
              type="radio" name="tutor-model" checked={settings.models[provider.id] === m.id}
              onChange={() => onChange({ ...settings, models: { ...settings.models, [provider.id]: m.id } })}
            />
            <span><strong>{m.label}.</strong> {m.note}</span>
          </label>
        ))}
      </fieldset>

      {saved ? (
        <div className="stack tight">
          <p><span className="chip ok">Key saved</span> Your {provider.keyLabel} is stored on this device.</p>
          <div>
            <button
              className="btn" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} type="button"
              onClick={() => onChange({ ...settings, keys: { ...settings.keys, [provider.id]: '' } })}
            >
              Remove this key from the device
            </button>
          </div>
        </div>
      ) : (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draftKey.trim()) return;
            onChange({ ...settings, keys: { ...settings.keys, [provider.id]: draftKey.trim() } });
            setDraftKey('');
          }}
        >
          <p>
            Get a key at <a href={provider.keyUrl} target="_blank" rel="noreferrer">{provider.keySite}</a>. {provider.keySteps}
          </p>
          <div className="field">
            <label htmlFor="tutor-key">{provider.keyLabel}</label>
            <input id="tutor-key" className="input" type="password" autoComplete="off" spellCheck={false} value={draftKey} onChange={(e) => setDraftKey(e.target.value)} placeholder="Paste your key here" />
            <span className="small muted">Stored only in this browser and sent only to {provider.company}. It is not included in backups. Do not save it on a shared device.</span>
          </div>
          <div className="row">
            <button className="btn primary" type="submit" disabled={!draftKey.trim()}>Save key on this device</button>
            <Link className="btn quiet" to="/search">Search the app instead</Link>
          </div>
        </form>
      )}
      <p className="small muted">{provider.privacy}</p>
    </section>
  );
}

const STARTERS = [
  'Explain the mole as if I have never met it',
  'Quiz me on electrolysis, one question at a time',
  'Why does solid sodium chloride not conduct?',
  'Give me a titration calculation and check my working',
];

export function Tutor() {
  const [params] = useSearchParams();
  const [settings, setSettings] = useState(loadSettings);
  const [topic, setTopic] = useState(() => (TOPIC_BY_ID[params.get('topic') ?? ''] ? params.get('topic')! : ''));
  const [bubbles, setBubbles] = useState<Bubble[]>(chat.bubbles);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [usage, setUsage] = useState<Usage>(chat.usage);
  const [showSettings, setShowSettings] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const provider = providerById(settings.provider);
  const model = activeModel(settings);
  const hasKey = !!activeKey(settings);

  useEffect(() => {
    chat.bubbles = bubbles;
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [bubbles]);
  useEffect(() => () => abort.current?.abort(), []);

  const newChat = () => {
    abort.current?.abort();
    chat.session = null;
    chat.usage = { ...ZERO_USAGE };
    setUsage(chat.usage);
    setBubbles([]);
  };
  // Any change to who answers, the model or the key starts a fresh conversation.
  const update = (next: TutorSettings) => {
    saveSettings(next);
    setSettings(next);
    newChat();
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    if (!navigator.onLine) {
      setBubbles((b) => [...b, { role: 'notice', text: 'You are offline. The tutor needs an internet connection; the lessons, practice and lesson search all work without one.' }]);
      return;
    }
    setDraft('');
    setBusy(true);
    setBubbles((b) => [...b, { role: 'learner', text: question }, { role: 'tutor', text: '', tools: [] }]);
    const patchLast = (fn: (last: Bubble) => Bubble) => setBubbles((b) => [...b.slice(0, -1), fn(b[b.length - 1])]);

    const s = getState();
    const t = topic ? TOPIC_BY_ID[topic] : null;
    const mastery = t && topicEvidence(s, t) > 0 ? Math.round(topicMastery(s, t) * 100) : null;
    const notes = lessonNotes(question, topic || null, mastery);

    const controller = new AbortController();
    abort.current = controller;
    try {
      chat.session ??= createSession(settings);
      const result = await chat.session.send(
        notes, question,
        {
          onText: (delta) => patchLast((last) => ({ ...last, text: last.text + delta })),
          onTool: (summary) => patchLast((last) => ({ ...last, tools: [...(last.tools ?? []), summary] })),
        },
        controller.signal,
      );
      chat.usage = addUsage(chat.usage, result.usage);
      setUsage(chat.usage);
      if (result.status === 'declined') {
        setBubbles((b) => [...b.slice(0, -1), { role: 'notice', text: 'The model declined to answer that. Try rewording it as a CSEC Chemistry question.' }]);
      } else if (result.status === 'cut_off') {
        setBubbles((b) => [...b, { role: 'notice', text: 'That reply was cut short. Ask the tutor to continue, or ask a narrower question.' }]);
      }
    } catch (err) {
      const message = explainError(settings.provider, err, controller.signal.aborted);
      setBubbles((b) => [...(b[b.length - 1].text ? b : b.slice(0, -1)), { role: 'notice', text: message }]);
    } finally {
      setBusy(false);
      abort.current = null;
    }
  };

  if (!hasKey) {
    return (
      <div className="page">
        <header className="stack tight">
          <h1>AI tutor</h1>
          <p className="muted">
            Ask anything in CSEC Chemistry. The tutor explains, then checks you understood, and every calculation it shows is done by this app's chemistry engine rather than guessed.
            It needs an internet connection and a key, which is free for Gemini.
          </p>
        </header>
        <TutorSetup settings={settings} onChange={update} />
      </div>
    );
  }

  const learnerTurns = bubbles.filter((b) => b.role === 'learner').length;
  const cost = costUsd(usage, model);

  return (
    <div className="page" style={{ gap: 18 }}>
      <header className="stack tight">
        <div className="between">
          <h1>AI tutor</h1>
          <div className="row">
            <button className="btn quiet" type="button" onClick={newChat} disabled={!bubbles.length}>New chat</button>
            <button className="btn quiet" type="button" aria-expanded={showSettings} onClick={() => setShowSettings(!showSettings)}>Settings</button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="tutor-topic">Topic (optional)</label>
          <select id="tutor-topic" className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">Any topic</option>
            {(Object.keys(SECTIONS) as SectionId[]).map((sec) => (
              <optgroup key={sec} label={`Section ${sec}: ${SECTIONS[sec].name}`}>
                {TOPICS.filter((x) => x.section === sec).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </header>

      {showSettings && <TutorSetup settings={settings} onChange={update} />}

      <section className="chat" aria-live="polite" aria-label="Conversation">
        {bubbles.length === 0 && (
          <div className="stack">
            <p className="muted">Ask a question, paste an answer you want marked, or start with one of these.</p>
            <div className="row">
              {STARTERS.map((x) => <button key={x} type="button" className="btn" style={{ minHeight: 40, padding: '0 14px', textAlign: 'left' }} onClick={() => send(x)}>{x}</button>)}
            </div>
          </div>
        )}
        {bubbles.map((b, i) =>
          b.role === 'learner' ? (
            <div key={i} className="bubble learner">{b.text}</div>
          ) : b.role === 'notice' ? (
            <p key={i} className="sheet flat small" role="status">{b.text}</p>
          ) : (
            <div key={i} className="bubble tutor">
              {b.tools && b.tools.length > 0 && (
                <ul className="worked-by-app" aria-label="Worked out by the app">
                  {b.tools.map((tl, k) => <li key={k}><Rich text={tl} /></li>)}
                </ul>
              )}
              {b.text ? <TutorText text={b.text} /> : busy && i === bubbles.length - 1 ? <p className="muted">Thinking…</p> : null}
              {b.text && !(busy && i === bubbles.length - 1) && (
                <a className="small muted report-reply" href={reportUrl(b.text)} target="_blank" rel="noreferrer">Report this reply</a>
              )}
            </div>
          ),
        )}
        <div ref={endRef} />
      </section>

      {learnerTurns >= LONG_CHAT && (
        <p className="sheet flat small">This chat is getting long, which makes each reply slower. Start a new chat when you change topic.</p>
      )}

      <form
        className="composer sticky-action"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <label htmlFor="tutor-input" className="sr-only">Your message</label>
        <textarea
          id="tutor-input" className="input" rows={2} value={draft} placeholder="Ask the tutor"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
        />
        {busy ? (
          <button className="btn" type="button" onClick={() => abort.current?.abort()}>Stop</button>
        ) : (
          <button className="btn primary" type="submit" disabled={!draft.trim()}>Send</button>
        )}
      </form>
      <p className="small muted">
        {provider.free
          ? `${model.label}, free tier. ${provider.privacy}`
          : `${model.label}. This chat has cost about US$${cost < 0.01 ? cost.toFixed(4) : cost.toFixed(2)} so far.`}{' '}
        The tutor can be wrong: check anything surprising against the lesson.
      </p>
    </div>
  );
}
