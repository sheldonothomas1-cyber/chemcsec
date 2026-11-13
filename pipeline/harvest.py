"""ChemCSEC content harvester.

Collects openly licensed chemistry reading for the app, and nothing else.

Rules enforced in code (from the project's research, chapter 5):
  1. No licence, no row: a source without url + licence + attribution is refused.
  2. Only open licences are ingested. Everything else is link-only and never copied.
  3. robots.txt is obeyed and requests are spaced out. No logins, no CAPTCHA or
     bot-detection workarounds: if a site says no, the page is skipped.
  4. The licence printed on the page itself is detected and must not contradict
     the declared one.

Outputs:
  pipeline/out/chunks.jsonl               every chunk with full provenance
  pipeline/out/question_candidates.jsonl  questions found in open sources, for HUMAN review
  pipeline/out/report.md                  what was ingested, linked or refused, and why
  public/content/library.json             short excerpts the app shows under Resources

Run:  pipeline/.venv/Scripts/python pipeline/harvest.py
"""
from __future__ import annotations

import datetime as dt
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
from pathlib import Path

import trafilatura

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "pipeline" / "out"
LIBRARY = ROOT / "public" / "content" / "library.json"
USER_AGENT = "ChemCSEC-harvester/0.1 (personal study tool; obeys robots.txt)"
DELAY_SECONDS = 2.5
CHUNK_CHARS = 1600

# Licences whose terms allow the text to be stored and shown with attribution.
ALLOWED = ("CC BY", "CC BY-SA", "CC BY-NC", "CC BY-NC-SA", "CC0", "Public domain")

CC_PATTERN = re.compile(r"creativecommons\.org/(licenses|publicdomain)/([a-z\-]+)/(\d\.\d)", re.I)

# Keyword map used to file each chunk under one of the app's topics.
TOPIC_KEYWORDS: dict[str, list[str]] = {
    "A1": ["states of matter", "melting", "boiling", "evaporation", "diffusion", "osmosis", "kinetic theory"],
    "A2": ["mixture", "filtration", "distillation", "chromatography", "solubility", "colloid", "suspension", "crystallisation", "crystallization"],
    "A3": ["proton", "neutron", "electron shell", "isotope", "atomic number", "mass number", "relative atomic mass"],
    "A4": ["periodic table", "periodicity", "halogen", "alkaline earth", "group 17", "group 2"],
    "A5": ["ionic bond", "covalent bond", "metallic bond", "lattice", "intermolecular", "delocalised", "delocalized"],
    "A6": ["mole", "molar mass", "formula mass", "avogadro", "stoichiometr", "empirical formula", "limiting reactant", "molarity"],
    "A7": ["alkali", "neutralis", "neutraliz", "titration", "titrant", "indicator", "acid-base", "strong acid", "weak acid", "ph scale"],
    "A8": ["oxidation", "reduction", "redox", "oxidising agent", "oxidizing agent", "reducing agent", "oxidation state"],
    "A9": ["electrolysis", "electrolyte", "anode", "cathode", "electroplating", "faraday"],
    "A10": ["reaction rate", "rate of reaction", "collision theory", "catalyst", "activation energy", "equilibrium", "le chatelier"],
    "A11": ["exothermic", "endothermic", "enthalpy", "calorimet", "bond energy"],
    "B1": ["alkane", "alkene", "hydrocarbon", "isomer", "homologous"],
    "B2": ["ethanol", "alcohol", "carboxylic acid", "ester", "fermentation", "saponification"],
    "B3": ["petroleum", "crude oil", "fractional distillation", "cracking", "polymer"],
    "C1": ["reactivity series", "displacement reaction", "thermal decomposition"],
    "C2": ["blast furnace", "bauxite", "extraction of", "corrosion", "rusting", "alloy", "galvani"],
    "C3": ["haber process", "contact process", "ammonia", "sulfuric acid", "acid rain", "eutrophication", "hard water"],
    "C4": ["qualitative analysis", "precipitate", "flame test", "test for", "limewater", "litmus"],
}


def licence_family(text: str) -> str | None:
    """Map a licence string to its family, longest names first so BY-NC-SA is not read as BY."""
    upper = text.upper().replace("CREATIVE COMMONS", "CC").replace("ATTRIBUTION", "BY")
    for name in sorted(ALLOWED, key=len, reverse=True):
        if upper.startswith(name.upper()):
            return name
    return None


def detect_licence(html: str) -> str | None:
    m = CC_PATTERN.search(html)
    if not m:
        return None
    kind, code, version = m.group(1).lower(), m.group(2).lower(), m.group(3)
    if kind == "publicdomain":
        return "CC0" if code == "zero" else "Public domain"
    return f"CC {code.upper()} {version}"


_robots: dict[str, urllib.robotparser.RobotFileParser | None] = {}
_last_hit: dict[str, float] = {}


def allowed_by_robots(url: str) -> bool:
    host = urllib.parse.urlsplit(url)
    base = f"{host.scheme}://{host.netloc}"
    if base not in _robots:
        rp = urllib.robotparser.RobotFileParser()
        try:
            req = urllib.request.Request(base + "/robots.txt", headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=20) as resp:
                rp.parse(resp.read().decode("utf-8", "replace").splitlines())
            _robots[base] = rp
        except urllib.error.HTTPError as e:
            # 4xx: no robots file, crawling is unrestricted. 5xx: assume disallowed.
            _robots[base] = None if e.code < 500 else rp
            if e.code >= 500:
                rp.parse(["User-agent: *", "Disallow: /"])
        except Exception:
            rp.parse(["User-agent: *", "Disallow: /"])
            _robots[base] = rp
    rp = _robots[base]
    return True if rp is None else rp.can_fetch(USER_AGENT, url)


