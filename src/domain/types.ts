/**
 * Core domain types for Rap Sheet Finder.
 *
 * Design rules (see docs/implementation_notes.md):
 *  - Routing is decided by declarative data (questions + rules), never by an LLM.
 *  - Answers are coarse option CODES only. No names, dates of birth, case numbers,
 *    charges, addresses or free text are ever stored.
 *  - Every outcome is informational. There is deliberately no "eligible" type.
 */

export type Locale = 'en' | 'es';

/** Localized text. Spanish is optional; English is the fallback. */
export interface LText {
  en: string;
  es?: string;
}

export type VerificationStatus = 'verified' | 'partial' | 'needs_review';

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export type QuestionId = string;
export type OptionCode = string;
export type AnswerValue = OptionCode | OptionCode[];

/**
 * Answer store. Keys are `questionId` for global questions and
 * `questionId@caseKey` for per-case questions (e.g. `sc_case_number@2`).
 */
export type Answers = Record<string, AnswerValue>;

export type OptionKind = 'normal' | 'unknown' | 'prefer_not' | 'none';

export interface QuestionOption {
  code: OptionCode;
  label: LText;
  hint?: LText;
  /** In multi-select questions, choosing an exclusive option clears the others. */
  exclusive?: boolean;
  kind?: OptionKind;
}

export type QuestionSection = 'start' | 'scope' | 'records' | 'clearance' | 'practical';

export interface QuestionNode {
  /** Stable ID. Never rename without a migration note in docs. */
  id: QuestionId;
  /** Which entries of the master-prompt question bank (Q01–Q40) this covers. */
  bankRefs: string[];
  section: QuestionSection;
  /** 'case' questions are asked once per Santa Clara case instance. */
  scope: 'global' | 'case';
  type: 'single' | 'multi';
  prompt: LText;
  /** Short helper line under the prompt. */
  help?: LText;
  /** Content of the "Why we ask" panel. Required: every question must justify itself. */
  whyWeAsk: LText;
  options: QuestionOption[];
  /**
   * Code used when an applicable question is left unanswered (skipped or
   * "show my plan now"). Must be an option whose kind is 'unknown' or 'prefer_not'.
   * We never silently treat "not sure" as "no".
   */
  unknownCode: OptionCode;
  optional?: boolean;
  /** Ask only when this condition holds. Omitted = always ask. */
  askIf?: Condition;
  glossary?: string[];
}

// ---------------------------------------------------------------------------
// Conditions (declarative predicates)
// ---------------------------------------------------------------------------

/**
 * `q`/`in`: true when the (effective) answer is one of the codes; for multi-select
 * answers, true when ANY selected code is in the list.
 * `scope: 'case'` reads the per-case answer for the case currently being evaluated.
 */
export type Condition =
  | { q: QuestionId; in: OptionCode[]; scope?: 'case' }
  | { q: QuestionId; answered: boolean; scope?: 'case' }
  | { q: QuestionId; only: OptionCode[]; scope?: 'case' }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { always: true };

// ---------------------------------------------------------------------------
// Sources, facts and places
// ---------------------------------------------------------------------------

export interface SourceRef {
  id: string;
  title: LText;
  url: string;
  owner: string;
  jurisdiction: 'santa_clara' | 'california' | 'federal' | 'other';
  officialDomain: string;
  verificationStatus: VerificationStatus;
  /** Set ONLY if this build actually opened the page. ISO date. */
  lastCheckedByBuild?: string;
  /** Date of the earlier human research that cited this page, if any. */
  researchedAt?: string;
  notes?: string;
  tags?: string[];
}

/** A discrete procedural claim the UI may display. */
export interface Fact {
  id: string;
  statement: LText;
  status: VerificationStatus;
  sourceIds: string[];
  /** ISO date this build re-checked it against the source, if it did. */
  checkedAt?: string;
  /** Known conflicts / caveats, shown in the source drawer and the review queue. */
  conflict?: string;
  note?: string;
  /**
   * 'caveat' = the statement itself says something is unknown/conflicting
   * (e.g. "the counter floor is not published"). Caveats are always displayed but
   * do not downgrade the badge of the step that carries them.
   */
  kind?: 'claim' | 'caveat';
}

export interface Phone {
  label: LText;
  number: string; // display form, e.g. 408-808-6611
  tty?: boolean;
}

export interface Place {
  id: string;
  name: LText;
  kind: 'court' | 'probation' | 'legal_help' | 'prosecutor' | 'federal_court' | 'federal_defender';
  streetAddress: string;
  mailingAddress?: string;
  phones: Phone[];
  emails?: string[];
  hoursFactId?: string;
  /** Things deliberately NOT known. Rendered as explicit "not published / call first" notes. */
  unknowns: LText[];
  notes?: LText[];
  sourceIds: string[];
  status: VerificationStatus;
}

// ---------------------------------------------------------------------------
// Outcomes
// ---------------------------------------------------------------------------

export type OutcomeCategory =
  | 'find_case'
  | 'request_copies'
  | 'statewide_record'
  | 'federal_record'
  | 'review_relief'
  | 'legal_help'
  | 'other_jurisdiction';

