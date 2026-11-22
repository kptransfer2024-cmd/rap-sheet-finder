# Source inventory

Built 2026-11-22. "Opened" means this build actually read the file or fetched the page.

## Internal research materials (not published)

The app was built from private project materials that are **intentionally not included in this public repository**: an implementation specification, a research matrix of Santa Clara procedures (researched 2026-11-07), a short workbook of still-unverified items, a historical San Francisco records-access flowchart used only for question *shape*, and internal project correspondence used only for product direction. Nothing personal from those materials (names, contact details, private messages, screenshots) appears in the app or this repository.

How they were used:

| Material | Authority rank* | Use in the app |
|---|---|---|
| Implementation specification | Spec (not legal authority) | Requirements, personas, test list, safety rules. |
| Santa Clara research matrix (2026-11-07) | 4 (research) | Seeded facts in `src/data/facts.ts`. Rows marked "Confirmed" in that research are **not** relabeled as verified unless this build re-read the official page. Its known conflicts (microfiche, payee wording, felonies at HOJ) are carried into the facts and the review queue. |
| Pending-verification workbook | 4 (research) | HOJ floor/room/window and portal sign-in kept unverified; federal N.D. Cal. San Jose clerk and Federal Public Defender contacts shown as partly confirmed. |
| Historical San Francisco flowchart | 5 (historical) | Question shape only (arrest vs conviction; out-of-state/federal; juvenile; counties known?; on probation?; case number known?; pick-up vs mail). **No** San Francisco address, room, portal step, fee or form instruction is used. |
| Project correspondence | 5 (historical) | Product insights only: county records first for one or two known cases; a bulk case index has limited fields and cannot tell apart people with the same name; find the path of least resistance; keep shared steps separate from county-specific steps. |
| Santa Clara bulk case-index data | — | **Not provided and not used.** Disabled import interface + fictional fixture only (`tests/fixtures/fictional_case_index.csv`). |

*Authority rank (highest first): 1 Santa Clara court/county official sites → 2 California Courts / CA DOJ → 3 FBI → 4 research matrix → 5 historical flowchart / discussions.

## Official web pages checked by this build (2026-11-22)

Fetched live and compared with the facts that cite them:

| Page | Result |
|---|---|
| santaclara.courts.ca.gov — Criminal Case Records | ✅ 2004+ index (name+DOB or name+month/year); mail search letter; payee "Clerk of the Superior Court"; "not to exceed $10.00" example; courthouse-by-city; **still mentions microfiche**; lists restricted documents; mentions a Sheriff's Office local-history appointment line (408-808-4705 — not used, queued). |
| santaclara.courts.ca.gov — Criminal FAQs | ✅ "the Court no longer provides criminal public records on microfiche"; quarterly updates; pre-2004 → ask clerk. |
| santaclara.courts.ca.gov — Case Information Online | ✅ documents not generally online; $0.50/page; search fee (no amount); mail requests; AB 1524 photography rules; portal URL; **no login statement**; payee "Superior Court". |
| santaclara.courts.ca.gov — Hall of Justice | ✅ address, mailing address, hours, drop box, parking, 511.org; **no records counter floor/room/window published**. |
| santaclara.courts.ca.gov — Phone numbers & email | ✅ HOJ / Palo Alto / South County / Juvenile phones, TDD lines, emails, hours. |
| oag.ca.gov — Record Review | ✅ own record only; Live Scan BCIA 8016RR; $25 DOJ fee + rolling fee; BCIA 8706 challenge. |
| oag.ca.gov — Record Review fee waiver | ✅ DOJ waiver of $25 fee; provider fee still applies. |
| oag.ca.gov — Automatic record relief | ✅ "not a dismissal, sealing or expungement"; DOJ notifies courts, not individuals. |
| selfhelp.courts.ca.gov — Arrest, no conviction | ✅ PC 851.91, CR-409 / CR-410, automatic DOJ sealing, DOJ record optional. |
| selfhelp.courts.ca.gov — Non-citizens | ✅ immigration risk warning. |
| selfhelp.courts.ca.gov — CR-180, CR-181, CR-409, MC-031, FW-001 form pages | ✅ titles + effective dates (CR-180/181/409: Jan 1, 2024; MC-031: Jul 1, 2005; FW-001: Mar 1, 2026). |
| pro.santaclaracounty.gov — Probation record clearance | ❌ **HTTP 403** to automated fetch → `needs_review`. |
| pdo.santaclaracounty.gov — Public Defender post-conviction | ❌ **HTTP 403** → `needs_review`. |
| fbi.gov — Identity History Summary FAQ | ❌ **HTTP 403** → `needs_review`. |

All other registry links (portal itself, state misdemeanor/felony pages, CR-410 and CR-409-INFO pages, FBI eDO, federal court, FPD, US DOJ pardon FAQ, juvenile pages, legal-help page, SF/Alameda courts) were **not opened** by this build and are `partial` or `needs_review`. See `src/data/resources.ts` and `docs/provenance_matrix.md`.
