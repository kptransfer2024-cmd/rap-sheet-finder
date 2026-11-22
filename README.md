# Rap Sheet Finder

**Find the right path to your court records and record-clearance resources.**
_Santa Clara County • California — research demonstration, not legal advice._

**Live demo:** https://kptransfer2024-cmd.github.io/rap-sheet-finder/

Rap Sheet Finder is a friendly, one-question-at-a-time navigator. It asks a few coarse questions (never your name, birth date, case number or what happened) and builds a step-by-step plan with **official** links: how to find a Santa Clara case number, how to request court documents, and what official record-clearing information and free help exist.

Its core insight (from collaborators' experience): **someone with one or two known county cases usually doesn't need a statewide RAP sheet first** — the county court index and Clerk are often the path of least resistance. Statewide (CA DOJ) and national (FBI) record reviews appear only when they're relevant (several counties, unknown counties, other states/federal).

## What it does — and doesn't

| Does | Doesn't |
|---|---|
| Deterministic, data-driven routing (26 questions, 29 rules, 20 outcomes) | Use AI to decide anything (AI is an optional, disabled stub) |
| Personalized plan: "Start here" card, numbered steps, costs, alternatives, fallbacks, courthouse cards, Clerk question templates | Decide eligibility, promise sealing/dismissal, or say anyone "has no record" |
| Show each fact's verification status and source conflicts | Look up anyone's records or contact any court/portal |
| Work in English and Spanish; keyboard, screen reader, large text, high contrast, mobile | Store answers (memory only; refresh clears) |
| Print / Save as PDF and Copy checklist | Fill out or file any form |

## Run it

Requires Node.js 22.12+ (tested with Node 24). No API key, no `.env`.

```bash
cd app
npm install
npm run dev          # http://localhost:5173/rap-sheet-finder/
```

Other commands:

```bash
npm run build          # typecheck (tsc) + production build into dist/
npm run preview        # serve dist/ at http://localhost:4173/rap-sheet-finder/
npm test               # Vitest: routing, safety, privacy, graph, UI (jsdom) — 79 tests
npm run validate:graph # decision-graph validator (cycles, dead ends, reachability, sources)
npm run docs:graph     # regenerate docs/decision-tree.mmd, outline, provenance matrix
npx playwright install chromium   # once
npm run test:e2e       # Playwright smoke tests, desktop + mobile (builds + serves automatically)
```

## Deployment

Every push to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml): `npm ci` → unit/safety/UI tests → decision-graph validation → typecheck + build → deploy `dist/` to GitHub Pages. A failing test blocks the deploy. The Vite `base` is `/rap-sheet-finder/` (see `vite.config.ts`); change it if the repository is renamed. The site is fully static — no server, no secrets.

## Try it

- On the welcome screen, click an example (**A–L**, fictional) to jump straight to a plan, or **Start** to answer questions.
- On any plan, open **Inspect the rule path** to see the exact answer codes and rule IDs that produced it, and **Sources & verification** for every link/fact with its status.
- Use **Edit** beside any answer to change it — dependent answers are cleared and the route recalculates.
- **Show my plan now** works at any point; unanswered questions count as "not sure" (never "no").

See [docs/demo_scenarios.md](docs/demo_scenarios.md).

## How it's built

React + TypeScript (strict) + Vite + Tailwind CSS v4, Lucide icons, self-hosted fonts (Fraunces + Atkinson Hyperlegible). No backend.

- `src/domain/` — questions, rules, outcomes, engine, validator (pure functions)
- `src/data/` — official resource registry, fact registry, glossary, personas, county adapters
- `src/components/` — accessible UI
- `src/lib/ai/` — optional AI interface (disabled), curated mock, guarded prompts
- `docs/` — decision tree (Mermaid + text), provenance matrix, source inventory, legal review queue, privacy threat model, implementation notes, screenshots

Details: [docs/implementation_notes.md](docs/implementation_notes.md).

### Deterministic decision tree

Questions are an ordered registry; each has an `askIf` condition that may only reference **earlier** questions, so the graph cannot loop. Declarative rules turn answers into outcome cards, and a priority ranks the practical first step (never an "eligibility score"). The same answers always produce the same plan, and every plan exposes its rule trace. `npm run validate:graph` checks for cycles, dead ends, unreachable questions/outcomes, missing "not sure" options and missing official sources. The generated diagram is in [docs/decision-tree.mmd](docs/decision-tree.mmd) with a text equivalent in [docs/decision-tree-outline.md](docs/decision-tree-outline.md).

## Accessibility