def fetch(url: str) -> str:
    host = urllib.parse.urlsplit(url).netloc
    wait = DELAY_SECONDS - (time.time() - _last_hit.get(host, 0))
    if wait > 0:
        time.sleep(wait)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode(resp.headers.get_content_charset() or "utf-8", "replace")
    finally:
        _last_hit[host] = time.time()


def chunk(text: str) -> list[str]:
    """Split on paragraph boundaries into pieces of roughly CHUNK_CHARS."""
    out, buf = [], ""
    for para in (p.strip() for p in text.split("\n")):
        if not para:
            continue
        if buf and len(buf) + len(para) > CHUNK_CHARS:
            out.append(buf)
            buf = ""
        buf = f"{buf}\n{para}".strip()
    if buf:
        out.append(buf)
    return out


def tag_topic(text: str) -> tuple[str | None, int]:
    low = text.lower()
    best, score = None, 0
    for topic, words in TOPIC_KEYWORDS.items():
        s = sum(low.count(w) for w in words)
        if s > score:
            best, score = topic, s
    return best, score


QUESTION = re.compile(r"(?<=[.!?\n])\s*([A-Z][^.!?\n]{25,260}\?)")


def main() -> int:
    config = json.loads((ROOT / "pipeline" / "sources.json").read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    LIBRARY.parent.mkdir(parents=True, exist_ok=True)
    today = dt.date.today().isoformat()
    chunks, candidates, library, report = [], [], [], []

    for src in config["sources"]:
        url = src.get("url", "")
        declared = src.get("license", "")
        attribution = src.get("attribution", "")

        if not (url and declared and attribution):
            report.append((url or "(no url)", "REFUSED", "missing url, licence or attribution"))
            continue
        if src.get("mode") != "ingest":
            report.append((url, "LINK ONLY", f"{declared} - linked from the app, never copied"))
            continue
        family = licence_family(declared)
        if not family:
            report.append((url, "REFUSED", f"'{declared}' is not an open licence this pipeline may ingest"))
            continue
        try:
            if not allowed_by_robots(url):
                report.append((url, "SKIPPED", "robots.txt does not allow this page"))
                continue
            html = fetch(url)
        except Exception as e:  # network errors, blocks, timeouts
            report.append((url, "SKIPPED", f"could not fetch ({type(e).__name__}: {e})"))
            continue

        found = detect_licence(html)
        if found and not licence_family(found):
            report.append((url, "REFUSED", f"page declares {found}, which may not be ingested"))
            continue
        licence = found or declared
        note = "" if not found or licence_family(found) == family else f" (page says {found}; sources.json said {declared} - page wins)"

        text = trafilatura.extract(html, url=url, include_comments=False, include_tables=True, favor_precision=True)
        meta = trafilatura.extract_metadata(html)
        title = (meta.title if meta and meta.title else url.rsplit("/", 1)[-1]).strip()
        if not text or len(text) < 400:
            report.append((url, "SKIPPED", "no readable article text (page may need JavaScript)"))
            continue

        pieces = chunk(text)
        page_topic = src.get("topic") or tag_topic(text)[0]
        kept = 0
        for i, piece in enumerate(pieces):
            topic, score = tag_topic(piece)
            row = {
                "id": f"{urllib.parse.urlsplit(url).netloc}{urllib.parse.urlsplit(url).path}#{i}",
                "topic": topic or page_topic, "topic_confidence": score,
                "needs_review": score < 2,
                "title": title, "text": piece,
                "source_url": url, "license": licence, "attribution": attribution, "retrieved": today,
            }
            chunks.append(row)
            kept += 1
            for q in QUESTION.findall(piece):
                if any(c["question"] == q.strip() for c in candidates):
                    continue
                candidates.append({
                    "question": q.strip(), "topic": topic or page_topic, "status": "needs human review",
                    "source_url": url, "license": licence, "attribution": attribution, "retrieved": today,
                })
        if page_topic:
            first = next((p for p in pieces if len(p) > 200), pieces[0])
            excerpt = re.sub(r"\s+", " ", first)[:320].rsplit(" ", 1)[0] + "..."
            library.append({
                "topic": page_topic, "title": title, "url": url,
                "source": urllib.parse.urlsplit(url).netloc, "license": licence,
                "attribution": attribution, "excerpt": excerpt,
            })
        report.append((url, "INGESTED", f"{kept} chunks, filed under {page_topic or 'no topic'}, licence {licence}{note}"))

    (OUT / "chunks.jsonl").write_text("".join(json.dumps(c, ensure_ascii=False) + "\n" for c in chunks), encoding="utf-8")
    (OUT / "question_candidates.jsonl").write_text("".join(json.dumps(c, ensure_ascii=False) + "\n" for c in candidates), encoding="utf-8")
    LIBRARY.write_text(json.dumps(library, ensure_ascii=False, indent=1), encoding="utf-8")

    lines = [f"# Harvest report, {today}", "",
             f"{len(chunks)} chunks from {sum(1 for r in report if r[1] == 'INGESTED')} pages; "
             f"{len(candidates)} question candidates awaiting review.", "",
             "| Result | Source | Detail |", "| --- | --- | --- |"]
    lines += [f"| {status} | {url} | {detail} |" for url, status, detail in report]
    (OUT / "report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    for url, status, detail in report:
        print(f"{status:<10} {url}\n           {detail}".encode("ascii", "replace").decode())
    print(f"\n{len(chunks)} chunks, {len(candidates)} question candidates, {len(library)} library entries.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
