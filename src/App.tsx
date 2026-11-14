import { lazy, Suspense, useEffect } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ExamHub, FocusPaper, Paper1, Paper2 } from './pages/Exam';
import { LearnMap, TopicPage } from './pages/Learn';
import { Help, Install, MoreMenu, Resources, Sba, Settings, Tools } from './pages/More';
import { PracticeHub, PracticeRun } from './pages/Practice';
import { Progress } from './pages/Progress';
import { FocusHub, FocusPage } from './pages/Focus';
import { Lab } from './pages/Lab';
import { PeriodicTable } from './pages/PeriodicTable';
import { Reference } from './pages/Reference';
import { Today } from './pages/Today';

// Loaded on demand: the tutor brings in the Anthropic SDK, which the rest of the app does not need.
const Tutor = lazy(() => import('./pages/Tutor').then((m) => ({ default: m.Tutor })));

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICONS = {
  today: icon('M4 11.5 12 4l8 7.5M6 10v9h12v-9M10 19v-5h4v5'),
  learn: icon('M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'),
  practice: icon('M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9'),
  exam: icon('M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6'),
  progress: icon('M4 20V10M10 20V4M16 20v-7M21 20H3'),
  more: icon('M5 12h.01M12 12h.01M19 12h.01'),
  search: icon('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4'),
  tools: icon('M5 4h14v16H5zM8 8h8M8 12h2M12 12h2M8 16h2M12 16h4'),
  help: icon('M12 21a9 9 0 1 0-9-9c0 1.6.4 3 1.1 4.300L3 21l4.800-1.100A9 9 0 0 0 12 21zM9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.700.300-1 .800-1 1.700M12 16.500h.01'),
};

const MAIN = [
  { to: '/', label: 'Today', icon: ICONS.today, end: true },
  { to: '/learn', label: 'Learn', icon: ICONS.learn },
  { to: '/practice', label: 'Practice', icon: ICONS.practice },
  { to: '/exam', label: 'Exams', icon: ICONS.exam },
  { to: '/progress', label: 'Progress', icon: ICONS.progress },
];
const EXTRA = [
  { to: '/focus', label: 'Focus areas', icon: ICONS.progress },
  { to: '/lab', label: 'Virtual lab', icon: ICONS.practice },
  { to: '/periodic-table', label: 'Periodic table', icon: ICONS.learn },
  { to: '/reference', label: 'Quick reference', icon: ICONS.exam },
  { to: '/tools', label: 'Calculators', icon: ICONS.tools },
  { to: '/tutor', label: 'AI tutor', icon: ICONS.help },
  { to: '/help', label: 'Search lessons', icon: ICONS.search },
  { to: '/more', label: 'More', icon: ICONS.more },
];

function Brand({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`brand ${className}`}>
      <span className="brand-mark">Cs</span>ChemCSEC
    </Link>
  );
}

export function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="shell">
      <header className="topbar">
        <Brand />
        <Link to="/more" className="btn quiet" aria-label="More: calculators, help, resources and settings">Menu</Link>
      </header>
      <nav className="nav" aria-label="Main">
        <Brand className="nav-brand" />
        {MAIN.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            {n.icon}
            <span>{n.label}</span>
          </NavLink>
        ))}
        <hr />
        {EXTRA.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-extra ${isActive ? 'active' : ''}`}>
            {n.icon}
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/learn" element={<LearnMap />} />
          <Route path="/learn/:topicId" element={<TopicPage />} />
          <Route path="/practice" element={<PracticeHub />} />
          <Route path="/practice/:mode/:arg?" element={<PracticeRun />} />
          <Route path="/exam" element={<ExamHub />} />
          <Route path="/exam/paper1/:size" element={<Paper1 />} />
          <Route path="/exam/paper2/:id" element={<Paper2 />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/more" element={<MoreMenu />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tutor" element={<Suspense fallback={<div className="page"><p className="muted">Loading the tutor…</p></div>}><Tutor /></Suspense>} />
          <Route path="/help" element={<Help />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/sba" element={<Sba />} />
          <Route path="/install" element={<Install />} />
          <Route path="/focus" element={<FocusHub />} />
          <Route path="/focus/:id" element={<FocusPage />} />
          <Route path="/exam/focus/:id" element={<FocusPaper />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/lab/:bench" element={<Lab />} />
          <Route path="/periodic-table" element={<PeriodicTable />} />
          <Route path="/reference" element={<Reference />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Today />} />
        </Routes>
      </main>
    </div>
  );
}
