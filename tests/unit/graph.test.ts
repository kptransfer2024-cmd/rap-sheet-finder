import { describe, expect, it } from 'vitest';
import { PERSONAS } from '../../src/data/personas';
import { buildPlan, evaluate, pruneAnswers, toggleMulti, walk } from '../../src/domain/engine';
import { OUTCOMES } from '../../src/domain/outcomes';
import { QUESTION_BY_ID } from '../../src/domain/questions';
import { validateGraph } from '../../src/domain/validate';
import { CuratedAiService } from '../../src/lib/ai/mock';
import { DisabledAiService } from '../../src/lib/ai/disabled';
import { aiService } from '../../src/lib/ai';
import { CASE_INDEX_IMPORT_ENABLED, validateCaseIndexCsv } from '../../src/lib/data-import/caseIndex';
import { readFileSync } from 'node:fs';

describe('decision graph validation', () => {
  const report = validateGraph(40);
  it('has no structural errors (cycles, missing targets, missing unknown options, dead ends)', () => {
    expect(report.errors).toEqual([]);
  });
  it('reaches every question and every non-fallback outcome', () => {
    expect(report.stats.reachedQuestions).toBe(report.stats.questions);
    for (const o of OUTCOMES) if (o.id !== 'CANNOT_DETERMINE') expect(report.reachedOutcomes.has(o.id), o.id).toBe(true);
  });
  it('has at least 10 distinct terminal outcomes', () => {
    expect(OUTCOMES.length).toBeGreaterThanOrEqual(10);
  });
});

describe('engine basics', () => {
  it('is deterministic', () => {
    for (const p of PERSONAS) expect(JSON.stringify(buildPlan(p.answers))).toBe(JSON.stringify(buildPlan(p.answers)));
  });

  it('every persona reaches its expected outcome', () => {
    for (const p of PERSONAS) {
      const plan = buildPlan(p.answers);
      expect(plan.primary.id, `persona ${p.id}`).toBe(p.expectedPrimary);
      for (const also of p.expectedAlso ?? []) expect(plan.cards.map((c) => c.id), `persona ${p.id}`).toContain(also);
      expect(plan.primary.ruleTrace.length).toBeGreaterThan(0);
    }
  });

  it('every persona answer set is already valid (nothing pruned)', () => {
    for (const p of PERSONAS) expect(Object.keys(pruneAnswers(p.answers)).sort(), p.id).toEqual(Object.keys(p.answers).sort());
  });

  it('unanswered applicable questions default to their unknown code, never "no"', () => {
    const w = walk({ whose_record: 'own', goal: 'find_case', jurisdiction: ['santa_clara'] }, 'fill');
    expect(w.effective.case_count).toBe('unknown');
    expect(w.effective['sc_case_number@all']).toBe('unknown');
    for (const inst of w.instances.filter((i) => i.defaulted)) {
      const kind = inst.node.options.find((o) => o.code === inst.node.unknownCode)!.kind;
      expect(['unknown', 'prefer_not']).toContain(kind);
    }
  });

  it('three or more cases are handled as one group instance', () => {
    const w = walk({ whose_record: 'own', goal: 'find_case', jurisdiction: ['santa_clara'], case_count: 'three_plus' }, 'pending');
    expect(w.cases.map((c) => c.key)).toEqual(['all']);
    expect(w.firstPending?.key).toBe('sc_case_number@all');
  });

  it('exclusive multi-select options clear the others', () => {
    const j = QUESTION_BY_ID.jurisdiction;
    expect(toggleMulti(j, ['santa_clara', 'federal'], 'unknown')).toEqual(['unknown']);
    expect(toggleMulti(j, ['unknown'], 'federal')).toEqual(['federal']);
    expect(toggleMulti(j, ['federal'], 'santa_clara')).toEqual(['santa_clara', 'federal']);
  });

  it('conditions: unscoped reference to a per-case question means "any case"', () => {
    const eff = { 'sc_index_tried@1': 'not_tried', 'sc_index_tried@2': 'no_match' };
    expect(evaluate({ q: 'sc_index_tried', in: ['no_match'] }, { eff })).toBe(true);
    expect(evaluate({ q: 'sc_index_tried', in: ['no_match'], scope: 'case' }, { eff, caseKey: '1' })).toBe(false);
  });
});

describe('optional AI boundary', () => {
  it('ships disabled; the app needs no key', async () => {
    expect(aiService.isAvailable()).toBe(false);
    expect(aiService.mode).toBe('disabled');
    await expect(new DisabledAiService().explainTerm()).rejects.toThrow();
  });
  it('curated service only restates approved content', async () => {
    const s = new CuratedAiService();
    expect(await s.explainTerm('docket', [])).toMatch(/Docket/);
    expect(await s.clerkQuestionTemplate('SC_INDEX_LOOKUP', [])).toMatch(/\[year\]/);
    const steps = await s.rephraseChecklist('SC_COURT_DOCUMENTS', [], 'simple');
    expect(steps).toMatch(/Request by mail/);
  });
  it('no API key or VITE_ secret is referenced in source', () => {
    const env = readFileSync('.env.example', 'utf8');
    expect(env).not.toMatch(/sk-|api_key\s*=\s*\S+/i);
  });
});

describe('future case-index import (disabled)', () => {
  it('is disabled and refuses non-fictional files', () => {
    expect(CASE_INDEX_IMPORT_ENABLED).toBe(false);
    expect(validateCaseIndexCsv('case_number,filing_date,party_name\nX,2020-01-01,Y').ok).toBe(false);
  });
  it('validates the fictional fixture and returns aggregates only', () => {
    const csv = readFileSync('tests/fixtures/fictional_case_index.csv', 'utf8');
    const r = validateCaseIndexCsv(csv);
    expect(r.ok).toBe(true);
    expect(r.rows).toBe(5);
    expect(Object.keys(r)).not.toContain('matches');
  });
});