/** Label about the strength of the ROUTE evidence — never about legal eligibility. */
export type RouteStatus =
  | 'route_identified'
  | 'avenue_to_explore'
  | 'more_info_needed'
  | 'legal_review_recommended'
  | 'outside_jurisdiction';

export type StepMethod = 'online' | 'mail' | 'phone' | 'in_person' | 'information';

/** Machine-readable tags used by safety tests (e.g. no 'fbi_record' for a simple SC case). */
export type ActionTag =
  | 'index_search'
  | 'clerk_search'
  | 'court_copies'
  | 'certified_copies'
  | 'photo_copies'
  | 'doj_record_review'
  | 'doj_fee_waiver'
  | 'fbi_record'
  | 'form_cr180'
  | 'form_cr181'
  | 'form_mc031'
  | 'form_cr409'
  | 'form_cr410'
  | 'probation_application'
  | 'public_defender'
  | 'legal_help'
  | 'immigration_counsel'
  | 'juvenile_court'
  | 'federal_court'
  | 'other_state_court'
  | 'other_county_court'
  | 'early_termination_info'
  | 'automatic_relief_check';

export interface StepDef {
  id: string;
  title: LText;
  instruction: LText;
  method: StepMethod;
  /** Info the person should have ready FOR THE OFFICIAL SITE/OFFICE — never entered here. */
  requiredInformation?: LText[];
  officialResources: string[];
  costs?: LText;
  factIds?: string[];
  accessibilityAlternative?: LText;
  contingency?: LText;
  tags?: ActionTag[];
  /** Optional steps render as "Option", not as a required action. */
  optional?: boolean;
  /** Demote to an option when this holds (e.g. in-person steps for someone who can't travel). */
  optionalWhen?: Condition;
  /** Include the step only when this holds (evaluated in the card's case scope). */
  when?: Condition;
}

export interface ConditionalText {
  text: LText;
  when?: Condition;
  factIds?: string[];
}

export interface OutcomeDef {
  id: string;
  category: OutcomeCategory;
  status: RouteStatus;
  shortTitle: LText;
  summary: LText;
  steps: StepDef[];
  documentsToLookFor?: ConditionalText[];
  uncertainties?: ConditionalText[];
  /** "What if this doesn't work?" */
  fallbacks?: ConditionalText[];
  optionalRoutes?: ConditionalText[];
  legalHelpReferralIds: string[];
  /** 'filing_courthouse' = resolved from the case's courthouse/area answers. */
  places?: Array<string | 'filing_courthouse'>;
  /** Safe, non-identifying questions a person could ask a court clerk. */
  clerkQuestions?: LText[];
}

// ---------------------------------------------------------------------------
// Rules and plans
// ---------------------------------------------------------------------------

export interface Rule {
  id: string;
  scope: 'global' | 'case';
  when: Condition;
  emit: string; // OutcomeDef id
  /** Higher = more likely to be the leading "first action". */
  priority: number;
  /** Plain-language reason, shown in "Why you are seeing this". */
  explain: LText;
  alerts?: AlertId[];
}

export type AlertId = 'immigration' | 'active_matter' | 'warrant' | 'juvenile_mixed' | 'third_party' | 'sc_filing_unclear';

export interface TraceEntry {
  kind: 'answer' | 'default' | 'rule' | 'fallback';
  key: string;
  value?: string;
  text: string;
}

export interface CaseInstance {
  key: string; // '1', '2' or 'all'
  label: LText;
}

export interface ResolvedStep extends Omit<StepDef, 'when'> {
  verificationStatus: VerificationStatus;
  /** True when the step cites no source: it is a practical UX convention, not a sourced claim. */
  isConvention: boolean;
}

export interface ResolvedPlace extends Place {
  /** How confident the routing is that this is the right place. */
  match: 'user_identified' | 'suggested_by_area' | 'one_of_several' | 'fixed';
  matchNote?: LText;
}

/** A rendered outcome card: the shape required by master prompt §8. */
export interface OutcomeCard {
  id: string;
  instanceId: string; // unique per card, e.g. SC_INDEX_LOOKUP#2
  caseKey?: string;
  caseLabel?: LText;
  category: OutcomeCategory;
  status: RouteStatus;
  shortTitle: LText;
  summaryPlainLanguage: LText;
  whyThisPath: LText[];
  steps: ResolvedStep[];
  optionalRoutes: LText[];
  documentsToLookFor: LText[];
  uncertainties: LText[];
  fallbacks: LText[];
  legalHelpReferralIds: string[];
  places: ResolvedPlace[];
  clerkQuestions: LText[];
  nextActionsChecklist: LText[];
  ruleTrace: string[];
  ruleIds: string[];
  priority: number;
  legalNotice: LText;
  actionTags: ActionTag[];
  /** Tags of non-optional steps only. */
  requiredActionTags: ActionTag[];
  sourceIds: string[];
}

export interface Plan {
  primary: OutcomeCard;
  cards: OutcomeCard[]; // primary first
  alerts: AlertId[];
  trace: TraceEntry[];
  cases: CaseInstance[];
  /** Always 'informational'. Exists so tests can assert no legal verdict type ever appears. */
  classification: 'informational';
}

export interface QuestionInstance {
  key: string; // answer key
  node: QuestionNode;
  caseKey?: string;
}
