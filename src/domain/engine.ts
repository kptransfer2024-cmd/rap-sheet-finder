import { FACT_BY_ID } from '../data/facts';
import { PLACE_BY_ID, SANTA_CLARA, SC_COURTHOUSE_IDS } from '../data/jurisdictions/santa-clara';
import { RESOURCE_BY_ID } from '../data/resources';
import { LEGAL_NOTICE, OUTCOME_BY_ID } from './outcomes';
import { QUESTIONS, QUESTION_BY_ID } from './questions';
import { ALERT_RULES, FALLBACK_OUTCOME_ID, FALLBACK_RULE_ID, RULES } from './rules';
import type {
  ActionTag,
  AlertId,
  AnswerValue,
  Answers,
  CaseInstance,
  Condition,
  LText,
  OutcomeCard,
  OutcomeDef,
  Plan,
  QuestionInstance,
  QuestionNode,
  ResolvedPlace,
  ResolvedStep,
  Rule,
  TraceEntry,
  VerificationStatus,
} from './types';

/**
 * Deterministic rule engine. Pure functions only: same answers -> same plan.
 * No randomness, no network, no LLM.
 */

// ============================================================================ helpers

export function toArray(v: AnswerValue | undefined): string[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

export function caseKeyOf(answerKey: string): string | undefined {
  const at = answerKey.indexOf('@');
  return at === -1 ? undefined : answerKey.slice(at + 1);
}

export function questionIdOf(answerKey: string): string {
  const at = answerKey.indexOf('@');
  return at === -1 ? answerKey : answerKey.slice(0, at);
}

export function answerKey(questionId: string, caseKey?: string): string {
  return caseKey ? `${questionId}@${caseKey}` : questionId;
}

const STATUS_RANK: Record<VerificationStatus, number> = { verified: 2, partial: 1, needs_review: 0 };
export function weakestStatus(statuses: VerificationStatus[]): VerificationStatus {
  if (statuses.length === 0) return 'partial'; // a claim with no source is never "verified"
  return statuses.reduce((a, b) => (STATUS_RANK[b] < STATUS_RANK[a] ? b : a));
}

// ============================================================================ conditions

interface EvalCtx {
  eff: Answers;
  caseKey?: string;
}

function valuesFor(q: string, scoped: boolean | undefined, ctx: EvalCtx): string[] {
  const node = QUESTION_BY_ID[q];
  if (node && node.scope === 'case') {
    if (scoped && ctx.caseKey) return toArray(ctx.eff[answerKey(q, ctx.caseKey)]);
    // Unscoped reference to a per-case question = "any case".
    const out: string[] = [];
    for (const [k, v] of Object.entries(ctx.eff)) if (questionIdOf(k) === q) out.push(...toArray(v));
    return out;
  }
  return toArray(ctx.eff[q]);
}

export function evaluate(cond: Condition | undefined, ctx: EvalCtx): boolean {
  if (!cond) return true;
  if ('always' in cond) return true;
  if ('all' in cond) return cond.all.every((c) => evaluate(c, ctx));
  if ('any' in cond) return cond.any.some((c) => evaluate(c, ctx));
  if ('not' in cond) return !evaluate(cond.not, ctx);
  const vals = valuesFor(cond.q, cond.scope === 'case', ctx);
  if ('answered' in cond) return (vals.length > 0) === cond.answered;
  if ('only' in cond) return vals.length > 0 && vals.every((v) => cond.only.includes(v));
  return vals.some((v) => cond.in.includes(v));
}

/** Every question id a condition reads (used for traces, validation and docs). */
export function referencedQuestions(cond: Condition | undefined, acc: Set<string> = new Set()): Set<string> {
  if (!cond || 'always' in cond) return acc;
  if ('all' in cond) cond.all.forEach((c) => referencedQuestions(c, acc));
  else if ('any' in cond) cond.any.forEach((c) => referencedQuestions(c, acc));
  else if ('not' in cond) referencedQuestions(cond.not, acc);
  else acc.add(cond.q);
  return acc;
}

/** Every option code a condition compares against, per question. */
export function referencedCodes(cond: Condition | undefined, acc: Array<[string, string]> = []): Array<[string, string]> {
  if (!cond || 'always' in cond) return acc;
  if ('all' in cond) cond.all.forEach((c) => referencedCodes(c, acc));
  else if ('any' in cond) cond.any.forEach((c) => referencedCodes(c, acc));
  else if ('not' in cond) referencedCodes(cond.not, acc);
  else if ('in' in cond) cond.in.forEach((code) => acc.push([cond.q, code]));
  else if ('only' in cond) cond.only.forEach((code) => acc.push([cond.q, code]));
  return acc;
}

// ============================================================================ answers

export function isValidAnswer(node: QuestionNode, value: AnswerValue | undefined): boolean {
  if (value === undefined) return false;
  const codes = new Set(node.options.map((o) => o.code));
  if (node.type === 'single') return typeof value === 'string' && codes.has(value);
  if (!Array.isArray(value) || value.length === 0) return false;
  if (!value.every((v) => codes.has(v))) return false;
  const exclusive = value.filter((v) => node.options.find((o) => o.code === v)?.exclusive);
  return exclusive.length === 0 || value.length === 1;
}

/** Toggle a multi-select option, respecting exclusive options. */
export function toggleMulti(node: QuestionNode, current: string[], code: string): string[] {
  const opt = node.options.find((o) => o.code === code);
  if (!opt) return current;
  if (current.includes(code)) return current.filter((c) => c !== code);
  if (opt.exclusive) return [code];
  const withoutExclusive = current.filter((c) => !node.options.find((o) => o.code === c)?.exclusive);
  // keep registry order for stable traces
  const next = new Set([...withoutExclusive, code]);
  return node.options.map((o) => o.code).filter((c) => next.has(c));
}

// ============================================================================ cases

export function caseInstances(eff: Answers): CaseInstance[] {
  const sc = toArray(eff.jurisdiction).some((j) => j === 'santa_clara' || j === 'sc_incident_only');
  if (!sc) return [];
  const count = eff.case_count;
  if (count === 'one') return [{ key: '1', label: { en: 'Your Santa Clara case', es: 'Su caso de Santa Clara' } }];
  if (count === 'two')
    return [
      { key: '1', label: { en: 'Santa Clara case 1', es: 'Caso 1 de Santa Clara' } },
      { key: '2', label: { en: 'Santa Clara case 2', es: 'Caso 2 de Santa Clara' } },
    ];
  return [
    {
      key: 'all',
      label: { en: 'Your Santa Clara cases (answer for most of them)', es: 'Sus casos de Santa Clara (en general)' },
    },
  ];
}

// ============================================================================ walk

export interface WalkResult {
  /** Every question instance with whether it applies right now. */
  instances: Array<QuestionInstance & { applicable: boolean; answered: boolean; defaulted: boolean }>;
  /** Effective answers (with unknown-defaults in 'fill' mode). */
  effective: Answers;
  /** First applicable unanswered question, in order. */
  firstPending?: QuestionInstance;
  cases: CaseInstance[];
}

/**
 * Walk the ordered registry.
 *  - mode 'pending': unanswered applicable questions stay empty (used by the wizard).
 *  - mode 'fill':    unanswered applicable questions take their `unknownCode`
 *                    (used for "show my plan now" and plan building). Never "no".
 */
export function walk(answers: Answers, mode: 'pending' | 'fill'): WalkResult {
  const effective: Answers = {};
  const instances: WalkResult['instances'] = [];
  let firstPending: QuestionInstance | undefined;

  const process = (node: QuestionNode, caseKey?: string) => {
    const key = answerKey(node.id, caseKey);
    const applicable = evaluate(node.askIf, { eff: effective, caseKey });
    const raw = answers[key];
    const answered = applicable && isValidAnswer(node, raw);
    let defaulted = false;
    if (applicable) {
      if (answered) effective[key] = raw;
      else {
        if (!firstPending) firstPending = { key, node, caseKey };
        if (mode === 'fill') {
          effective[key] = node.type === 'multi' ? [node.unknownCode] : node.unknownCode;
          defaulted = true;
        }
      }
    }
    instances.push({ key, node, caseKey, applicable, answered, defaulted });
  };

  let i = 0;
  while (i < QUESTIONS.length) {
    const node = QUESTIONS[i];
    if (node.scope === 'case') {
      const block: QuestionNode[] = [];
      while (i < QUESTIONS.length && QUESTIONS[i].scope === 'case') block.push(QUESTIONS[i++]);
      for (const ck of caseInstances(effective)) for (const b of block) process(b, ck.key);
      continue;
    }
    process(node);
    i++;
  }
  return { instances, effective, firstPending, cases: caseInstances(effective) };
}

/**
 * Remove answers that no longer apply (e.g. after editing an upstream answer).
 * Returns a NEW object; the caller replaces its state. Answers to questions that
 * still apply are kept, so editing doesn't force re-answering everything.
 */
export function pruneAnswers(answers: Answers): Answers {
  let current = { ...answers };
  // Iterate to a fixed point: removing one answer can make another inapplicable.
  for (let guard = 0; guard < 10; guard++) {
    const { instances } = walk(current, 'pending');
    const keep = new Set(instances.filter((x) => x.applicable && x.answered).map((x) => x.key));
    const next: Answers = {};
    for (const [k, v] of Object.entries(current)) if (keep.has(k)) next[k] = v;
    if (Object.keys(next).length === Object.keys(current).length) return next;
    current = next;
  }
  return current;
}

export function setAnswer(answers: Answers, key: string, value: AnswerValue): Answers {
  return pruneAnswers({ ...answers, [key]: value });
}

export function nextQuestion(answers: Answers): QuestionInstance | undefined {
  return walk(answers, 'pending').firstPending;
}

/** Applicable questions answered so far, in asking order (for review / edit lists). */
export function answeredInstances(answers: Answers) {
  return walk(answers, 'pending').instances.filter((x) => x.applicable && x.answered);
}

/** Rough progress: answered / (answered + remaining applicable if the rest were "not sure"). */
export function progressEstimate(answers: Answers): { answered: number; remaining: number; fraction: number } {
  const filled = walk(answers, 'fill');
  const applicable = filled.instances.filter((x) => x.applicable);
  const answered = applicable.filter((x) => x.answered).length;
  const remaining = applicable.length - answered;
  return { answered, remaining, fraction: applicable.length ? answered / applicable.length : 0 };
}

// ============================================================================ outcomes

function resolveSteps(def: OutcomeDef, ctx: EvalCtx): ResolvedStep[] {
  return def.steps
    .filter((s) => evaluate(s.when, ctx))
    .map(({ when: _when, optionalWhen, ...s }) => {
      // Caveat facts (statements that something is unknown) are shown but don't
      // downgrade the step; every other fact and resource does.
      const claimFacts = (s.factIds ?? []).filter((f) => FACT_BY_ID[f]?.kind !== 'caveat');
      const statuses: VerificationStatus[] = [
        ...claimFacts.map((f) => FACT_BY_ID[f]?.status ?? 'needs_review'),
        ...s.officialResources.map((r) => RESOURCE_BY_ID[r]?.verificationStatus ?? 'needs_review'),
      ];
      const isConvention = (s.factIds ?? []).length === 0 && s.officialResources.length === 0;
      // A step with no source at all is a UX convention: never labeled "verified".
      const optional = !!s.optional || (optionalWhen ? evaluate(optionalWhen, ctx) : false);
      return { ...s, optional, verificationStatus: weakestStatus(statuses), isConvention };
    });
}

function filingCourthouses(ctx: EvalCtx): ResolvedPlace[] {
  const map = SANTA_CLARA.courthouseOptionToPlace ?? {};
  const area = SANTA_CLARA.areaToCourthouse ?? {};
  const courthouseVals = valuesFor('sc_courthouse', !!ctx.caseKey, ctx).filter((v) => map[v]);
  if (courthouseVals.length) {
    return [...new Set(courthouseVals)].map((v) => ({
      ...PLACE_BY_ID[map[v]],
      match: 'user_identified' as const,
      matchNote: { en: 'You said this courthouse handled the case.', es: 'Usted dijo que este tribunal manejó el caso.' },
    }));
  }
  const areaVals = valuesFor('sc_area', !!ctx.caseKey, ctx).filter((v) => area[v]);
  if (areaVals.length) {
    return [...new Set(areaVals)].map((v) => ({
      ...PLACE_BY_ID[area[v]],
      match: 'suggested_by_area' as const,
      matchNote: {
        en: 'Likely starting point based on the area you chose — not proof. Felony cases may be at the Hall of Justice. Confirm with the Clerk.',
        es: 'Punto de partida probable según la zona; no es prueba. Confirme con el Secretario.',
      },
    }));
  }
  return SC_COURTHOUSE_IDS.map((id) => ({
    ...PLACE_BY_ID[id],
    match: 'one_of_several' as const,
    matchNote: {
      en: 'We don\'t know which courthouse handled your case. Records are at the courthouse where it was filed — call the Clerk to confirm before going.',
      es: 'No sabemos qué tribunal manejó su caso. Llame al Secretario para confirmar.',
    },
  }));
}

function resolvePlaces(def: OutcomeDef, ctx: EvalCtx): ResolvedPlace[] {
  const out: ResolvedPlace[] = [];
  for (const p of def.places ?? []) {
    if (p === 'filing_courthouse') out.push(...filingCourthouses(ctx));
    else if (PLACE_BY_ID[p]) out.push({ ...PLACE_BY_ID[p], match: 'fixed' });
  }
  const seen = new Set<string>();
  return out.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}

function describeRule(rule: Rule, ctx: EvalCtx): string {
  const parts: string[] = [];
  for (const q of referencedQuestions(rule.when)) {
    const node = QUESTION_BY_ID[q];
    if (node?.scope === 'case' && ctx.caseKey) {
      const v = toArray(ctx.eff[answerKey(q, ctx.caseKey)]);
      if (v.length) parts.push(`${answerKey(q, ctx.caseKey)}=${v.join('|')}`);
    } else {
      const v = valuesFor(q, false, ctx);
      if (v.length) parts.push(`${q}=${v.join('|')}`);
    }
  }
  return `${rule.id}${ctx.caseKey ? ` [case ${ctx.caseKey}]` : ''}: ${parts.join('; ')}`;
}

function buildCard(
  outcomeId: string,
  rules: Rule[],
  ctx: EvalCtx,
  caseLabel?: LText,
): OutcomeCard {
  const def = OUTCOME_BY_ID[outcomeId];
  if (!def) throw new Error(`Rule emitted unknown outcome ${outcomeId}`);
  const steps = resolveSteps(def, ctx);
  const cond = (items: OutcomeDef['uncertainties']) =>
    (items ?? []).filter((x) => evaluate(x.when, ctx)).map((x) => x.text);
  const places = resolvePlaces(def, ctx);
  const actionTags = [...new Set(steps.flatMap((s) => s.tags ?? []))] as ActionTag[];
  const requiredActionTags = [...new Set(steps.filter((s) => !s.optional).flatMap((s) => s.tags ?? []))] as ActionTag[];
  const factSources = steps.flatMap((s) => (s.factIds ?? []).flatMap((f) => FACT_BY_ID[f]?.sourceIds ?? []));
  const sourceIds = [
    ...new Set([
      ...steps.flatMap((s) => s.officialResources),
      ...factSources,
      ...places.flatMap((p) => p.sourceIds),
      ...def.legalHelpReferralIds,
    ]),
  ].filter((id) => RESOURCE_BY_ID[id]);

  return {
    id: def.id,
    instanceId: ctx.caseKey ? `${def.id}#${ctx.caseKey}` : def.id,
    caseKey: ctx.caseKey,
    caseLabel,
    category: def.category,
    status: def.status,
    shortTitle: def.shortTitle,
    summaryPlainLanguage: def.summary,
    whyThisPath: rules.map((r) => r.explain),
    steps,
    optionalRoutes: cond(def.optionalRoutes),
    documentsToLookFor: cond(def.documentsToLookFor),
    uncertainties: cond(def.uncertainties),
    fallbacks: cond(def.fallbacks),
    legalHelpReferralIds: def.legalHelpReferralIds,
    places,
    clerkQuestions: def.clerkQuestions ?? [],
    nextActionsChecklist: steps.filter((s) => !s.optional).map((s) => s.title),
    ruleTrace: rules.map((r) => describeRule(r, ctx)),
    ruleIds: rules.map((r) => r.id),
    priority: Math.max(...rules.map((r) => r.priority)),
    legalNotice: LEGAL_NOTICE,
    actionTags,
    requiredActionTags,
    sourceIds,
  };
}

/** Build the full personalized plan. Unanswered applicable questions count as "not sure". */
export function buildPlan(answers: Answers, rules: Rule[] = RULES): Plan {
  const clean = pruneAnswers(answers);
  const w = walk(clean, 'fill');
  const eff = w.effective;

  const trace: TraceEntry[] = [];
  for (const inst of w.instances) {
    if (!inst.applicable) continue;
    const v = toArray(eff[inst.key]).join('|');
    trace.push(
      inst.defaulted
        ? { kind: 'default', key: inst.key, value: v, text: `${inst.key} not answered → treated as "${v}" (not as "no")` }
        : { kind: 'answer', key: inst.key, value: v, text: `${inst.key} = ${v}` },
    );
  }

  // Evaluate rules. Group by outcome + case.
  const groups = new Map<string, { outcomeId: string; caseKey?: string; caseLabel?: LText; rules: Rule[] }>();
  const alerts = new Set<AlertId>();
  const fire = (rule: Rule, caseKey?: string, caseLabel?: LText) => {
    const gk = `${rule.emit}#${caseKey ?? ''}`;
    if (!groups.has(gk)) groups.set(gk, { outcomeId: rule.emit, caseKey, caseLabel, rules: [] });
    groups.get(gk)!.rules.push(rule);
    rule.alerts?.forEach((a) => alerts.add(a));
    trace.push({ kind: 'rule', key: rule.id, text: describeRule(rule, { eff, caseKey }) });
  };
  for (const rule of rules) {
    if (rule.scope === 'global') {
      if (evaluate(rule.when, { eff })) fire(rule);
    } else {
      for (const ck of w.cases) if (evaluate(rule.when, { eff, caseKey: ck.key })) fire(rule, ck.key, ck.label);
    }
  }
  for (const ar of ALERT_RULES) if (evaluate(ar.when, { eff })) alerts.add(ar.alert);

  if (groups.size === 0) {
    const fallbackRule: Rule = {
      id: FALLBACK_RULE_ID,
      scope: 'global',
      when: { always: true },
      emit: FALLBACK_OUTCOME_ID,
      priority: 1,
      explain: { en: 'No specific route matched your answers, so here are safe starting points.', es: 'Ninguna ruta específica coincidió; aquí hay puntos de partida seguros.' },
    };
    groups.set('fallback', { outcomeId: FALLBACK_OUTCOME_ID, rules: [fallbackRule] });
    trace.push({ kind: 'fallback', key: FALLBACK_RULE_ID, text: `${FALLBACK_RULE_ID}: no rule matched` });
  }

  const caseOrder = (k?: string) => (k === undefined ? 99 : k === 'all' ? 0 : Number(k));
  const cards = [...groups.values()]
    .map((g) => buildCard(g.outcomeId, g.rules, { eff, caseKey: g.caseKey }, g.caseLabel))
    .sort((a, b) => b.priority - a.priority || caseOrder(a.caseKey) - caseOrder(b.caseKey) || a.id.localeCompare(b.id));

  return { primary: cards[0], cards, alerts: [...alerts], trace, cases: w.cases, classification: 'informational' };
}

/** Lightweight preview used by the wizard sidebar while questions are still pending. */
export function previewRoute(answers: Answers): OutcomeCard | undefined {
  if (!answers.goal && !answers.whose_record) return undefined;
  if (!answers.jurisdiction && answers.whose_record !== 'someone_else') return undefined;
  return buildPlan(answers).primary;
}
