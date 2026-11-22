# Implementation notes

## Architecture

```
src/
  domain/            pure, deterministic logic (no React)
    types.ts         QuestionNode, Condition, Rule, OutcomeDef, OutcomeCard, Plan …
    questions.ts     ordered question registry (26 questions; Q01–Q40 coverage via bankRefs)
    rules.ts         29 routing rules + alert rules (data, not code)
    outcomes.ts      20 terminal outcomes (steps, fallbacks, uncertainties, clerk questions)
    engine.ts        condition evaluation, walk/prune, per-case expansion, plan building, traces
    validate.ts      static + seeded-walk graph validation
  data/
    resources.ts     official source registry (verification status, check dates)
    facts.ts         procedural claims with status/conflicts (UI reads these, not hard-coded text)
    glossary.ts      curated plain-language terms
    personas.ts      fictional demo scenarios A–L with expected outcomes
    jurisdictions/   santa-clara.ts (active); san-francisco.ts, alameda.ts (placeholders)
  components/        accessible UI (Wizard, QuestionCard, Progress, Results, OutcomeCard,
                     StepChecklist, OfficialLink, SourceDrawer, LocationCard, PrivacyNotice,
                     LanguageSwitcher, Glossary, AlertBanner, ErrorBoundary, Header, Welcome)
  lib/ai/            adapter.ts (interface), disabled.ts (default), mock.ts (curated), prompts.ts (guards)
  lib/export.ts      copy checklist / print
  lib/data-import/   disabled case-index validator
  i18n/strings.ts    UI copy (EN/ES), status labels, alert text
```

## Key decisions

- **Ordered registry instead of an explicit edge list.** Each question has an `askIf` condition that may only reference earlier questions. This makes the graph acyclic by construction, lets edits recompute everything, and keeps branching declarative. `validate.ts` checks forward references (= cycles), missing ids/codes, unknown options, unreachable questions/outcomes, dead ends and missing resources.
- **Rules emit cards; priority picks the first action.** Plans can hold several cards (per case, per jurisdiction, safety handoffs). Priority bands rank the practical first step — not an eligibility probability.
- **"Not sure" is first-class.** Every question has an `unknownCode` whose option kind is `unknown`/`prefer_not`; unanswered applicable questions use it (trace says so). Never silently "no".
- **Per-case loop.** Contiguous `scope: 'case'` questions repeat for case 1 and 2; "three or more / not sure" → one group instance. Conditions can read the current case (`scope: 'case'`) or "any case" (unscoped).
- **Editing prunes.** `pruneAnswers` iterates to a fixed point, removing answers whose questions no longer apply (e.g. changing case count from two to one drops case-2 answers).
- **Facts carry status; caveats don't downgrade.** A step's badge is the weakest status among its *claim* facts and sources. Facts of `kind: 'caveat'` (statements that something is unknown) are still printed under the step but don't downgrade it. Steps with no source are labeled "Practical tip (not from a court source)".
- **Practical tailoring.** `optionalWhen` demotes steps (e.g. in-person counter visits become options for people who can't travel). Conditional steps/fallbacks use `when`.
- **No hard-coded procedure claims in components.** Components render registry data; addresses/phones live in the jurisdiction adapter, procedures in facts/outcomes.
- **Validation uses seeded random walks.** Full enumeration explodes combinatorially (per-case × multi-select); the validator enumerates the first three questions exhaustively and completes each prefix with seeded walks (reproducible).

## Master-prompt question bank coverage (Q01–Q40)

| Bank | Implemented as |
|---|---|
| Q01 | `goal` |
| Q02 | `whose_record` (welcome-screen buttons) |
| Q03, Q06 | `jurisdiction` (multi-select incl. SC-incident-only, federal, other state, juvenile, unknown) |
| Q04 | `sc_courthouse` (per case) |
| Q05 | `case_count` |
| Q07 | `sc_area` (per case, only if courthouse unknown) |
| Q08, Q10 | `sc_case_number` (incl. "paperwork might show it") |
| Q09 | `sc_filing_era` (incl. "very recently") |
| Q11, Q37, Q39 | `sc_index_tried` (found / no match / couldn't use it) |
| Q12 | `sc_namesake` |
| Q13 | `sc_still_missing` + `copy_type` |
| Q14, Q31, Q32, Q33, Q39 | `practical` (multi-select) |
| Q15, Q38 | folded into `copy_type` + the "Decide which documents you need" step |
| Q16 | `existing_reports` |
| Q17 | `completeness` |
| Q18 | `matter_status` (multi-select) |
| Q19 | `jurisdiction` → "Juvenile court" option |
| Q20 | `conviction_class` |
| Q21 | `supervision` |
| Q22, Q23 | `open_matters` |
| Q24, Q25 | `obligations` |
| Q26 | `relief_status` |
| Q27 | `state_prison` |
| Q28 | `purpose` |
| Q29 | `immigration` (asked early in clearance flows) |
| Q30 | `lawyer_advised` |
| Q34 | header language switcher |
| Q35 | glossary always available ("Words to know") |
| Q36 | `clerk_contacted` |
| Q40 | every plan has Print / Save as PDF + Copy checklist |

## Editing content

- **Question text / help / why-we-ask:** `src/domain/questions.ts` (keep ids stable).
- **Routing:** `src/domain/rules.ts`. Run `npm run validate:graph`.
- **Outcome steps:** `src/domain/outcomes.ts`. Cite `factIds` + `officialResources`.
- **Verification dates:** update `src/data/resources.ts` (`verificationStatus`, `lastCheckedByBuild`) and `src/data/facts.ts` (`status`, `checkedAt`). Only set dates for pages actually re-read.
- Then `npm run docs:graph && npm test`.

## Adding a county adapter (SF, Alameda, …)

1. Research official sources; add resources + facts.
2. Fill `src/data/jurisdictions/<county>.ts` with places and set `status: 'active'` only after review.
3. Add a jurisdiction option and county-scoped rules/outcomes (the Santa Clara rules are the template: find case → copies → clearance info). Reuse statewide outcomes unchanged.
4. Add personas + tests. Never display one county's procedure for another.

## Known limitations / omissions

- Clearance-context questions are global, not per case (users with mixed cases answer "for most" or "not sure"; multi-select `matter_status` captures mixed outcomes).
- Spanish covers UI, questions, options, titles, summaries, alerts and glossary; detailed step text is English with a visible notice.
- No screenshots of print preview; print verified via `emulateMedia('print')` in Playwright.
- Deployment not performed.
