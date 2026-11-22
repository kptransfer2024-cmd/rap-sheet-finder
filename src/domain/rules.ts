import { CONVICTED, GOAL_CLEARANCE, IS_SC } from './questions';
import type { AlertId, Condition, Rule } from './types';

/**
 * Routing rules. Each rule that matches emits an outcome card; the highest
 * `priority` card becomes the leading "first action". Priorities rank the
 * practical FIRST STEP given available information — never a probability of
 * eligibility.
 *
 * Priority bands (documented in docs/decision-tree.mmd):
 *   100     scope stop (third-party lookup)
 *   88–95   safety handoffs (warrant, active supervision, immigration, juvenile-only)
 *   70–80   Santa Clara record-finding routes
 *   55–65   record-clearance information / relief checks
 *   40–54   supporting cards (copies after lookup, other jurisdictions)
 *   20–35   optional extras (statewide option for completeness, specialized review)
 */

const c = (q: string, codes: string[]): Condition => ({ q, in: codes, scope: 'case' });
const NUMBER_KNOWN = c('sc_case_number', ['yes']);
const NUMBER_NOT_KNOWN = c('sc_case_number', ['paperwork', 'no', 'unknown']);
const INDEX_ERA = c('sc_filing_era', ['from_2004', 'recent', 'unknown']);
const INDEX_NOT_DONE = c('sc_index_tried', ['not_tried', 'unknown']);
const INDEX_FOUND = c('sc_index_tried', ['found']);
const INDEX_FAILED = c('sc_index_tried', ['no_match', 'access_problem']);
const NEEDS_COPIES: Condition = { any: [{ q: 'goal', in: ['copies'] }, c('sc_still_missing', ['copies'])] };
const NO_ACTIVE: Condition = { not: { q: 'supervision', in: ['yes'] } };

