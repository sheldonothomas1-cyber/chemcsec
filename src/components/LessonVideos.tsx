import { useState } from 'react';
import { duration, embedUrl, LEVEL_LABEL, videosFor, watchUrl } from '../content/videos';
import { isNativeApp } from '../install';

/** The lesson's videos. Nothing loads until the learner taps, so no data is used by accident. */
export function LessonVideos({ topic }: { topic: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const videos = videosFor(topic);
  if (!videos.length) return null;
  return (
    <section className="stack">
      <h2>Watch it explained</h2>
      <p className="small muted">Videos need data: about 5 to 15 MB each. They play inside the app and are not stored on your phone.</p>
      <div>
        {videos.map((v) => (
          <div key={v.id} className="video-card">
            <div className="row"><span className={`chip ${v.level === 'csec' ? 'ok' : v.level === 'start' ? 'review' : ''}`}>{LEVEL_LABEL[v.level]}</span><span className="small muted">{duration(v.seconds)}</span></div>
            <h3>{v.title}</h3>
            <p className="small muted">{v.channel}{v.year ? `, ${v.year}` : ''}</p>
            <p>{v.why}</p>
            {open === v.id ? (
              <iframe className="video-frame" src={embedUrl(v.id)} title={v.title} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
            ) : (
              <div className="row">
                <button className="btn" type="button" onClick={() => setOpen(v.id)} disabled={!navigator.onLine}>{navigator.onLine ? 'Play video' : 'Offline: connect to watch'}</button>
                <a className="btn quiet" href={watchUrl(v.id)} target={isNativeApp ? '_system' : '_blank'} rel="noreferrer">Open on YouTube</a>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="small muted">Most videos are from UK GCSE courses, which cover the same chemistry as CSEC. Where an exam board's wording differs, follow the lesson above.</p>
    </section>
  );
}
