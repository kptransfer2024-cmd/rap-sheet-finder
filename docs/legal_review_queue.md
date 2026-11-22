# Legal & procedural review queue

Everything here is **unresolved**. The mechanism that keeps these from being shown as confirmed:

1. Each item is a `Fact` in `src/data/facts.ts` with `status: 'partial' | 'needs_review'` (and `kind: 'caveat'` where the fact *is* the unknown).
2. Any step citing a non-verified fact or source renders a visible **"Confirm before relying on it"** or **"Needs verification"** badge, and the fact text is printed under the step.
3. Tests (`tests/unit/safety.test.ts → "known unknowns stay unverified"`) fail if someone flips these to `verified` without a check date.

To resolve an item: verify against the official source, update the fact's `status` + `checkedAt` (and the resource's `lastCheckedByBuild`), run `npm run docs:graph && npm test`.

## Santa Clara court logistics

| # | Item | Current handling | How to resolve |
|---|---|---|---|
| 1 | HOJ criminal-records counter **building (East/West), floor, room, window** | Not published → card says "not published, call first". Never invented. | Call HOJ Clerk 408-808-6611. |
| 2 | Palo Alto / South County records counter room/window | Same as above. | Call 650-462-3810 / 408-695-5014. |
| 3 | **Microfiche conflict**: Records page says "search the microfiche"; FAQ says no longer provided (both re-read 2026-11-22) | App routes pre-2004 to Clerk name search; never suggests self-service microfiche. | Ask the court which page is current; request a page fix. |
| 4 | **Portal sign-in**: is an account needed to see results/details? | "Not confirmed; a sign-in screen may be expected; use Clerk instead." | Test portal.scscourt.org as a new user with a permitted public search. |
| 5 | Portal criminal detail content (charges/dispositions shown?) | App only promises an index/case number. | Same test. |
| 6 | **Payee wording**: "Clerk of the Superior Court" (records page) vs "Superior Court" (case info page) | Shows both + "ask the Clerk". | Ask Clerk; ask court to align pages. |
| 7 | Felonies always at HOJ? (Probation page) vs court page "criminal matters" per courthouse | Area-based courthouse is labeled "likely starting point — confirm"; felony note added. | Ask Clerk. |
| 8 | Certified copy fee ($40/doc + $0.50/page) and search fee amount ($15 > 10 min) | Shown as research amounts with "confirm". | Re-check statewide fee schedule PDF + local fee page. |
| 9 | Mail payment methods (check/money order only) | Shown as research. | Re-check court payment-methods page. |
| 10 | Whether a handwritten request letter is acceptable | Not asserted — app says "ask the Clerk". | Ask Clerk. |
| 11 | How a person views their **own** relief-granted or sealed case record | App says "ask the Clerk how". | Ask Clerk. |
| 12 | Sheriff's Office "local criminal history" appointment line (408-808-4705) mentioned on the records page | **Not used** in the app — unclear what record it produces and for whom. | Research before adding as a route. |

## Record clearance (Santa Clara)

| # | Item | Current handling |
|---|---|---|
| 13 | Probation page content (pathways, no filing fee, packet CR-180/CR-181/MC-031, service on DA + Probation, application scope) — page **403'd** to automated check | All shown as `partial`; the resource is `needs_review`. Re-check by hand. |
| 14 | Packet copy count (research: original + 5) | **Not shown as an instruction.** |
| 15 | Proof-of-service form | Not stated anywhere; not shown. |
| 16 | **E-filing** a record-clearance petition by a self-represented person | `needs_review`; app says plan on Clerk filing. |
| 17 | Mail-in or drop-box filing of a petition | Not asserted. |
| 18 | Probation Record Clearance Application scope ("recently discharged"; >1 year → other options) | Shown with "confirm with Probation first". |
| 19 | Probation timelines ("90 days or longer") | Deliberately **not shown** (no processing ETAs). |
| 20 | Arrest-sealing motions handled by DA (research note from Probation FAQ) | Shown as research. |
| 21 | Whether copy/certification fees can be waived for record-clearance users | Not asserted. FW-001 never shown as a default requirement. |
| 22 | Public Defender Reentry program intake, address, financial criteria (page 403'd) | `partial`; "call to confirm current intake". |
| 23 | Current intake of SJSU Record Clearance Project, Elevate, Law Foundation, BALA, Pro Bono Project, Asian Law Alliance | **Not listed individually** — app links the court's legal-help page instead. |

## Statewide / federal / juvenile

| # | Item | Current handling |
|---|---|---|
| 24 | FBI Identity History Summary details (page 403'd) | Only described as a separate, possibly incomplete option. No fee/timing shown. |
| 25 | Federal N.D. Cal. San Jose clerk room (research: Room 2112, 2nd floor) and FPD contacts | Shown as `partial` with "confirm". |
| 26 | Juvenile sealing statutes (WIC 781/786 etc.) | Not described; routed to Juvenile Clerk/Probation. |
| 27 | Juvenile request rules (photo ID; notarized out-of-town request) | `partial`. |
| 28 | Out-of-state open cases/supervision blocking California relief | Mentioned as "flagged for legal review", not as a rule. |
| 29 | Felony/state-prison special statutes, Prop 47, 17(b) reduction, firearms, registration, licensing | SPECIALIZED_REVIEW card → legal help; no eligibility logic. |

## Content & language

| # | Item |
|---|---|
| 30 | Spanish translations (questions, titles, summaries, UI) were written for this demo and **need native-speaker legal-terminology review**. Detailed step text is English-only and the UI says so. |
| 31 | Plain-language glossary definitions are general descriptions; review by a legal-aid practitioner recommended. |
| 32 | Reading-level of all copy should be measured with target users. |

## Top three questions to review with project advisors and legal aid before any public use

1. **Is "county court documents first" legally sufficient for the clearance paths people will pursue in Santa Clara?** The app tells one- or two-case users they usually don't need a statewide RAP sheet first (an insight from a collaborator's San Francisco experience). Confirm this holds for Santa Clara petitions and for what legal-aid partners actually ask clients to bring.
2. **Which Santa Clara offices will confirm the unknowns** (HOJ counter location, portal sign-in, payee name, e-filing for self-represented filers, packet copies/proof of service) — and can we get a named contact to re-verify quarterly?
3. **Safety framing review**: are the warrant / active-supervision / immigration handoffs worded in a way practitioners endorse, and should any additional situations (e.g., registration, DV-related cases, fines/restitution) trigger an earlier "talk to a lawyer" handoff?