- One question per screen, large touch targets, plain language, and a "not sure" option on every question.
- Native radio/checkbox controls: full keyboard use (Tab, arrow keys, Space, Enter), visible focus, focus moved to each new question, `aria-live` announcements.
- Glossary ("Words to know") in a native dialog (Escape closes); no hover-only content.
- **Larger text** and **high contrast** toggles; respects reduced-motion settings.
- Designed for phones from 360px wide with no horizontal scrolling (tested).
- Typography uses Atkinson Hyperlegible, a typeface designed for low-vision readers; fonts are self-hosted.
- English / Spanish switch; phone numbers are `tel:` links; external links say they open an official site in a new tab.
- Print / Save as PDF produces a clean checklist without the person's answers.

### Editing questions, rules and verification dates

Questions → `src/domain/questions.ts`; routing → `src/domain/rules.ts`; outcome text → `src/domain/outcomes.ts`; sources → `src/data/resources.ts`; procedural facts → `src/data/facts.ts`. Set `verified` + a date **only** after actually re-reading the official page. Then `npm run docs:graph && npm test`.

### Santa Clara today, other counties later

Santa Clara is the only **active** adapter (`src/data/jurisdictions/santa-clara.ts`). San Francisco and Alameda exist as **disabled placeholders**; their procedures are never shown. A historical San Francisco flowchart (not included here) informed only the *shape* of the questions. See "Adding a county adapter" in the implementation notes.

### Enabling AI later (optional)

`src/lib/ai/adapter.ts` defines `AiAssistanceService` (explain a term, rephrase a checklist, clerk question template). The app ships `DisabledAiService`. A real provider must run **server-side** (never a key in a `VITE_*` variable), receive only ids + curated snippets (never answers), pass `guardOutput`, and can never change routes, statuses or links.

## Safeguards

- **Not legal advice.** Notice on start, results and print. Status labels describe route evidence: _Record-finding route identified · Possible avenue to explore · More information needed · Legal review strongly recommended · Outside this tool's area._ Tests scan all content for verdict/promise phrases.
- **Privacy.** Coded choices only; no storage, cookies, analytics or network requests (tested). Print/copy output contains no answers.
- **Honest unknowns.** The HOJ records-counter floor/room/window, portal sign-in, e-filing for self-represented filers, payee wording and the microfiche conflict are shown as unverified — never invented. See [docs/legal_review_queue.md](docs/legal_review_queue.md).
- **Correct forms.** CR-180/CR-181 (+ MC-031) only for convictions; CR-409/CR-410 for arrests without conviction; FW-001 is a general court fee waiver and never a default requirement; DOJ's record-review fee waiver is separate.

## Sources (checked 2026-11-22 by this build)

Verified live: Santa Clara court [Criminal Case Records](https://santaclara.courts.ca.gov/divisions/criminal-division/criminal-case-records), [Criminal FAQs](https://santaclara.courts.ca.gov/divisions/criminal-division/criminal-faqs), [Case Information Online](https://santaclara.courts.ca.gov/online-services/case-information-online), [Hall of Justice](https://santaclara.courts.ca.gov/location/hall-justice-hoj), [Phone & email](https://santaclara.courts.ca.gov/general-information/locations-contact-info/court-telephone-numbers-email-addresses); CA DOJ [Record Review](https://oag.ca.gov/fingerprints/record-review), [fee waiver](https://oag.ca.gov/fingerprints/record-review/fee-waiver), [automatic relief](https://oag.ca.gov/fingerprints/automatic-record-relief-penal-code-sections-851.93-and-1203.425); CA Courts [arrest without conviction](https://selfhelp.courts.ca.gov/clean-your-record/arrest-no-conviction), [non-citizens](https://selfhelp.courts.ca.gov/clean-your-record/non-citizens), forms [CR-180](https://selfhelp.courts.ca.gov/jcc-form/CR-180), [CR-181](https://selfhelp.courts.ca.gov/jcc-form/CR-181), [CR-409](https://selfhelp.courts.ca.gov/jcc-form/CR-409), [MC-031](https://selfhelp.courts.ca.gov/jcc-form/MC-031), [FW-001](https://selfhelp.courts.ca.gov/jcc-form/FW-001).

**Blocked (HTTP 403) — marked needs review:** [Santa Clara Probation record clearance](https://pro.santaclaracounty.gov/adult-services/clear-and-expunge-records-adults), [Public Defender post-conviction](https://pdo.santaclaracounty.gov/criminal-defense/post-conviction), [FBI Identity History Summary FAQ](https://www.fbi.gov/how-we-can-help-you/more-fbi-services-and-information/identity-history-summary-checks/identity-history-summary-checks-faqs).

Everything else comes from the Nov 7, 2026 research matrix / Nov 22 handoff and is labeled accordingly. Full list: [docs/source_inventory.md](docs/source_inventory.md), [docs/provenance_matrix.md](docs/provenance_matrix.md).

## Status

Independent research prototype. Not affiliated with, sponsored or endorsed by any court, county agency, university or legal-aid provider. Procedures and fees change — always confirm with the official source before acting.
