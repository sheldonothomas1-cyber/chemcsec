"""Verify the lesson videos and write the list the app uses (src/content/videos.json).

For every video in pipeline/lesson_videos.json this checks that
  1. it still exists and is public,
  2. it can be embedded in another site,
  3. its captions mention the ideas the lesson needs (the 'expect' words).
Captions are read only to make that check. Nothing but the title, channel, length and year
is stored. A video that fails is left out of the app and listed in the report.

Run:  pipeline/.venv/Scripts/python pipeline/check_videos.py
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "content" / "videos.json"
REPORT = ROOT / "pipeline" / "out" / "video-report.md"

# Channels reviewed by hand: established school-chemistry teachers and Caribbean CSEC channels.
TRUSTED = {"FuseSchool - Global Education", "Cognito", "Freesciencelessons", "Tyler DeWitt", "Professor Dave Explains", "CSEC Chemistry"}
BLOCKED = {"hit": False}  # once YouTube refuses caption requests, stop asking for the rest of the run


def metadata(vid: str) -> dict | None:
    opts = {"quiet": True, "skip_download": True, "no_warnings": True}
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            return ydl.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False)
    except Exception as e:  # removed, private, region-blocked
        print(f"  metadata failed: {type(e).__name__}".encode("ascii", "replace").decode())
        return None


def captions(api: YouTubeTranscriptApi, vid: str) -> str | None:
    if BLOCKED["hit"]:
        return None
    try:
        return " ".join(s.text for s in api.fetch(vid, languages=["en", "en-GB", "en-US"])).lower()
    except Exception as e:  # captions off, or YouTube refusing the request
        print(f"  captions unavailable: {type(e).__name__}")
        if type(e).__name__ in ("IpBlocked", "RequestBlocked"):
            BLOCKED["hit"] = True
        return None


def main() -> int:
    entries = json.loads((ROOT / "pipeline" / "lesson_videos.json").read_text(encoding="utf-8"))["videos"]
    api = YouTubeTranscriptApi()
    previous = {}
    if OUT.exists():
        previous = {k["id"]: k.get("checked") for k in json.loads(OUT.read_text(encoding="utf-8"))}
    kept, report = [], []
    for v in entries:
        vid = v["id"]
        print(f"{v['topic']} {vid}")
        info = metadata(vid)
        if not info:
            report.append((v, "REMOVED", "video not available"))
            continue
        if info.get("playable_in_embed") is False:
            report.append((v, "REMOVED", "the owner does not allow embedding"))
            continue
        if info.get("age_limit", 0) or info.get("availability") not in (None, "public"):
            report.append((v, "REMOVED", f"not openly available ({info.get('availability')})"))
            continue
        title = info.get("title", "").strip()
        channel = info.get("channel") or info.get("uploader") or ""
        if previous.get(vid) == "captions":
            checked, missing = "captions", []  # verified on an earlier run; no need to ask again
        else:
            text = captions(api, vid)
            if text is not None:
                missing = [w for w in v["expect"] if w.lower() not in text]
                # Allow one miss in a long list: wording differs between teachers (sulphate/sulfate, etc.).
                if len(missing) > (1 if len(v["expect"]) >= 4 else 0):
                    report.append((v, "REMOVED", f"captions do not cover: {', '.join(missing)}"))
                    continue
                checked = "captions"
            else:
                # Captions could not be read. Keep the video only if it is from a reviewed channel
                # or its title clearly names the topic, and say so in the app.
                missing = []
                on_topic = any(w.lower() in title.lower() for w in v["expect"])
                if channel not in TRUSTED and not on_topic:
                    report.append((v, "REMOVED", "captions unavailable and the title does not name the topic"))
                    continue
                checked = "title"
        kept.append({
            "topic": v["topic"], "id": vid, "level": v["level"], "why": v["why"],
            "title": title, "channel": channel,
            "seconds": int(info.get("duration") or 0), "year": int(str(info.get("upload_date") or "0000")[:4]),
            "checked": checked,
        })
        report.append((v, "OK", f"{info.get('channel')}: {info.get('title')} ({checked}{'; missing ' + ', '.join(missing) if missing else ''})"))
        time.sleep(0.6)

    OUT.write_text(json.dumps(kept, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    lines = [f"# Lesson video check, {time.strftime('%Y-%m-%d')}", "", f"{len(kept)} of {len(entries)} videos passed.", "", "| Topic | Video | Result | Detail |", "| --- | --- | --- | --- |"]
    lines += [f"| {v['topic']} | {v['id']} | {status} | {detail} |" for v, status, detail in report]
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    by_topic: dict[str, int] = {}
    for k in kept:
        by_topic[k["topic"]] = by_topic.get(k["topic"], 0) + 1
    removed = [(v["topic"], v["id"], d) for v, s, d in report if s != "OK"]
    print(f"\n{len(kept)} of {len(entries)} passed. Per topic: {by_topic}")
    for r in removed:
        print("REMOVED", *r)
    print("caption-checked:", sum(1 for k in kept if k["checked"] == "captions"), "| title-checked:", sum(1 for k in kept if k["checked"] != "captions"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
