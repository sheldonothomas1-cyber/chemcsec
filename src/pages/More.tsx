import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { chemHtml } from '../components/Rich';
import { balanceText, isBalanced } from '../chem/balance';
import { massBreakdown, molarMass, round } from '../chem/formula';
import { RESOURCES, SBA_SKELETON, SBA_SKILLS } from '../content/extras';
import { fmt } from '../content/generators';
import { TOPIC_BY_ID } from '../content/syllabus';
import { InstallSteps } from '../components/InstallCard';
import { APK_URL, isNativeApp, PRIVACY_URL, SITE_URL, useApkAvailable } from '../install';
import { exportData, importData, resetAll, setProfile, toggleSba, useStore } from '../store';

export function MoreMenu() {
  const items = [
    ['/focus', 'Focus areas', 'Study guides, drills and timed papers for the seven most important topics'],
    ['/lab', 'Virtual lab', 'Mock experiments: combine elements, test metals and ions, run electrolysis, rates and titrations'],
    ['/periodic-table', 'Periodic table', 'All 118 elements with shells, properties and trends'],
    ['/reference', 'Quick reference', 'Ions, solubility rules, reactivity series and every test on one page'],
    ['/tools', 'Calculators', 'Formula mass and equation balancer'],
    ['/tutor', 'AI tutor', 'Ask questions and get checked, with calculations done by the app. Free with Gemini; needs internet'],
    ['/search', 'Search', 'Find any topic, element, experiment or question, offline'],
    ['/exam/paper3', 'Paper 03: practical skills', 'SBA and Paper 03/2 practice, scale reading, planning and design'],
    ['/sba', 'SBA and practical skills', 'Checklists for the four skills and a lab report outline'],
    ['/resources', 'Resources', 'Official CXC material, open textbooks, simulations and video'],
    ['/install', 'Install on your phone', 'One-tap install, the Android APK, and how to share the app'],
    ['/settings', 'Settings and your data', 'Name, exam date, backup and reset'],
  ];
  return (
    <div className="page">
      <h1>More</h1>
      <div className="list">
        {items.map(([to, title, note]) => (
          <Link key={to} to={to}>
            <span>
              <h3>{title}</h3>
              <span className="small muted">{note}</span>
            </span>
            <span className="go">Open</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------- calculators ----------
function MolarMass() {
  const [formula, setFormula] = useState('CaCO3');
  const [mass, setMass] = useState('');
  const result = useMemo(() => {
    if (!formula.trim()) return null;
    try {
      return { rows: massBreakdown(formula), total: molarMass(formula), error: null };
    } catch (e) {
      return { rows: null, total: 0, error: (e as Error).message };
    }
  }, [formula]);
  const grams = parseFloat(mass);
  return (
    <section className="stack">
      <h2>Formula mass</h2>
      <div className="field">
        <label htmlFor="mm-formula">Formula</label>
        <input id="mm-formula" className="input" value={formula} onChange={(e) => setFormula(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
        <span className="small muted">Capitals matter: Co is cobalt, CO is carbon monoxide. Brackets work: Ca(OH)2.</span>
      </div>
      {result?.error && <p role="alert" style={{ color: 'var(--red)' }}>{result.error}. Check the capital letters and brackets.</p>}
      {result?.rows && (
        <div className="sheet flat stack">
          <p style={{ fontSize: '1.3rem' }} dangerouslySetInnerHTML={{ __html: chemHtml(formula) }} />
          <table className="data">
            <thead><tr><th>Element</th><th>Atoms</th><th>Atomic mass</th><th>Subtotal</th></tr></thead>
            <tbody>
              {result.rows.map((r) => <tr key={r.el}><td>{r.el}</td><td>{r.n}</td><td>{r.ar}</td><td>{r.sub}</td></tr>)}
              <tr><td>Formula mass</td><td /><td /><td><strong>{result.total}</strong></td></tr>
            </tbody>
          </table>
          <div className="field">
            <label htmlFor="mm-mass">Mass in grams (optional)</label>
            <input id="mm-mass" className="input" inputMode="decimal" value={mass} onChange={(e) => setMass(e.target.value)} />
          </div>
          {grams > 0 && (
            <p>
              {grams} g ÷ {result.total} = <strong>{fmt(grams / result.total)} mol</strong>. As a gas at room temperature and pressure that would occupy {fmt(round((grams / result.total) * 24, 4))} dm³.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Balancer() {
  const [eq, setEq] = useState('Fe2O3 + CO -> Fe + CO2');
  const result = useMemo(() => {
    if (!eq.trim()) return null;
    try {
      const already = isBalanced(eq);
      const b = balanceText(eq);
      return { already, b };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [eq]);
  return (
    <section className="stack">
      <h2>Equation balancer</h2>
      <div className="field">
        <label htmlFor="bal-eq">Equation</label>
        <input id="bal-eq" className="input" value={eq} onChange={(e) => setEq(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
        <span className="small muted">Put spaces around each + and use {'->'} for the arrow. Ions work too: Fe^2+ + Cl2 {'->'} Fe^3+ + Cl-</span>
      </div>
      {result && 'error' in result && <p role="alert" style={{ color: 'var(--red)' }}>{result.error}</p>}
      {result && 'b' in result && (
        <div className="sheet flat stack tight">
          {result.b ? (
            <>
              <p className="label">{result.already ? 'Your equation is already balanced' : 'Balanced equation'}</p>
              <p style={{ fontSize: '1.25rem' }} dangerouslySetInnerHTML={{ __html: chemHtml(result.b.text) }} />
            </>
          ) : (
            <p>This cannot be balanced as written. Check that every element appears on both sides and that the formulae are right.</p>
          )}
        </div>
      )}
    </section>
  );
}

export function Tools() {
  return (
    <div className="page">
      <header className="stack tight">
        <h1>Calculators</h1>
        <p className="muted">Use these to check your working, not to replace it. They use the rounded atomic masses CSEC papers give you.</p>
      </header>
      <MolarMass />
      <Balancer />
      <section className="stack tight">
        <h2>Periodic table</h2>
        <p className="muted">All 118 elements, with shells, properties and trends.</p>
        <div><Link className="btn" to="/periodic-table">Open the periodic table</Link></div>
      </section>
    </div>
  );
}

// ---------- help search ----------
// ---------- resources ----------
interface Harvested {
  topic: string;
  title: string;
  url: string;
  source: string;
  license: string;
  attribution: string;
  excerpt: string;
}

export function Resources() {
  const [library, setLibrary] = useState<Harvested[]>([]);
  useEffect(() => {
    fetch('./content/library.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setLibrary(Array.isArray(d) ? d : []))
      .catch(() => setLibrary([]));
  }, []);
  const byTopic = useMemo(() => {
    const m: Record<string, Harvested[]> = {};
    for (const h of library) (m[h.topic] ??= []).push(h);
    return m;
  }, [library]);
  return (
    <div className="page">
      <header className="stack tight">
        <h1>Resources</h1>
        <p className="muted">The best free material for CSEC Chemistry, and the two paid items worth knowing about. These open in your browser and need data.</p>
      </header>
      {RESOURCES.map((g) => (
        <section key={g.group} className="stack">
          <h2>{g.group}</h2>
          <div className="list">
            {g.items.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer">
                <span>
                  <h3>{r.name}</h3>
                  <span className="small muted">{r.note}</span>
                </span>
                <span className={`chip ${r.cost === 'Free' ? 'ok' : ''}`}>{r.cost}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
      {library.length > 0 && (
        <section className="stack">
          <h2>Open-licensed reading, by topic</h2>
          <p className="muted small">Collected by this app's content pipeline from sources whose licences allow reuse. Each entry names its source and licence.</p>
          {Object.entries(byTopic).sort().map(([topic, items]) => (
            <div key={topic} className="stack tight">
              <p className="label">{TOPIC_BY_ID[topic]?.name ?? topic}</p>
              {items.map((h) => (
                <div key={h.url} className="sheet flat stack tight">
                  <a href={h.url} target="_blank" rel="noreferrer"><strong>{h.title}</strong></a>
                  <p className="small">{h.excerpt}</p>
                  <p className="small muted">{h.attribution} Licence: {h.license}.</p>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// ---------- SBA ----------
export function Sba() {
  const s = useStore();
  return (
    <div className="page">
      <header className="stack tight">
        <h1>SBA and practical skills</h1>
        <p className="muted">
          School-based assessment marks four skills. Private candidates sit Paper 03/2 instead, which tests the same skills on paper. Tick these off against your own lab reports.
        </p>
      </header>
      {SBA_SKILLS.map((skill) => {
        const done = skill.checks.filter((_, i) => s.sba[`${skill.id}-${i}`]).length;
        return (
          <section key={skill.id} className="stack tight">
            <div className="between">
              <h2>{skill.name}</h2>
              <span className="chip">{done} of {skill.checks.length}</span>
            </div>
            <p className="muted">{skill.about}</p>
            <div>
              {skill.checks.map((c, i) => (
                <label key={i} className="check">
                  <input type="checkbox" checked={!!s.sba[`${skill.id}-${i}`]} onChange={() => toggleSba(`${skill.id}-${i}`)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </section>
        );
      })}
      <section className="sheet stack">
        <h2>Lab report outline</h2>
        <p className="muted small">Fill each heading with your own work. Never copy results: moderators compare reports, and invented data cannot be explained in the discussion.</p>
        <ol className="steps">
          {SBA_SKELETON.map(([h, p]) => <li key={h}><strong>{h}.</strong> {p}</li>)}
        </ol>
      </section>
      <p className="small muted">Virtual labs for practising these skills are listed under <Link to="/resources">Resources</Link>.</p>
    </div>
  );
}

// ---------- install ----------
export function Install() {
  const apk = useApkAvailable();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const data = { title: 'ChemCSEC', text: 'Free CSEC Chemistry study app: lessons, practice and mock exams that work offline.', url: SITE_URL };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(SITE_URL);
        setCopied(true);
      }
    } catch {
      // The learner closed the share sheet; nothing to do.
    }
  };
  return (
    <div className="page">
      <header className="stack tight">
        <h1>Install on your phone</h1>
        <p className="muted">Installed, ChemCSEC opens from your home screen and works with no data. Only the AI tutor needs the internet.</p>
      </header>
      <section className="sheet stack">
        <h2>This device</h2>
        <InstallSteps />
      </section>
      <section className="stack">
        <h2>Two ways to install on Android</h2>
        <div>
          <div className="trap">
            <p className="label">Install from the browser</p>
            <p className="muted">One tap and a confirmation. Smallest download, and it updates itself whenever you open it online.</p>
          </div>
          <div className="trap">
            <p className="label">Android app file (APK)</p>
            <p className="muted">
              A normal Android app you can send to a friend by WhatsApp or Bluetooth. It works offline from the first launch.
              Android will ask permission to install it because it is not from the Play Store, and new versions have to be downloaded again.
            </p>
            {!isNativeApp && (apk
              ? <div style={{ marginTop: 8 }}><a className="btn" href={APK_URL}>Download the APK</a></div>
              : <p className="small muted" style={{ marginTop: 8 }}>The APK is not available to download yet.</p>)}
          </div>
        </div>
        <p className="small muted">Your progress is stored separately by each method, so pick one and stay with it. To move progress, use Save a backup and Restore a backup in <Link to="/settings">Settings</Link>.</p>
      </section>
      <section className="stack">
        <h2>Share it</h2>
        <div className="row">
          <button className="btn" type="button" onClick={share}>Share the link</button>
          {copied && <span className="small muted" role="status">Link copied.</span>}
        </div>
        <p className="small muted">{SITE_URL}</p>
      </section>
    </div>
  );
}

// ---------- settings ----------
export function Settings() {
  const s = useStore();
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const download = async () => {
    const name = `chemcsec-backup-${new Date().toISOString().slice(0, 10)}.json`;
    if (isNativeApp) {
      // The Android app cannot "download" from itself, so write the file and hand it to the
      // share sheet: the learner can save it to Files or Drive, or send it to themselves.
      try {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        const { uri } = await Filesystem.writeFile({ path: name, data: exportData(), directory: Directory.Cache, encoding: Encoding.UTF8 });
        await Share.share({ title: 'ChemCSEC backup', files: [uri], dialogTitle: 'Save your backup' });
        setMsg('Backup ready. Save it somewhere you will find it again.');
      } catch {
        setMsg('The backup was not saved. Try again and choose where to keep the file.');
      }
      return;
    }
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('Backup saved to your downloads.');
  };
  const restore = async (file: File | undefined) => {
    if (!file) return;
    setMsg(importData(await file.text()) ? 'Backup restored.' : 'That file is not a ChemCSEC backup. Nothing was changed.');
  };

  return (
    <div className="page">
      <h1>Settings and your data</h1>
      <section className="stack">
        <div className="field">
          <label htmlFor="set-name">Your name</label>
          <input id="set-name" className="input" value={s.name} onChange={(e) => setProfile({ name: e.target.value })} autoComplete="given-name" />
        </div>
        <div className="field">
          <label htmlFor="set-date">Exam date</label>
          <input id="set-date" className="input" type="date" value={s.examDate ?? ''} onChange={(e) => setProfile({ examDate: e.target.value || null })} />
        </div>
      </section>
      <section className="stack">
        <h2>Your data</h2>
        <p className="muted">
          Your answers and progress are stored only in this browser on this device. Nothing is uploaded. Save a backup before clearing your browser or changing phones.
          {' '}<a href={PRIVACY_URL} target={isNativeApp ? '_system' : '_blank'} rel="noreferrer">Privacy policy</a>
        </p>
        <div className="row">
          <button className="btn" type="button" onClick={download}>Save a backup</button>
          <button className="btn" type="button" onClick={() => fileRef.current?.click()}>Restore a backup</button>
          <input ref={fileRef} type="file" accept="application/json" className="sr-only" tabIndex={-1} onChange={(e) => restore(e.target.files?.[0])} aria-label="Choose a backup file" />
        </div>
        {msg && <p role="status">{msg}</p>}
        {confirmReset ? (
          <div className="sheet stack">
            <p><strong>Delete all progress on this device?</strong> This removes every answer, review and mock result and cannot be undone.</p>
            <div className="row">
              <button
                className="btn" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} type="button"
                onClick={() => {
                  resetAll();
                  setConfirmReset(false);
                  setMsg('All progress deleted.');
                }}
              >
                Delete all progress
              </button>
              <button className="btn" type="button" onClick={() => setConfirmReset(false)}>Keep my progress</button>
            </div>
          </div>
        ) : (
          <div><button className="btn quiet" style={{ color: 'var(--red)' }} type="button" onClick={() => setConfirmReset(true)}>Delete all progress</button></div>
        )}
      </section>
      <section className="stack tight">
        <h2>About</h2>
        <p className="muted small">
          ChemCSEC is an independent study tool for syllabus CXC 21/G/SYLL 13. It is not affiliated with or endorsed by the Caribbean Examinations Council.
          All questions and lessons are original. CXC past papers, mark schemes and reports remain the copyright of CXC and are linked, never copied.
          Every calculation and equation in the app is checked by code before it reaches you.
        </p>
      </section>
    </div>
  );
}
