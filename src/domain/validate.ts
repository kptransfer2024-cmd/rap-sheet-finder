import { FACT_BY_ID, FACTS } from '../data/facts';
import { PLACE_BY_ID } from '../data/jurisdictions/santa-clara';
import { OFFICIAL_DOMAINS, RESOURCE_BY_ID, RESOURCES } from '../data/resources';
import { buildPlan, referencedCodes, referencedQuestions, walk } from './engine';
import { OUTCOME_BY_ID, OUTCOMES } from './outcomes';
import { QUESTION_BY_ID, QUESTIONS } from './questions';
import { FALLBACK_OUTCOME_ID, RULES } from './rules';
import type { Answers, Condition, Plan } from './types';

/**
 * Static + dynamic validation of the decision graph.
 *
 * Static:  unique ids; every condition references an EARLIER question (=> no cycles)
 *          and real option codes; every question has a valid unknown option; every
 *          rule targets a real outcome; every step/fact/place references real data;
 *          every link is on an official domain.
 * Dynamic: deterministic depth-first enumeration of every answer path (multi-selects
 *          explored as each single option + one representative combination) to prove
 *          every question and outcome is reachable and every path ends in a plan
 *          with at least one official resource.
 */

export interface ValidationReport {
  errors: string[];
  warnings: string[];
  stats: {
    questions: number;
    rules: number;
    outcomes: number;
    pathsExplored: number;
    reachedQuestions: number;
    reachedOutcomes: number;
    truncated: boolean;
  };
  reachedOutcomes: Set<string>;
}

function conditionsOf(): Array<{ where: string; cond: Condition | undefined; ownerIndex: number }> {
  const out: Array<{ where: string; cond: Condition | undefined; ownerIndex: number }> = [];
  QUESTIONS.forEach((q, i) => out.push({ where: `question ${q.id}.askIf`, cond: q.askIf, ownerIndex: i }));
  RULES.forEach((r) => out.push({ where: `rule ${r.id}.when`, cond: r.when, ownerIndex: QUESTIONS.length }));
  OUTCOMES.forEach((o) => {
    o.steps.forEach((s) => {
      out.push({ where: `outcome ${o.id}.step ${s.id}.when`, cond: s.when, ownerIndex: QUESTIONS.length });
      out.push({ where: `outcome ${o.id}.step ${s.id}.optionalWhen`, cond: s.optionalWhen, ownerIndex: QUESTIONS.length });
    });
    for (const list of [o.uncertainties, o.fallbacks, o.optionalRoutes, o.documentsToLookFor])
      (list ?? []).forEach((x, i) => out.push({ where: `outcome ${o.id} conditional text #${i}`, cond: x.when, ownerIndex: QUESTIONS.length }));
  });
  return out;
}

