# Demo scenarios

All scenarios are **fictional** and contain answer codes only. Click them on the welcome screen ("Or try an example"). Expected outcomes are asserted in `tests/unit/graph.test.ts`.

| Persona | Situation | Expected "Start here" | Also shown |
|---|---|---|---|
| A | One recent Santa Clara case, has the number, needs copies (HOJ, mail OK) | `SC_COURT_DOCUMENTS` | — (no DOJ/FBI) |
| B | One case ~2015, no number, hasn't tried the index, prefers home | `SC_INDEX_LOOKUP` | — |
| C | Older case, before 2004 | `SC_PRE_2004_CLERK` | — |
| D | Cases in several California counties | `SC_MULTI_CA_DOJ_OPTION` | — |
| E | Other state + federal | `FEDERAL_HANDOFF` | `MULTISTATE_FBI_OPTION` |
| F | Arrest never charged; index found nothing | `DOCUMENT_ACCESS_FALLBACK` | `SC_NO_CONVICTION_INFO` |
| G | Conviction; DOJ record shows "relief granted" | `SC_AUTOMATIC_RELIEF_CHECK` | `SC_ADULT_DISMISSAL_INFO`, `SC_COURT_DOCUMENTS` |
| H | Conviction; still on probation | `ACTIVE_CASE_LEGAL_HELP` | `SC_COURT_DOCUMENTS` |
| I | Juvenile case | `JUVENILE_HANDOFF` | — |
| J | Conviction + immigration concern | `IMMIGRATION_COUNSEL` | `SC_ADULT_DISMISSAL_INFO`, `SC_COURT_DOCUMENTS` |
| K | No car, no printer, tight budget; no number | `SC_INDEX_LOOKUP` | `SC_COURT_DOCUMENTS` (in-person steps become options) |
| L | Not sure what happened or where | `UNKNOWN_JURISDICTION` | — |

## Walk-throughs to try by hand

1. **Example 1 (§18)** — Start → *Find my case number* → *Santa Clara County court* → *One case* → *No* → *2004 or later* → *Not yet* → skip → plan starts with the case index; no statewide record required.
2. **Example 2 (§18)** — Start → *Learn about ways to clear or seal* → Santa Clara → *One case* → *Convicted* → *No (U.S. citizen)* → *Yes, I have it* → *Hall of Justice* → *Not sure* (class) → *Not sure* (state prison) → *No, it's finished* → skip → skip → *I'm not sure* (relief) → … → plan: dismissal information + relief check + gather documents.
3. **Edit an upstream answer** — in walk-through 1, use *Edit* next to "Do you know the court case number?" and change to *Yes*: the year/index answers disappear and the route changes.
4. **"Show my plan now"** at any point — unanswered questions become "not sure" and the rule trace shows `not answered → treated as …`.
5. **Two cases** — choose *Two cases*; the case questions repeat for case 1 and 2 and the plan shows a separate card per case.
