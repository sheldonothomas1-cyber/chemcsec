// Lesson videos, checked by pipeline/check_videos.py (still online, embeddable, on topic).
// Videos are embedded with YouTube's privacy-enhanced player and never copied.
import raw from './videos.json';

export interface LessonVideo {
  topic: string;
  id: string;
  level: 'start' | 'deeper' | 'practice' | 'csec';
  why: string;
  title: string;
  channel: string;
  seconds: number;
  year: number;
  checked: string;
}
export const VIDEOS = raw as LessonVideo[];
export const videosFor = (topic: string) => VIDEOS.filter((v) => v.topic === topic);
export const LEVEL_LABEL: Record<LessonVideo['level'], string> = { start: 'Start here', deeper: 'Go deeper', practice: 'Worked practice', csec: 'Caribbean teacher' };
export const duration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
export const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