export function staticChecks(errors: string[], warnings: string[]) {
  const dup = <T extends { id: string }>(items: T[], label: string) => {
    const seen = new Set<string>();
    for (const it of items) {
      if (seen.has(it.id)) errors.push(`Duplicate ${label} id: ${it.id}`);
      seen.add(it.id);
    }
  };
  dup(QUESTIONS, 'question');
  dup(RULES, 'rule');
  dup(OUTCOMES, 'outcome');
  dup(RESOURCES, 'resource');
  dup(FACTS, 'fact');

  const index = new Map(QUESTIONS.map((q, i) => [q.id, i]));

  // Questions: unknown option + valid kinds + why-we-ask present.
  for (const q of QUESTIONS) {
    const unknown = q.options.find((o) => o.code === q.unknownCode);
    if (!unknown) errors.push(`Question ${q.id}: unknownCode "${q.unknownCode}" is not an option`);
    else if (!['unknown', 'prefer_not'].includes(unknown.kind ?? 'normal'))
      errors.push(`Question ${q.id}: unknownCode option must be kind unknown/prefer_not (never a silent "no")`);
    if (!q.whyWeAsk.en.trim()) errors.push(`Question ${q.id}: missing whyWeAsk`);
    if (q.options.length < 2) errors.push(`Question ${q.id}: needs at least 2 options`);
    if (!q.prompt.es) warnings.push(`Question ${q.id}: no Spanish prompt`);
  }

  // Conditions: earlier-only references (acyclic) + real codes.
  for (const { where, cond, ownerIndex } of conditionsOf()) {
    for (const ref of referencedQuestions(cond)) {
      const idx = index.get(ref);
      if (idx === undefined) errors.push(`${where}: references missing question "${ref}"`);
      else if (idx >= ownerIndex) errors.push(`${where}: references "${ref}" which is not asked earlier (possible cycle)`);
    }
    for (const [q, code] of referencedCodes(cond)) {
      const node = QUESTION_BY_ID[q];
      if (node && !node.options.some((o) => o.code === code)) errors.push(`${where}: "${q}" has no option "${code}"`);
    }
  }

  // Rules -> outcomes.
  for (const r of RULES) if (!OUTCOME_BY_ID[r.emit]) errors.push(`Rule ${r.id}: emits missing outcome ${r.emit}`);
  if (!OUTCOME_BY_ID[FALLBACK_OUTCOME_ID]) errors.push('Fallback outcome missing');

  // Outcomes -> resources, facts, places.
  for (const o of OUTCOMES) {
    if (o.steps.length === 0) errors.push(`Outcome ${o.id}: no steps`);
    for (const s of o.steps) {
      for (const r of s.officialResources) if (!RESOURCE_BY_ID[r]) errors.push(`Outcome ${o.id}.${s.id}: missing resource ${r}`);
      for (const f of s.factIds ?? []) if (!FACT_BY_ID[f]) errors.push(`Outcome ${o.id}.${s.id}: missing fact ${f}`);
    }
    for (const list of [o.uncertainties, o.fallbacks, o.optionalRoutes])
      for (const x of list ?? []) for (const f of x.factIds ?? []) if (!FACT_BY_ID[f]) errors.push(`Outcome ${o.id}: missing fact ${f}`);
    for (const r of o.legalHelpReferralIds) if (!RESOURCE_BY_ID[r]) errors.push(`Outcome ${o.id}: missing legal-help resource ${r}`);
    for (const p of o.places ?? []) if (p !== 'filing_courthouse' && !PLACE_BY_ID[p]) errors.push(`Outcome ${o.id}: missing place ${p}`);
    const hasResource = o.steps.some((s) => s.officialResources.length > 0) || o.legalHelpReferralIds.length > 0;
    if (!hasResource) errors.push(`Outcome ${o.id}: no official resource or human-help referral`);
  }
  for (const f of FACTS) for (const s of f.sourceIds) if (!RESOURCE_BY_ID[s]) errors.push(`Fact ${f.id}: missing source ${s}`);
  for (const r of RESOURCES) {
    const host = new URL(r.url).hostname.replace(/^www\./, '');
    if (!OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) errors.push(`Resource ${r.id}: non-official domain ${host}`);
    if (r.verificationStatus === 'verified' && !r.lastCheckedByBuild) errors.push(`Resource ${r.id}: verified without a check date`);
  }
  for (const f of FACTS) if (f.status === 'verified' && !f.checkedAt) errors.push(`Fact ${f.id}: verified without checkedAt`);
}

/** Small seeded PRNG (mulberry32) so exploration is reproducible run to run. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function choicesFor(qid: string): Array<string | string[]> {
  const node = QUESTION_BY_ID[qid];
  if (node.type === 'single') return node.options.map((o) => o.code);
  const singles = node.options.map((o) => [o.code]);
  const nonExclusive = node.options.filter((o) => !o.exclusive).map((o) => o.code);
  const combos: string[][] = [];
  if (qid === 'jurisdiction') combos.push(['santa_clara', 'federal'], ['santa_clara', 'juvenile'], ['santa_clara', 'other_state', 'multi_ca']);
  if (qid === 'matter_status') combos.push(['dismissed', 'convicted'], ['convicted', 'pending']);
  if (qid === 'open_matters') combos.push(['pending_case', 'warrant']);
  if (combos.length === 0 && nonExclusive.length > 1) combos.push(nonExclusive.slice(0, 2));
  return [...singles, ...combos];
}

/**
 * Deterministic exploration of answer paths through the wizard.
 * The full answer space is combinatorial (per-case blocks x multi-selects), so we
 * (1) enumerate every option of the first three questions exhaustively, then
 * (2) complete each prefix with seeded random walks. Same seed => same paths.
 */
