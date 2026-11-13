import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { Topic } from '../content/syllabus';
import { BAND_LABEL } from '../engine/bkt';
import { isReady, topicBand, topicMastery } from '../engine/select';
import { useStore } from '../store';

/** A topic drawn as a periodic-table cell that fills, orange to green, as it is mastered. */
export function TopicTile({ topic, mini = false, link = true }: { topic: Topic; mini?: boolean; link?: boolean }) {
  const s = useStore();
  const m = topicMastery(s, topic);
  const band = topicBand(s, topic);
  const waiting = band === 'new' && !isReady(s, topic);
  const pct = Math.round(m * 100);
  const cls = `tile ${band === 'new' ? 'new' : ''} ${waiting ? 'waiting' : ''} ${mini ? 'mini' : ''}`;
  const label = `${topic.name}: ${BAND_LABEL[band]}${band === 'new' ? '' : `, ${pct}%`}`;
  const body = (
    <>
      <span className="fill" />
      <span className="meniscus" />
      <span className="t-id">
        <span>{topic.id}</span>
        {!mini && band !== 'new' && <span>{pct}%</span>}
      </span>
      <span className="t-sym">{topic.sym}</span>
      {!mini && <span className="t-name">{topic.name}</span>}
    </>
  );
  const style = { '--m': m } as CSSProperties;
  return link ? (
    <Link to={`/learn/${topic.id}`} className={cls} style={style} aria-label={label} title={label}>
      {body}
    </Link>
  ) : (
    <div className={cls} style={style} role="img" aria-label={label}>
      {body}
    </div>
  );
}

export function TileLegend() {
  return (
    <div className="legend" aria-hidden="true">
      <span><i style={{ background: 'var(--surface)' }} />Not started</span>
      <span><i style={{ background: 'var(--orange)', borderColor: 'var(--orange)' }} />Learning</span>
      <span><i style={{ background: 'var(--green)', borderColor: 'var(--green)' }} />Mastered</span>
      <span><i style={{ borderStyle: 'dashed' }} />Builds on an earlier topic</span>
    </div>
  );
}
