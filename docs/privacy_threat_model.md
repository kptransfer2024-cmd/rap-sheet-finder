# Privacy & misuse threat model

## Data the app handles

Only coarse **option codes** (e.g. `goal=copies`, `sc_case_number@1=no`). No names, dates of birth, case numbers, charges, addresses, SSNs, free text, uploads or photos. State lives in React memory only; refresh/close discards it. No accounts, cookies, `localStorage`, analytics, trackers, server, or network calls (fonts are self-hosted; enforced by `safety.test.ts` and the e2e "no third-party requests" test).

## Risks and mitigations

| Risk | Example | Mitigation in this build |
|---|---|---|
| **Homonyms / wrong person** | Index shows a case under the same name | App never matches people to cases. Steps say the index can't prove identity; "several similar names" → "ask the Clerk to confirm"; future CD import has no name search (`caseIndex.ts`). |
| **Third-party snooping** | Landlord tries to look someone up | First screen asks whose record; "someone else" → `THIRD_PARTY_NOT_SUPPORTED`. App never searches anyone anyway. |
| **Data leakage via screen / print / copy** | Shared computer, printed plan left behind | Print & copied checklist contain only abstract steps and official links — never answers (tested). "Clear my answers" always visible. Nothing persists after closing the tab. |
| **Leakage via logs** | Error reports with state | ErrorBoundary logs a generic message only; tests forbid logging `answers`. |
| **Leaving to external sites** | User unaware they left | Every external link: "Official site · domain" text, icon, and screen-reader "opens the official website in a new tab; you will leave Rap Sheet Finder". `rel="noopener noreferrer"`, `<meta name="referrer" content="no-referrer">`. |
| **Misrouting** | Pre-2004 case sent to online index | Deterministic rules with tests for each mandated route; graph validator; visible rule trace for human inspection. |
| **Legal over-reliance** | Reading a plan as "you are eligible" | No eligibility types exist; status labels describe route evidence; forbidden-phrase tests over all content; legal notice on start + results + print. |
| **Stale facts** | Fee or hours change | Every fact shows status and check date; unverified facts are badged; review queue documents re-verification. |
| **Unsafe advice in sensitive cases** | Warrant, open case, immigration | Early handoff cards + alerts; never advises avoiding court; immigration counsel shown first. |
| **Future AI misuse** | Model invents a fee or verdict | AI disabled; interface accepts ids only; output guard rejects verdict language; AI can't change routes, statuses or links (`src/lib/ai/*`). |
| **Bulk index misuse** | Building a people-search site | Import disabled by default; only `# FICTIONAL` files validate; returns aggregates only; documented licensing/terms gate. |

## Residual risks

- Users may still type personal details into official sites — that is intended and happens off-app.
- Browser extensions / shared devices can observe any page; out of scope.
- Spanish copy is unreviewed; misunderstanding risk until reviewed.