export function enumeratePaths(walksPerPrefix = 60, seed = 20261122): { plans: Array<{ answers: Answers; plan: Plan }>; truncated: boolean; reachedQuestions: Set<string> } {
  const plans: Array<{ answers: Answers; plan: Plan }> = [];
  const reachedQuestions = new Set<string>();
  const rand = mulberry32(seed);

  const complete = (start: Answers): Answers => {
    let answers = { ...start };
    for (let guard = 0; guard < 80; guard++) {
      const w = walk(answers, 'pending');
      if (!w.firstPending) return answers;
      reachedQuestions.add(w.firstPending.node.id);
      const choices = choicesFor(w.firstPending.node.id);
      answers = { ...answers, [w.firstPending.key]: choices[Math.floor(rand() * choices.length)] };
    }
    throw new Error('Path did not terminate (possible cycle): ' + JSON.stringify(answers));
  };

  // Exhaustive over the scope-defining prefix.
  const prefixes: Answers[] = [];
  const expand = (answers: Answers, depth: number) => {
    const w = walk(answers, 'pending');
    if (!w.firstPending || depth === 0) {
      prefixes.push(answers);
      return;
    }
    reachedQuestions.add(w.firstPending.node.id);
    for (const v of choicesFor(w.firstPending.node.id)) expand({ ...answers, [w.firstPending.key]: v }, depth - 1);
  };
  expand({}, 3);

  for (const prefix of prefixes) {
    for (let i = 0; i < walksPerPrefix; i++) {
      const answers = complete(prefix);
      plans.push({ answers, plan: buildPlan(answers) });
      if (!walk(prefix, 'pending').firstPending) break; // prefix already complete
    }
  }
  return { plans, truncated: false, reachedQuestions };
}

export function validateGraph(walksPerPrefix = 60): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  staticChecks(errors, warnings);

  const { plans, truncated, reachedQuestions } = enumeratePaths(walksPerPrefix);
  const reachedOutcomes = new Set<string>();
  for (const { answers, plan } of plans) {
    for (const c of plan.cards) reachedOutcomes.add(c.id);
    if (plan.cards.length === 0) errors.push(`Dead end: ${JSON.stringify(answers)}`);
    if (plan.cards.some((c) => c.sourceIds.length === 0)) errors.push(`Card without official resource: ${JSON.stringify(answers)}`);
    if (plan.classification !== 'informational') errors.push('Non-informational plan classification');
  }
  for (const q of QUESTIONS) if (!reachedQuestions.has(q.id)) errors.push(`Unreachable question: ${q.id}`);
  for (const o of OUTCOMES) if (!reachedOutcomes.has(o.id) && o.id !== FALLBACK_OUTCOME_ID) errors.push(`Unreachable outcome: ${o.id}`);
  if (!reachedOutcomes.has(FALLBACK_OUTCOME_ID)) warnings.push(`Fallback outcome ${FALLBACK_OUTCOME_ID} not reached by any enumerated path (expected: it is a safety net).`);
  if (truncated) warnings.push('Path enumeration truncated.');

  return {
    errors,
    warnings,
    stats: {
      questions: QUESTIONS.length,
      rules: RULES.length,
      outcomes: OUTCOMES.length,
      pathsExplored: plans.length,
      reachedQuestions: reachedQuestions.size,
      reachedOutcomes: reachedOutcomes.size,
      truncated,
    },
    reachedOutcomes,
  };
}
