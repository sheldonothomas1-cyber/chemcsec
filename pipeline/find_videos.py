"""Search YouTube (metadata only - nothing is downloaded) for candidate lesson videos.

Prints candidates for a human to choose from; the chosen ones go into src/content/videos.ts
and are then checked by pipeline/check_videos.py.

Run:  pipeline/.venv/Scripts/python pipeline/find_videos.py "A6" "mole concept"
      pipeline/.venv/Scripts/python pipeline/find_videos.py --all
"""
from __future__ import annotations

import sys

import yt_dlp

QUERIES: dict[str, list[str]] = {
    "A1": ["FuseSchool states of matter solids liquids gases", "Cognito states of matter particle model changes of state", "CSEC chemistry states of matter diffusion"],
    "A2": ["FuseSchool separating mixtures chromatography distillation", "Cognito chromatography filtration crystallisation", "CSEC chemistry separation techniques"],
    "A3": ["FuseSchool atomic structure protons neutrons electrons", "Tyler DeWitt isotopes atomic mass", "Cognito atoms isotopes relative atomic mass"],
    "A4": ["FuseSchool periodic table groups periods trends", "Cognito group 1 alkali metals group 7 halogens", "CSEC chemistry periodic table periodicity"],
    "A5": ["FuseSchool ionic bonding covalent bonding", "Cognito ionic covalent metallic bonding structure", "Tyler DeWitt ionic bonding introduction"],
    "A6": ["Tyler DeWitt introduction to moles", "Cognito moles calculations reacting masses", "FuseSchool mole concept stoichiometry"],
    "A7": ["FuseSchool acids bases salts pH", "Cognito titration calculations", "Cognito making soluble salts insoluble salts"],
    "A8": ["FuseSchool redox reactions oxidation reduction", "Tyler DeWitt oxidation numbers", "Cognito oxidation reduction electrons OIL RIG"],
    "A9": ["FuseSchool electrolysis", "Cognito electrolysis molten aqueous solutions", "CSEC chemistry electrolysis"],
    "A10": ["FuseSchool rates of reaction collision theory", "Cognito rates of reaction factors", "Cognito reversible reactions equilibrium Le Chatelier"],
    "A11": ["FuseSchool exothermic endothermic reactions", "Cognito energy changes reaction profiles bond energies", "Tyler DeWitt calorimetry specific heat"],
    "B1": ["FuseSchool alkanes alkenes hydrocarbons", "Cognito alkanes alkenes homologous series", "FuseSchool isomers"],
    "B2": ["FuseSchool alcohols carboxylic acids esters", "Cognito alcohols carboxylic acids esters", "CSEC chemistry organic alcohols ethanol"],
    "B3": ["FuseSchool fractional distillation crude oil cracking", "Cognito crude oil fractional distillation cracking", "Cognito addition polymers condensation polymers"],
    "C1": ["FuseSchool reactivity series metals", "Cognito reactivity series displacement reactions", "CSEC chemistry reactivity of metals"],
    "C2": ["FuseSchool extraction of iron blast furnace", "FuseSchool extraction of aluminium electrolysis", "Cognito extraction of metals rusting"],
    "C3": ["FuseSchool Haber process", "Cognito Haber process", "FuseSchool Contact process sulfuric acid"],
    "C4": ["Cognito tests for ions cations anions", "FuseSchool testing for gases", "CSEC chemistry qualitative analysis cations anions"],
}


def search(query: str, n: int = 5) -> list[dict]:
    opts = {"quiet": True, "extract_flat": True, "skip_download": True, "noplaylist": True}
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(f"ytsearch{n}:{query}", download=False)
    return info.get("entries", []) or []


def main() -> int:
    args = sys.argv[1:]
    todo = QUERIES if args[:1] == ["--all"] else {args[0]: [" ".join(args[1:])]} if len(args) >= 2 else {}
    if not todo:
        print(__doc__)
        return 1
    for topic, queries in todo.items():
        print(f"== {topic}")
        seen: set[str] = set()
        for q in queries:
            for e in search(q):
                vid, dur = e.get("id"), e.get("duration") or 0
                if not vid or vid in seen or not 90 <= dur <= 1500:
                    continue
                seen.add(vid)
                line = f"{vid} | {int(dur // 60)}:{int(dur % 60):02d} | {e.get('view_count') or 0:>9} | {e.get('channel') or '?'} | {e.get('title')}"
                print(line.encode("ascii", "replace").decode())
    return 0


if __name__ == "__main__":
    sys.exit(main())
