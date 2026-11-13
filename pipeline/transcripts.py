"""Fetch creator-released captions for YouTube lessons you are allowed to store.

Only captions are fetched - never the video itself. A video is processed only when
pipeline/videos.json marks it  "permission": true  (your own video, a Creative Commons
upload, or one whose creator has agreed). Everything else stays a link in the app.

videos.json format:
  { "videos": [ { "id": "VIDEO_ID", "title": "...", "channel": "...", "topic": "A6",
                  "license": "CC BY", "permission": true } ] }

Run:  pipeline/.venv/Scripts/python pipeline/transcripts.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from youtube_transcript_api import YouTubeTranscriptApi

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "pipeline" / "out" / "transcripts"


def main() -> int:
    cfg_path = ROOT / "pipeline" / "videos.json"
    if not cfg_path.exists():
        print("No pipeline/videos.json yet. Create one (format in this file's header) and run again.")
        return 0
    videos = json.loads(cfg_path.read_text(encoding="utf-8")).get("videos", [])
    OUT.mkdir(parents=True, exist_ok=True)
    api = YouTubeTranscriptApi()
    for v in videos:
        vid = v.get("id", "")
        if not (vid and v.get("license") and v.get("permission") is True):
            print(f"LINK ONLY  {vid or '(no id)'}: no licence or permission recorded, captions not stored")
            continue
        try:
            fetched = api.fetch(vid, languages=["en"])
            segments = [{"start": round(s.start, 2), "duration": round(s.duration, 2), "text": s.text} for s in fetched]
        except Exception as e:  # captions disabled, video unavailable, network error
            print(f"SKIPPED    {vid}: {type(e).__name__}")
            continue
        row = {**v, "url": f"https://www.youtube.com/watch?v={vid}", "segments": segments}
        (OUT / f"{vid}.json").write_text(json.dumps(row, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"SAVED      {vid}: {len(segments)} caption segments")
    return 0


if __name__ == "__main__":
    sys.exit(main())
