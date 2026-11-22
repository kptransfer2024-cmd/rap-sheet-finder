/**
 * Master prompt §14 — mandatory routes and regression cases (1–28; 29–30 are UI
 * tests in ui.test.tsx and tests/e2e). Assertions inspect STRUCTURED results.
 */
import { describe, expect, it } from 'vitest';
import { buildPlan, pruneAnswers, walk } from '../../src/domain/engine';
import { OUTCOMES } from '../../src/domain/outcomes';
import { QUESTIONS } from '../../src/domain/questions';
import { enumeratePaths } from '../../src/domain/validate';
import { PLACE_BY_ID, SC_COURTHOUSE_IDS } from '../../src/data/jurisdictions/santa-clara';
import { RESOURCE_BY_ID } from '../../src/data/resources';
import { SC_BASE, allTags, card, ids, plan, planText, requiredTags, stepIds } from './helpers';

const STATEWIDE_OR_FEDERAL = ['doj_record_review', 'fbi_record'] as const;

describe('§14 mandatory routes', () => {
  it('1. one SC case, known number, needs copies → court copies; no DOJ/FBI at all', () => {
    const p = plan({ ...SC_BASE, goal: 'copies', 'sc_case_number@1': 'yes', 'sc_courthouse@1': 'hoj', copy_type: 'plain' });
    expect(p.primary.id).toBe('SC_COURT_DOCUMENTS');
    for (const t of STATEWIDE_OR_FEDERAL) expect(allTags(p)).not.toContain(t);
    expect(ids(p)).not.toContain('SC_MULTI_CA_DOJ_OPTION');
    expect(ids(p)).not.toContain('MULTISTATE_FBI_OPTION');
    expect(p.primary.places.map((x) => x.id)).toEqual(['sc_hoj']);
    expect(p.primary.places[0].match).toBe('user_identified');
  });

  it('2. one SC case from ~2018, no number → official index first, then Clerk document request', () => {
    const p = plan({ ...SC_BASE, goal: 'copies', 'sc_case_number@1': 'no', 'sc_filing_era@1': 'from_2004', 'sc_index_tried@1': 'not_tried' });
    expect(p.primary.id).toBe('SC_INDEX_LOOKUP');
    expect(ids(p)).toContain('SC_COURT_DOCUMENTS');
    expect(p.cards.findIndex((c) => c.id === 'SC_INDEX_LOOKUP')).toBeLessThan(p.cards.findIndex((c) => c.id === 'SC_COURT_DOCUMENTS'));
    expect(requiredTags(p)).toContain('index_search');
    for (const t of STATEWIDE_OR_FEDERAL) expect(allTags(p)).not.toContain(t);
    // index described as an index, documents not online
    expect(card(p, 'SC_INDEX_LOOKUP').summaryPlainLanguage.en).toMatch(/not your full criminal history/i);
    expect(card(p, 'SC_INDEX_LOOKUP').steps.find((s) => s.id === 'search_index')!.factIds).toContain('sc_no_documents_online');
  });

  it('3. SC pre-2004 → Clerk-assisted search, never microfiche self-service', () => {
    const p = plan({ ...SC_BASE, goal: 'find_case', 'sc_case_number@1': 'no', 'sc_filing_era@1': 'pre_2004' });
    expect(p.primary.id).toBe('SC_PRE_2004_CLERK');
    expect(requiredTags(p)).toContain('clerk_search');
    expect(allTags(p)).not.toContain('index_search');
    for (const s of p.primary.steps) expect(s.instruction.en).not.toMatch(/microfiche/i);
    expect(p.primary.summaryPlainLanguage.en).toMatch(/Don't plan on searching microfiche yourself/);
    expect(p.primary.uncertainties.map((u) => u.en).join(' ')).toMatch(/microfiche/i);
  });

  it('4. SC filing year unknown → index + Clerk fallback with explicit ambiguity', () => {
    const p = plan({ ...SC_BASE, goal: 'find_case', 'sc_case_number@1': 'no', 'sc_filing_era@1': 'unknown', 'sc_index_tried@1': 'not_tried' });
    expect(p.primary.id).toBe('SC_INDEX_LOOKUP');
    const era = p.primary.steps.find((s) => s.id === 'era_unknown');
    expect(era).toBeDefined();
    expect(era!.tags).toContain('clerk_search');
    expect(era!.instruction.en).toMatch(/before 2004/);
  });

  it('4b. very recent case → quarterly-update warning', () => {
    const p = plan({ ...SC_BASE, goal: 'find_case', 'sc_case_number@1': 'no', 'sc_filing_era@1': 'recent', 'sc_index_tried@1': 'not_tried' });
    expect(stepIds(p.primary)).toContain('recent_case');
  });

  it('5. SC index no match → not an assertion of no criminal history', () => {
    const p = plan({ ...SC_BASE, goal: 'find_case', 'sc_case_number@1': 'no', 'sc_filing_era@1': 'from_2004', 'sc_index_tried@1': 'no_match' });
    expect(p.primary.id).toBe('DOCUMENT_ACCESS_FALLBACK');
    expect(stepIds(p.primary)).toContain('why_no_match');
    expect(p.primary.summaryPlainLanguage.en).toMatch(/does not prove/i);
    expect(planText(p)).not.toMatch(/you have no (criminal )?(record|history)/i);
    expect(requiredTags(p)).toContain('clerk_search');
  });

  it('6. SC, unsure if charged → minimal discovery route; no assumption of conviction', () => {
    const p = plan({ ...SC_BASE, goal: 'unknown', matter_status: ['unknown'], 'sc_case_number@1': 'unknown', 'sc_filing_era@1': 'unknown', 'sc_index_tried@1': 'unknown' });
    expect(ids(p)).not.toContain('SC_ADULT_DISMISSAL_INFO');
    expect(allTags(p)).not.toContain('form_cr180');
    expect(allTags(p)).not.toContain('form_cr181');
    expect(p.primary.category).toBe('find_case');
  });

  it('7. arrest never charged → arrest-sealing/automatic-relief INFORMATION, not CR-180', () => {
    const p = plan({ ...SC_BASE, goal: 'clearance_info', matter_status: ['arrest_only'], immigration: 'no', 'sc_case_number@1': 'no', 'sc_filing_era@1': 'from_2004', 'sc_index_tried@1': 'not_tried', relief_status: 'none_known' });
    const c = card(p, 'SC_NO_CONVICTION_INFO');
    expect(c.status).toBe('avenue_to_explore');
    expect(c.actionTags).toEqual(expect.arrayContaining(['form_cr409', 'form_cr410']));
    expect(allTags(p)).not.toContain('form_cr180');
    expect(stepIds(c)).toContain('never_charged');
    // checking DOJ first is optional, not required
    expect(c.requiredActionTags).not.toContain('doj_record_review');
  });

  it('8. adult conviction, finished supervision → possible dismissal information, never "eligible"', () => {
    const p = plan({ ...SC_BASE, goal: 'clearance_info', matter_status: ['convicted'], immigration: 'no', 'sc_case_number@1': 'yes', 'sc_courthouse@1': 'hoj', conviction_class: ['misdemeanor'], supervision: 'no', open_matters: ['none'], obligations: 'all_done', relief_status: 'none_known' });
    expect(p.primary.id).toBe('SC_ADULT_DISMISSAL_INFO');
    expect(p.primary.status).toBe('avenue_to_explore');
    expect(p.classification).toBe('informational');
    expect(planText(p)).not.toMatch(/\byou (are|re|'re) eligible\b/i);
    expect(p.primary.actionTags).toEqual(expect.arrayContaining(['form_cr180', 'form_cr181', 'form_mc031']));
    expect(ids(p)).toContain('SC_COURT_DOCUMENTS'); // gather documents
  });

  it('9. active probation → early-termination + legal help; no definitive denial', () => {
    const p = plan({ ...SC_BASE, goal: 'clearance_info', matter_status: ['convicted'], immigration: 'no', 'sc_case_number@1': 'yes', 'sc_courthouse@1': 'hoj', conviction_class: ['felony'], state_prison: 'no', supervision: 'yes', open_matters: ['none'], relief_status: 'none_known' });
    expect(p.primary.id).toBe('ACTIVE_CASE_LEGAL_HELP');
    expect(p.primary.status).toBe('legal_review_recommended');
    expect(p.primary.actionTags).toContain('early_termination_info');
    expect(stepIds(p.primary)).toContain('records_ok');
    expect(p.alerts).toContain('active_matter');
    expect(planText(p)).not.toMatch(/\b(ineligible|not eligible|cannot be (dismissed|cleared))\b/i);
    expect(ids(p)).not.toContain('SC_ADULT_DISMISSAL_INFO');
  });

  it('10. pending charges or warrant → cautious legal referral; never evade court', () => {
    const p = plan({ ...SC_BASE, goal: 'clearance_info', matter_status: ['convicted'], immigration: 'no', 'sc_case_number@1': 'yes', 'sc_courthouse@1': 'hoj', conviction_class: ['misdemeanor'], supervision: 'no', open_matters: ['pending_case', 'warrant'], relief_status: 'none_known' });
    expect(p.primary.id).toBe('ACTIVE_CASE_LEGAL_HELP');
    expect(p.alerts).toEqual(expect.arrayContaining(['warrant', 'active_matter']));
    expect(stepIds(p.primary)).toEqual(expect.arrayContaining(['warrant', 'pending']));
    const text = planText(p);
    expect(text).toMatch(/Don't ignore it/);
    expect(text).not.toMatch(/\b(avoid|evade|hide from|stay away from) (the )?(court|police|warrant)/i);
  });

  it('11. two SC cases → per-case cards, not one petition for all', () => {
    const p = plan({
      whose_record: 'own',
      goal: 'clearance_info',
      jurisdiction: ['santa_clara'],
      case_count: 'two',
      matter_status: ['convicted'],
      immigration: 'no',
      'sc_case_number@1': 'yes',
      'sc_courthouse@1': 'hoj',
      'sc_case_number@2': 'no',
      'sc_filing_era@2': 'from_2004',
      'sc_index_tried@2': 'not_tried',
      'sc_courthouse@2': 'palo_alto',
      conviction_class: ['misdemeanor'],
      supervision: 'no',
      relief_status: 'none_known',
    });
    const caseCards = p.cards.filter((c) => c.caseKey);
    expect(new Set(caseCards.map((c) => c.caseKey))).toEqual(new Set(['1', '2']));
    expect(p.cards.find((c) => c.id === 'SC_COURT_DOCUMENTS' && c.caseKey === '1')).toBeDefined();
    expect(p.cards.find((c) => c.id === 'SC_INDEX_LOOKUP' && c.caseKey === '2')).toBeDefined();
    expect(new Set(p.cards.map((c) => c.instanceId)).size).toBe(p.cards.length);
    const dismissal = card(p, 'SC_ADULT_DISMISSAL_INFO');
    expect(stepIds(dismissal)).toContain('per_case');
    expect(dismissal.steps.find((s) => s.id === 'per_case')!.instruction.en).toMatch(/not one petition for all/);
    // courthouse is per case
    expect(p.cards.find((c) => c.instanceId === 'SC_INDEX_LOOKUP#2')!.places.map((x) => x.id)).toEqual(['sc_palo_alto']);
  });

  it('12. several CA counties → DOJ review is an OPTION; never FBI', () => {
    const p = plan({ whose_record: 'own', goal: 'find_case', jurisdiction: ['multi_ca'], existing_reports: ['none'] });
    expect(p.primary.id).toBe('SC_MULTI_CA_DOJ_OPTION');
    expect(allTags(p)).toContain('doj_record_review');
    expect(requiredTags(p)).not.toContain('doj_record_review');
    expect(allTags(p)).not.toContain('fbi_record');
    expect(p.primary.actionTags).toContain('doj_fee_waiver');
  });

  it('13. multi-state uncertainty → FBI info route + jurisdiction disclaimer', () => {
    const p = plan({ whose_record: 'own', goal: 'find_case', jurisdiction: ['other_state'] });
    expect(p.primary.id).toBe('MULTISTATE_FBI_OPTION');
    expect(p.primary.actionTags).toContain('fbi_record');
    expect(p.primary.requiredActionTags).not.toContain('fbi_record');
    expect(p.primary.requiredActionTags).toContain('other_state_court');
    expect(p.primary.summaryPlainLanguage.en).toMatch(/can't clear another state's records/);
  });

  it('14. federal-only case → no CR-180/CR-181 as federal forms', () => {
    const p = plan({ whose_record: 'own', goal: 'clearance_info', jurisdiction: ['federal'], immigration: 'no' });
    expect(p.primary.id).toBe('FEDERAL_HANDOFF');
    expect(allTags(p)).not.toContain('form_cr180');
    expect(allTags(p)).not.toContain('form_cr181');
    expect(p.primary.steps.flatMap((s) => s.officialResources)).not.toContain('form_cr180');
    expect(p.primary.summaryPlainLanguage.en).toMatch(/don't apply to federal convictions/);
  });

  it('15. juvenile → juvenile branch only; no adult Clerk instructions', () => {
    const a = { whose_record: 'own', goal: 'copies', jurisdiction: ['juvenile'] };
    const p = plan(a);
    expect(ids(p)).toEqual(['JUVENILE_HANDOFF']);
    expect(allTags(p)).not.toContain('court_copies');
    expect(p.primary.places.map((x) => x.id)).toEqual(['sc_juvenile']);
    // no adult case questions were asked
    expect(walk(a, 'pending').firstPending).toBeUndefined();
  });

  it('16. immigration concern → prominent qualified-counsel warning', () => {
    const p = plan({ ...SC_BASE, goal: 'clearance_info', matter_status: ['convicted'], immigration: 'yes', 'sc_case_number@1': 'yes', 'sc_courthouse@1': 'hoj', conviction_class: ['misdemeanor'], supervision: 'no', relief_status: 'none_known' });
    expect(p.alerts).toContain('immigration');
    expect(p.primary.id).toBe('IMMIGRATION_COUNSEL');
    expect(p.primary.actionTags).toContain('immigration_counsel');
    expect(planText(p)).not.toMatch(/resolves? (all )?immigration/i);
  });

  it('17. automatic relief already granted → verify order + limitations, not "record erased"', () => {
    const p = plan({ ...SC_BASE, goal: 'existing_relief', matter_status: ['convicted'], immigration: 'no', 'sc_case_number@1': 'yes', 'sc_courthouse@1': 'palo_alto', conviction_class: ['misdemeanor'], supervision: 'no', relief_status: 'auto_relief', existing_reports: ['doj_report'] });
    expect(p.primary.id).toBe('SC_AUTOMATIC_RELIEF_CHECK');
    expect(stepIds(p.primary)).toEqual(expect.arrayContaining(['ask_court', 'limits', 'stale_report']));
    expect(p.primary.summaryPlainLanguage.en).toMatch(/not a dismissal, sealing or expungement/);
    expect(planText(p)).not.toMatch(/\b(record|conviction) (is|was|has been) (erased|deleted|wiped)\b/i);
  });

  it('18. certified copies → distinguished from plain copies, with fees flagged', () => {
    const p = plan({ ...SC_BASE, goal: 'copies', 'sc_case_number@1': 'yes', 'sc_courthouse@1': 'hoj', copy_type: 'certified' });
    const steps = stepIds(p.primary);
    expect(steps).toContain('certified_copies');
    expect(steps).not.toContain('plain_copies');
    expect(p.primary.actionTags).toContain('certified_copies');
    const cert = p.primary.steps.find((s) => s.id === 'certified_copies')!;
    expect(cert.factIds).toContain('sc_certified_fee');
    expect(cert.verificationStatus).toBe('partial'); // fee amount is research-only
    const plain = plan({ ...SC_BASE, goal: 'copies', 'sc_case_number@1': 'yes', 'sc_courthouse@1': 'hoj', copy_type: 'plain' });
    expect(stepIds(plain.primary)).toContain('plain_copies');
    expect(plain.primary.actionTags).not.toContain('certified_copies');
  });

  it('19. no printer + cannot travel → mail/phone alternatives; no false online-download promise', () => {
    const p = plan({ ...SC_BASE, goal: 'copies', 'sc_case_number@1': 'yes', 'sc_courthouse@1': 'hoj', copy_type: 'plain', practical: ['no_travel', 'no_printer', 'tight_budget'] });
    const mail = p.primary.steps.find((s) => s.id === 'request_by_mail')!;
    expect(mail.method).toBe('mail');
    expect(mail.accessibilityAlternative!.en).toMatch(/handwritten/);
    expect(p.primary.fallbacks.map((f) => f.en).join(' ')).toMatch(/Can't travel\? Use the mail request/);
    expect(planText(p)).not.toMatch(/download (your|the) (court )?(documents|copies|records)/i);
    expect(p.primary.steps.filter((s) => s.method === 'online')).toHaveLength(0);
    // in-person steps become options, not requirements
    expect(p.primary.steps.filter((s) => s.method === 'in_person').every((s) => s.optional)).toBe(true);
    expect(p.primary.requiredActionTags).toContain('court_copies');
  });

  it('20. portal requires login → do not contradict; offer official Clerk fallback', () => {
    const p = plan({ ...SC_BASE, goal: 'find_case', 'sc_case_number@1': 'no', 'sc_filing_era@1': 'from_2004', 'sc_index_tried@1': 'access_problem' });
    expect(p.primary.id).toBe('DOCUMENT_ACCESS_FALLBACK');
    const s = p.primary.steps.find((x) => x.id === 'access_problem')!;
    expect(s.instruction.en).toMatch(/not confirmed/);
    expect(s.instruction.en).toMatch(/Don't try to get around sign-in/);
    expect(planText(p)).not.toMatch(/no (account|login|sign-in) (is )?(needed|required)/i);
    expect(stepIds(p.primary)).toContain('clerk_search');
  });

  it('21. never invents a Santa Clara courthouse floor, room or window', () => {
    const scText = [
      ...SC_COURTHOUSE_IDS.map((id) => PLACE_BY_ID[id]),
      PLACE_BY_ID.sc_juvenile,
      PLACE_BY_ID.sc_probation,
      PLACE_BY_ID.sc_pd_reentry,
    ]
      .flatMap((pl) => [pl.streetAddress, pl.mailingAddress ?? '', ...pl.unknowns.map((u) => u.en), ...(pl.notes ?? []).map((n) => n.en)])
      .join('\n');
    expect(scText).not.toMatch(/\b(floor|room|window|suite|dept\.?|department)\s*#?\s*\d/i);
    expect(scText).not.toMatch(/\b\d+(st|nd|rd|th) floor\b/i);
    expect(PLACE_BY_ID.sc_hoj.unknowns[0].en).toMatch(/not published/);
    for (const o of OUTCOMES.filter((x) => x.id.startsWith('SC_') || x.id === 'DOCUMENT_ACCESS_FALLBACK'))
      for (const s of o.steps) expect(s.instruction.en).not.toMatch(/\b(room|window|floor)\s*#?\s*\d/i);
  });

  it('22. unverified government URL → shows needs verification + safe Clerk path', () => {
    expect(RESOURCE_BY_ID.sc_probation_clearance.verificationStatus).toBe('needs_review');
    expect(RESOURCE_BY_ID.sc_probation_clearance.lastCheckedByBuild).toBeUndefined();
    const p = plan({ ...SC_BASE, goal: 'clearance_info', matter_status: ['convicted'], immigration: 'no', 'sc_case_number@1': 'yes', 'sc_courthouse@1': 'hoj', conviction_class: ['misdemeanor'], supervision: 'no', relief_status: 'none_known' });
    const step = card(p, 'SC_ADULT_DISMISSAL_INFO').steps.find((s) => s.id === 'county_pathways')!;
    expect(step.verificationStatus).toBe('needs_review');
    expect(p.cards.some((c) => c.sourceIds.includes('sc_contacts'))).toBe(true);
  });

  it('23. FW-001 is never a required record-clearance form; DOJ fee waiver is distinct', () => {
    for (const o of OUTCOMES) for (const s of o.steps) expect(s.officialResources).not.toContain('form_fw001');
    const p = plan({ whose_record: 'own', goal: 'find_case', jurisdiction: ['multi_ca'] });
    const waiver = p.primary.steps.find((s) => s.id === 'doj_fee_waiver')!;
    expect(waiver.officialResources).toEqual(['doj_fee_waiver']);
    expect(waiver.instruction.en).toMatch(/NOT the court's FW-001/);
  });

  it('24. mixed Santa Clara + federal → separate cards, no single legal procedure', () => {
    const p = plan({ whose_record: 'own', goal: 'find_case', jurisdiction: ['santa_clara', 'federal'], case_count: 'one', 'sc_case_number@1': 'no', 'sc_filing_era@1': 'from_2004', 'sc_index_tried@1': 'not_tried' });
    expect(ids(p)).toEqual(expect.arrayContaining(['SC_INDEX_LOOKUP', 'FEDERAL_HANDOFF']));
    expect(card(p, 'FEDERAL_HANDOFF').actionTags).not.toContain('form_cr180');
    expect(card(p, 'SC_INDEX_LOOKUP').actionTags).not.toContain('federal_court');
  });

  it('25. editing an upstream answer clears downstream answers and recalculates', () => {
    const before = { ...SC_BASE, goal: 'find_case', 'sc_case_number@1': 'no', 'sc_filing_era@1': 'pre_2004', clerk_contacted: 'no_response' };
    expect(plan(before).primary.id).toBe('SC_PRE_2004_CLERK');
    const edited = pruneAnswers({ ...before, 'sc_case_number@1': 'yes' });
    expect(edited['sc_filing_era@1']).toBeUndefined();
    expect(edited.clerk_contacted).toBeUndefined();
    expect(edited.goal).toBe('find_case'); // unaffected upstream answers stay
    expect(walk(edited, 'pending').firstPending?.key).toBe('sc_still_missing@1');
    expect(plan({ ...edited, 'sc_still_missing@1': 'status' }).primary.id).toBe('SC_KNOWN_CASE_REQUEST');
    // changing case count from two to one drops case-2 answers
    const two = { ...SC_BASE, case_count: 'two', goal: 'find_case', 'sc_case_number@1': 'yes', 'sc_case_number@2': 'no' };
    expect(pruneAnswers({ ...two, case_count: 'one' })['sc_case_number@2']).toBeUndefined();
    // changing jurisdiction away from SC drops every SC answer
    const away = pruneAnswers({ ...before, jurisdiction: ['federal'] });
    expect(Object.keys(away).filter((k) => k.startsWith('sc_') || k === 'case_count')).toEqual([]);
  });

  it('26. every question answered "unknown" has a defined, non-crashing path', () => {
    // Take real paths that reach each question, then switch that answer to its unknown code.
    const { plans } = enumeratePaths(8);
    for (const q of QUESTIONS) {
      const sample = plans.find(({ answers }) => Object.keys(answers).some((k) => k === q.id || k.startsWith(`${q.id}@`)));
      expect(sample, q.id).toBeDefined();
      const key = Object.keys(sample!.answers).find((k) => k === q.id || k.startsWith(`${q.id}@`))!;
      const answers = { ...sample!.answers, [key]: q.type === 'multi' ? [q.unknownCode] : q.unknownCode };
      const p = buildPlan(answers);
      expect(p.cards.length, q.id).toBeGreaterThan(0);
      expect(p.primary.sourceIds.length, q.id).toBeGreaterThan(0);
    }
    expect(() => buildPlan({})).not.toThrow();
    expect(buildPlan({}).primary.id).toBe('UNKNOWN_JURISDICTION');
  });

  it('27. every terminal outcome has an official resource or human-help resource', () => {
    for (const o of OUTCOMES) {
      const r = new Set([...o.steps.flatMap((s) => s.officialResources), ...o.legalHelpReferralIds]);
      expect(r.size, o.id).toBeGreaterThan(0);
      for (const id of r) expect(RESOURCE_BY_ID[id], `${o.id} -> ${id}`).toBeDefined();
    }
  });

  it('28. no route includes a person search, sealed-record access or automated filing', () => {
    const all = OUTCOMES.flatMap((o) => o.steps.map((s) => `${s.title.en} ${s.instruction.en}`)).join('\n');
    expect(all).not.toMatch(/\b(we|this tool|rap sheet finder) (will )?(search|file|submit|look up|fill out|fill in)\b/i);
    expect(all).not.toMatch(/\b(we|this tool) (searched|filed|checked your)/i);
    expect(all).not.toMatch(/access (to )?sealed records/i);
    // forms are explicitly NOT auto-completed
    expect(all).toMatch(/this tool doesn't fill them out/);
  });
});

describe('fallback route', () => {
  it('produces CANNOT_DETERMINE with resources when no rule matches', () => {
    const p = buildPlan({ whose_record: 'own', goal: 'find_case', jurisdiction: ['santa_clara'] }, []);
    expect(p.primary.id).toBe('CANNOT_DETERMINE');
    expect(p.primary.sourceIds.length).toBeGreaterThan(0);
    expect(p.trace.some((t) => t.kind === 'fallback')).toBe(true);
  });
});

describe('example journeys (§18)', () => {
  it('Example 1: find records → SC → no number → 2004+ → index first, no forced statewide', () => {
    const p = plan({ whose_record: 'own', goal: 'find_case', jurisdiction: ['santa_clara'], case_count: 'one', 'sc_case_number@1': 'no', 'sc_filing_era@1': 'from_2004' });
    expect(p.primary.id).toBe('SC_INDEX_LOOKUP');
    expect(p.primary.places.length).toBeGreaterThan(0);
    expect(allTags(p)).not.toContain('doj_record_review');
    expect(p.trace.some((t) => t.kind === 'default' && t.key === 'sc_index_tried@1')).toBe(true);
  });

  it('Example 2: old conviction, SC, has number, convicted, not on probation, relief unsure', () => {
    const p = plan({ whose_record: 'own', goal: 'clearance_info', jurisdiction: ['santa_clara'], case_count: 'one', 'sc_case_number@1': 'yes', matter_status: ['convicted'], supervision: 'no', relief_status: 'unknown', immigration: 'no' });
    expect(p.primary.id).toBe('SC_ADULT_DISMISSAL_INFO');
    expect(ids(p)).toEqual(expect.arrayContaining(['SC_AUTOMATIC_RELIEF_CHECK', 'SC_COURT_DOCUMENTS']));
    expect(stepIds(p.primary)).toContain('relief_first');
  });
});
