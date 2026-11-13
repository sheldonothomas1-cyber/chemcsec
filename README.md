# ChemCSEC

An offline-first study app for CXC CSEC Chemistry (syllabus CXC 21/G/SYLL 13).

**Use it:** https://sheldonothomas1-cyber.github.io/chemcsec/ - open the link on a phone and choose "Install app" (Android, Chrome) or Share > "Add to Home Screen" (iPhone, Safari). After the first visit it works without data.

Every push to `main` runs the tests and republishes the site (`.github/workflows/deploy.yml`). The research report the app was built from is kept locally in `docs/research/` and is not part of this repository.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173. To make the installable, offline version: `npm run build` (output in `dist/`, ready for any static host such as Cloudflare Pages), and `npm run preview` to try it locally.

`npm test` runs the chemistry gate: every equation shown to a learner must balance, every formula must parse, and every generated answer is re-derived by code.

## What is in the app

| Screen | What it does |
| --- | --- |
| Today | Ten-question daily session (about 60% due reviews, 30% new or weak, 10% mixed challenge), streak, next topic |
| Learn | 18 topics in syllabus order as periodic-table tiles; each lesson gives the idea three ways, common mistakes, a worked example and a recall question |
| Practice | 179 original multiple-choice questions plus 14 calculation generators with fresh numbers and step-by-step solutions |
| Exams | Paper 01 mocks (60 or 20 questions, timed, weighted by topic) and six Paper 02 questions marked against single-mark checkpoints |
| Progress | Mastery map, weakest objectives ranked by marks at risk, skill profiles, review calendar, mock trend, rough grade estimate |
| AI tutor | Chat with Google Gemini (free tier) or Claude (paid) using your own API key. Grounded in the app's lessons; every calculation and equation check is done by the app's chemistry engine through tool calls |
| More | Formula-mass calculator, equation balancer, periodic table, lesson search, SBA checklists, resources, backup and restore |

All progress is stored in the browser on the device. Nothing is uploaded.

## How it decides what to show

- `src/engine/bkt.ts`: Bayesian Knowledge Tracing gives a mastery probability per objective.
- `src/engine/scheduler.ts`: FSRS (via `ts-fsrs`) schedules each objective for review at 90% target retention.
- `src/engine/session.ts`: builds sessions and blueprint-matched mock papers.
- `src/chem/`: formula parser, formula mass and an exact equation balancer (atoms and charge).

## AI tutor

`src/tutor/` holds the tutor: `providers.ts` (the list of providers, saved settings, one session interface for the chat screen), `gemini.ts` (Google's SDK, free-tier models), `claude.ts` (Anthropic's SDK, paid models, cost estimate), `tools.ts` (formula mass, balancing, equation checking, arithmetic, element data), `prompt.ts` (the teaching instructions) and `retrieve.ts` (lesson search used for grounding).

The learner pastes their own API key on the tutor screen. It is stored in the browser under a separate key (`chemcsec:tutor`), is never written into backups, and is sent only to the chosen provider. A key in a browser can be read by anyone with access to that device, so for Claude set a spend limit in the Anthropic Console. If the app is ever offered to other students, move the key to a small server and proxy the requests instead.

The default is Gemini 4 Hydrogen on Google's free tier (key from aistudio.google.com/apikey, no payment card). The free tier has rate limits that Google shows only inside AI Studio, and Google may use free-tier chats to improve its products. Claude Opus 5.5, Sonnet 5.5 and Haiku 5.5 are the paid alternatives. Model ids and prices live at the top of `gemini.ts` and `claude.ts`; update them there when a provider retires a model.

Both providers get the same tools, prompt and lesson notes, and both loops are tested against scripted model replies in `tutor.test.ts` and `gemini.test.ts`.

## Content

- `src/content/syllabus.ts`: topics, objectives, prerequisites and Paper 01 weights. Objective wording is a working draft: reconcile it with the official syllabus eBook.
- `src/content/lessons.ts`, `items.ts`, `generators.ts`, `paper2.ts`: all original. Chemistry goes in `[[double brackets]]`.
- `pipeline/`: harvests openly licensed reading into `public/content/library.json`. See `.claude/skills/csec-content-harvest/SKILL.md`.

## Legal rules the project keeps

1. CXC past papers, mark schemes and reports are linked, never copied. Questions are original.
2. Videos and published textbooks (including flipbook copies) are linked or embedded, never stored.
3. No licence, no row: the pipeline refuses any source without a URL, an open licence and an attribution.

## Not built yet

- Accounts and cross-device sync (the research suggests Supabase). Use Settings > Save a backup for now.
- Paper 03/2 practical papers, 3D molecules and a structure-drawing tool.
