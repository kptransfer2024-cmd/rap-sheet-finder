import { buildPlan } from '../../src/domain/engine';
import type { ActionTag, Answers, OutcomeCard, Plan } from '../../src/domain/types';

export const plan = (a: Answers): Plan => buildPlan(a);
export const ids = (p: Plan) => p.cards.map((c) => c.id);
export const card = (p: Plan, id: string): OutcomeCard => {
  const c = p.cards.find((x) => x.id === id);
  if (!c) throw new Error(`Expected card ${id}; got ${ids(p).join(', ')}`);
  return c;
};
export const allTags = (p: Plan): ActionTag[] => p.cards.flatMap((c) => c.actionTags);
export const requiredTags = (p: Plan): ActionTag[] => p.cards.flatMap((c) => c.requiredActionTags);
export const stepIds = (c: OutcomeCard) => c.steps.map((s) => s.id);

/** All English text a plan would render. */
export function planText(p: Plan): string {
  return p.cards
    .flatMap((c) => [
      c.shortTitle.en,
      c.summaryPlainLanguage.en,
      ...c.whyThisPath.map((x) => x.en),
      ...c.steps.flatMap((s) => [s.title.en, s.instruction.en, s.costs?.en ?? '', s.accessibilityAlternative?.en ?? '', s.contingency?.en ?? '']),
      ...c.uncertainties.map((x) => x.en),
      ...c.fallbacks.map((x) => x.en),
      ...c.optionalRoutes.map((x) => x.en),
    ])
    .join('\n');
}

export const SC_BASE: Answers = { whose_record: 'own', jurisdiction: ['santa_clara'], case_count: 'one' };