export const RULES: Rule[] = [
  // ------------------------------------------------------------------ scope stops
  {
    id: 'R-THIRD-PARTY',
    scope: 'global',
    when: { q: 'whose_record', in: ['someone_else'] },
    emit: 'THIRD_PARTY_NOT_SUPPORTED',
    priority: 100,
    explain: { en: 'You said the record belongs to someone else.', es: 'Dijo que el récord es de otra persona.' },
    alerts: ['third_party'],
  },
  {
    id: 'R-JUVENILE-ONLY',
    scope: 'global',
    when: { q: 'jurisdiction', only: ['juvenile'] },
    emit: 'JUVENILE_HANDOFF',
    priority: 95,
    explain: { en: 'You said the case was in juvenile court.', es: 'Dijo que el caso fue en el tribunal juvenil.' },
  },
  {
    id: 'R-JUVENILE-MIXED',
    scope: 'global',
    when: { all: [{ q: 'jurisdiction', in: ['juvenile'] }, { not: { q: 'jurisdiction', only: ['juvenile'] } }] },
    emit: 'JUVENILE_HANDOFF',
    priority: 35,
    explain: { en: 'You have a juvenile case as well as other cases; juvenile records follow a separate process.', es: 'Tiene un caso juvenil además de otros casos.' },
    alerts: ['juvenile_mixed'],
  },
  // ------------------------------------------------------------------ safety handoffs
  {
    id: 'R-WARRANT',
    scope: 'global',
    when: { all: [IS_SC, { q: 'open_matters', in: ['warrant'] }] },
    emit: 'ACTIVE_CASE_LEGAL_HELP',
    priority: 92,
    explain: { en: 'You said there may be an unresolved warrant.', es: 'Dijo que puede haber una orden de arresto pendiente.' },
    alerts: ['warrant', 'active_matter'],
  },
  {
    id: 'R-ACTIVE-SUPERVISION',
    scope: 'global',
    when: { all: [IS_SC, GOAL_CLEARANCE, CONVICTED, { q: 'supervision', in: ['yes'] }] },
    emit: 'ACTIVE_CASE_LEGAL_HELP',
    priority: 90,
    explain: { en: 'You said probation, parole or diversion is still going on.', es: 'Dijo que la supervisión sigue en curso.' },
    alerts: ['active_matter'],
  },
  {
    id: 'R-ACTIVE-PENDING',
    scope: 'global',
    when: {
      all: [IS_SC, { any: [{ all: [GOAL_CLEARANCE, { q: 'matter_status', in: ['pending'] }] }, { q: 'open_matters', in: ['pending_case'] }] }],
    },
    emit: 'ACTIVE_CASE_LEGAL_HELP',
    priority: 90,
    explain: { en: 'You said a case is still open.', es: 'Dijo que un caso sigue abierto.' },
    alerts: ['active_matter'],
  },
  {
    id: 'R-IMMIGRATION',
    scope: 'global',
    when: { q: 'immigration', in: ['yes', 'unsure'] },
    emit: 'IMMIGRATION_COUNSEL',
    priority: 88,
    explain: { en: 'You said immigration status could be affected (or you\'re not sure).', es: 'Dijo que el estatus migratorio podría verse afectado.' },
    alerts: ['immigration'],
  },
  // ------------------------------------------------------------------ jurisdiction routes
  {
    id: 'R-UNKNOWN-JURISDICTION',
    scope: 'global',
    when: { q: 'jurisdiction', in: ['unknown'] },
    emit: 'UNKNOWN_JURISDICTION',
    priority: 80,
    explain: { en: 'You\'re not sure where the case or arrest was handled.', es: 'No está seguro/a de dónde se manejó.' },
  },
  {
    id: 'R-MULTI-CA',
    scope: 'global',
    when: { q: 'jurisdiction', in: ['multi_ca'] },
    emit: 'SC_MULTI_CA_DOJ_OPTION',
    priority: 55,
    explain: { en: 'You have cases in several California counties, or don\'t know them all.', es: 'Tiene casos en varios condados de California.' },
  },
  {
    id: 'R-OTHER-STATE',
    scope: 'global',
    when: { q: 'jurisdiction', in: ['other_state'] },
    emit: 'MULTISTATE_FBI_OPTION',
    priority: 50,
    explain: { en: 'You have a case in another state.', es: 'Tiene un caso en otro estado.' },
  },
  {
    id: 'R-FEDERAL',
    scope: 'global',
    when: { q: 'jurisdiction', in: ['federal'] },
    emit: 'FEDERAL_HANDOFF',
    priority: 50,
    explain: { en: 'You have a federal case.', es: 'Tiene un caso federal.' },
  },
  {
    id: 'R-OTHER-CA',
    scope: 'global',
    when: { q: 'jurisdiction', in: ['other_ca'] },
    emit: 'OTHER_CA_COUNTY',
    priority: 45,
    explain: { en: 'You have a case in another California county.', es: 'Tiene un caso en otro condado de California.' },
  },
  {
    id: 'R-DOJ-COMPLETENESS',
    scope: 'global',
    when: { all: [IS_SC, { q: 'completeness', in: ['yes', 'unknown'] }] },
    emit: 'SC_MULTI_CA_DOJ_OPTION',
    priority: 20,
    explain: {
      en: 'You may want to check for California cases you don\'t know about (three or more cases, an unknown count, or an unclear filing county).',
      es: 'Quizá quiera revisar si hay casos que no conoce.',
    },
  },
  // ------------------------------------------------------------------ Santa Clara: per-case record finding
  {
    id: 'R-SC-KNOWN-INFO',
    scope: 'case',
    when: {
      all: [
        IS_SC,
        NUMBER_KNOWN,
        {
          any: [
            { q: 'goal', in: ['unknown'] },
            { all: [{ q: 'goal', in: ['find_case'] }, c('sc_still_missing', ['confirm_only', 'status', 'unknown'])] },
          ],
        },
      ],
    },
    emit: 'SC_KNOWN_CASE_REQUEST',
    priority: 70,
    explain: { en: 'You already have the case number, so no name search is needed.', es: 'Ya tiene el número de caso; no necesita buscar por nombre.' },
  },
  {
    id: 'R-SC-KNOWN-COPIES',
    scope: 'case',
    when: { all: [IS_SC, NUMBER_KNOWN, NEEDS_COPIES] },
    emit: 'SC_COURT_DOCUMENTS',
    priority: 72,
    explain: { en: 'You have the case number and need copies.', es: 'Tiene el número y necesita copias.' },
  },
  {
    id: 'R-SC-KNOWN-GATHER',
    scope: 'case',
    when: { all: [IS_SC, NUMBER_KNOWN, GOAL_CLEARANCE] },
    emit: 'SC_COURT_DOCUMENTS',
    priority: 50,
    explain: { en: 'Record-clearance help usually starts with the case documents.', es: 'La ayuda para limpiar un récord suele empezar con los documentos del caso.' },
  },
  {
    id: 'R-SC-INDEX',
    scope: 'case',
    when: { all: [IS_SC, NUMBER_NOT_KNOWN, INDEX_ERA, INDEX_NOT_DONE] },
    emit: 'SC_INDEX_LOOKUP',
    priority: 75,
    explain: {
      en: 'You don\'t have the case number and the case may be from 2004 or later, which the court\'s online index covers.',
      es: 'No tiene el número y el caso puede ser de 2004 o después, que cubre el índice.',
    },
  },
  {
    id: 'R-SC-PRE2004',
    scope: 'case',
    when: { all: [IS_SC, NUMBER_NOT_KNOWN, c('sc_filing_era', ['pre_2004'])] },
    emit: 'SC_PRE_2004_CLERK',
    priority: 76,
    explain: { en: 'The case was filed before 2004, which the online index doesn\'t cover.', es: 'El caso es anterior a 2004, que el índice no cubre.' },
  },
  {
    id: 'R-SC-INDEX-FAILED',
    scope: 'case',
    when: { all: [IS_SC, NUMBER_NOT_KNOWN, INDEX_FAILED] },
    emit: 'DOCUMENT_ACCESS_FALLBACK',
    priority: 76,
    explain: { en: 'The online search didn\'t find a match or didn\'t work for you.', es: 'La búsqueda en línea no encontró nada o no le funcionó.' },
  },
  {
    id: 'R-SC-FOUND-INFO',
    scope: 'case',
    when: { all: [IS_SC, NUMBER_NOT_KNOWN, INDEX_FOUND, { q: 'goal', in: ['find_case', 'unknown'] }] },
    emit: 'SC_KNOWN_CASE_REQUEST',
    priority: 70,
    explain: { en: 'You found a case on the index that may be yours.', es: 'Encontró en el índice un caso que puede ser suyo.' },
  },
  {
    id: 'R-SC-FOUND-COPIES',
    scope: 'case',
    when: { all: [IS_SC, NUMBER_NOT_KNOWN, INDEX_FOUND, { q: 'goal', in: ['copies', 'clearance_info', 'existing_relief'] }] },
    emit: 'SC_COURT_DOCUMENTS',
    priority: 72,
    explain: { en: 'You found the case on the index; the next step is requesting documents.', es: 'Encontró el caso; el siguiente paso es pedir documentos.' },
  },
  {
    id: 'R-SC-COPIES-AFTER-LOOKUP',
    scope: 'case',
    when: { all: [IS_SC, NUMBER_NOT_KNOWN, { not: INDEX_FOUND }, { q: 'goal', in: ['copies'] }] },
    emit: 'SC_COURT_DOCUMENTS',
    priority: 40,
    explain: { en: 'You need copies; once you have the case number, these are the request steps.', es: 'Necesita copias; con el número, estos son los pasos.' },
  },
  // ------------------------------------------------------------------ Santa Clara: record-clearance information
  {
    id: 'R-SC-NO-CONVICTION',
    scope: 'global',
    when: {
      all: [IS_SC, { q: 'goal', in: ['clearance_info', 'existing_relief', 'unknown'] }, { q: 'matter_status', in: ['arrest_only', 'dismissed', 'acquitted'] }],
    },
    emit: 'SC_NO_CONVICTION_INFO',
    priority: 60,
    explain: { en: 'You said at least one matter ended without a conviction.', es: 'Dijo que al menos un asunto terminó sin condena.' },
  },
  {
    id: 'R-SC-DISMISSAL-INFO',
    scope: 'global',
    when: { all: [IS_SC, GOAL_CLEARANCE, CONVICTED, NO_ACTIVE] },
    emit: 'SC_ADULT_DISMISSAL_INFO',
    priority: 62,
    explain: { en: 'You said there was a conviction and supervision isn\'t known to be ongoing.', es: 'Dijo que hubo condena y la supervisión no sigue, que sepa.' },
  },
  {
    id: 'R-SC-DISMISSAL-LIGHT',
    scope: 'global',
    when: { all: [IS_SC, { q: 'goal', in: ['unknown'] }, CONVICTED] },
    emit: 'SC_ADULT_DISMISSAL_INFO',
    priority: 25,
    explain: { en: 'You mentioned a conviction; here\'s background in case you want to explore clearing it later.', es: 'Mencionó una condena; aquí hay información por si quiere explorarlo después.' },
  },
  {
    id: 'R-SC-CLEARANCE-UNKNOWN-OUTCOME',
    scope: 'global',
    when: { all: [IS_SC, GOAL_CLEARANCE, { q: 'matter_status', only: ['unknown'] }] },
    emit: 'CLEARANCE_MORE_INFO_NEEDED',
    priority: 58,
    explain: { en: 'You\'re not sure how the case ended, which decides which process could apply.', es: 'No sabe cómo terminó el caso.' },
  },
  {
    id: 'R-SC-RELIEF-GOAL',
    scope: 'global',
    when: { all: [IS_SC, { q: 'goal', in: ['existing_relief'] }] },
    emit: 'SC_AUTOMATIC_RELIEF_CHECK',
    priority: 65,
    explain: { en: 'You want to check whether relief already happened.', es: 'Quiere verificar si ya hubo alivio.' },
  },
  {
    id: 'R-SC-RELIEF-POSSIBLE',
    scope: 'global',
    when: { all: [IS_SC, { q: 'goal', in: ['clearance_info'] }, { q: 'relief_status', in: ['court_order', 'auto_relief', 'unknown'] }] },
    emit: 'SC_AUTOMATIC_RELIEF_CHECK',
    priority: 45,
    explain: { en: 'Relief may already exist (or you\'re not sure), so confirming it comes before any new request.', es: 'Puede que ya exista alivio; confírmelo primero.' },
  },
  {
    id: 'R-SPECIALIZED',
    scope: 'global',
    when: { all: [IS_SC, { any: [{ q: 'state_prison', in: ['yes'] }, { q: 'purpose', in: ['firearms', 'school_license'] }] }] },
    emit: 'SPECIALIZED_REVIEW',
    priority: 30,
    explain: { en: 'A state prison sentence, firearm rights or licensing can involve special rules.', es: 'La prisión estatal, las armas o las licencias pueden tener reglas especiales.' },
  },
];

/** Alert-only rules (no card). */
export const ALERT_RULES: Array<{ id: string; when: Condition; alert: AlertId }> = [
  { id: 'A-SC-FILING-UNCLEAR', when: { q: 'jurisdiction', in: ['sc_incident_only'] }, alert: 'sc_filing_unclear' },
];

export const FALLBACK_OUTCOME_ID = 'CANNOT_DETERMINE';
export const FALLBACK_RULE_ID = 'R-FALLBACK';
