# Future: Santa Clara public case-index data

**Status: not provided, not used, import disabled** (`src/lib/data-import/caseIndex.ts`, `CASE_INDEX_IMPORT_ENABLED = false`).

## What the data is

The court offers a criminal case index on CD (see the `sc_cd_index` registry entry). Research collaborators noted it contains **names, case numbers and filing dates** only. It is:

- not an official court record and may contain inaccuracies (per the court's page),
- not a RAP sheet or complete criminal history,
- unable to separate different people with the same name,
- subject to the court's use conditions.

## What the interface allows today

- Schema validation of a CSV (`case_number, filing_date, party_name`).
- Aggregate statistics (rows per filing year).
- Only files whose first line starts with `# FICTIONAL` are processed while disabled (see `tests/fixtures/fictional_case_index.csv`).

## What it will never do

- Search or list people by name; reverse lookups; public person-level directories.
- Join index rows to a user's answers or "confirm" a case belongs to someone.
- Call the live portal or any network service.

## Gate before enabling

1. Written confirmation of the court's license/terms for the intended use.
2. Privacy review (retention, access control, deletion, breach plan).
3. A use case that needs **aggregates** (e.g., how many cases per year predate 2004 → messaging about Clerk searches), not person-level data.
4. Update this document, the threat model and tests.
