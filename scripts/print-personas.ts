/* Prints each persona's plan card ids (for docs/demo_scenarios.md). Usage: npx tsx scripts/print-personas.ts */
import { PERSONAS } from '../src/data/personas';
import { buildPlan } from '../src/domain/engine';
for (const p of PERSONAS) {
  const plan = buildPlan(p.answers);
  console.log(p.id, plan.cards.map((c) => c.instanceId).join(', '), '| alerts:', plan.alerts.join(','));
}
