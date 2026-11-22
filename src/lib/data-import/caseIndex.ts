/**
 * FUTURE Santa Clara public case-index import — DISABLED BY DEFAULT.
 *
 * Context: the court sells a criminal case index on CD (case number, filing date,
 * party name). As a research collaborator noted, it has limited fields and cannot
 * separate different people with the same name. It is not an official record, not
 * a RAP sheet, and not proof of identity, charges, dispositions or eligibility.
 *
 * This module deliberately provides:
 *   - a schema + validator for a supplied file,
 *   - aggregate statistics (row counts by filing year),
 * and deliberately does NOT provide:
 *   - any lookup by person name (no reverse/person search),
 *   - any join between index rows and a user's answers,
 *   - any network access.
 * Before enabling, see docs/future_data_import.md (licensing, terms, privacy review).
 */

export const CASE_INDEX_IMPORT_ENABLED = false;

export interface CaseIndexRow {
  caseNumber: string;
  filingDate: string; // YYYY-MM-DD
  partyName: string;
}

export interface CaseIndexValidation {
  ok: boolean;
  rows: number;
  errors: string[];
  byFilingYear: Record<string, number>;
}

const REQUIRED = ['case_number', 'filing_date', 'party_name'];

/** Validate a CSV text against the expected schema. Returns aggregates only. */
export function validateCaseIndexCsv(csv: string, opts: { allowRealData?: boolean } = {}): CaseIndexValidation {
  const errors: string[] = [];
  if (!CASE_INDEX_IMPORT_ENABLED && !opts.allowRealData) {
    // Only fictional fixtures (header comment marker) may be processed while disabled.
    if (!csv.startsWith('# FICTIONAL')) {
      return { ok: false, rows: 0, errors: ['Case-index import is disabled. Only files marked "# FICTIONAL" can be validated.'], byFilingYear: {} };
    }
  }
  const lines = csv.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
  const header = (lines.shift() ?? '').split(',').map((h) => h.trim().toLowerCase());
  for (const col of REQUIRED) if (!header.includes(col)) errors.push(`Missing column: ${col}`);
  const byFilingYear: Record<string, number> = {};
  let rows = 0;
  const idxDate = header.indexOf('filing_date');
  lines.forEach((line, i) => {
    const cells = line.split(',');
    if (cells.length !== header.length) {
      errors.push(`Row ${i + 2}: expected ${header.length} cells`);
      return;
    }
    const date = cells[idxDate]?.trim() ?? '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(`Row ${i + 2}: bad filing_date`);
    else byFilingYear[date.slice(0, 4)] = (byFilingYear[date.slice(0, 4)] ?? 0) + 1;
    rows++;
  });
  return { ok: errors.length === 0, rows, errors, byFilingYear };
}
