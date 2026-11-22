import { ChevronRight, Library } from 'lucide-react';
import { RESOURCE_BY_ID } from '../data/resources';
import type { Locale, Plan } from '../domain/types';
import { factsInPlan } from '../lib/export';
import { tr, ui } from '../i18n/strings';
import { OfficialLink } from './OfficialLink';
import { VerificationBadge } from './VerificationBadge';

/** Every source and procedural fact this plan relies on, with honest status. */
export function SourceDrawer({ plan, locale }: { plan: Plan; locale: Locale }) {
  const sourceIds = [...new Set(plan.cards.flatMap((c) => c.sourceIds))].filter((id) => RESOURCE_BY_ID[id]);
  const facts = factsInPlan(plan);
  return (
    <details className="disclose card print-open px-5 py-2" id="sources">
      <summary>
        <Library aria-hidden="true" size={18} /> {ui('sources', locale)} ({sourceIds.length})
        <ChevronRight aria-hidden="true" size={18} className="chev ml-auto" />
      </summary>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{ui('sourcesLead', locale)}</p>
      <ul className="m-0 grid list-none gap-3 p-0">
        {sourceIds.map((id) => {
          const r = RESOURCE_BY_ID[id];
          return (
            <li key={id} className="border-b border-dashed border-[var(--color-line)] pb-3" data-source={id}>
              <OfficialLink id={id} locale={locale} />
              <p className="m-0 mt-1 text-sm text-[var(--color-ink-soft)]">
                {r.owner}
                {r.researchedAt ? ` · research ${r.researchedAt}` : ''}
                {r.notes ? ` · ${r.notes}` : ''}
              </p>
            </li>
          );
        })}
      </ul>
      <h3 className="mb-2 mt-6 text-xl">{ui('factsUsed', locale)}</h3>
      <ul className="m-0 grid list-none gap-3 p-0 pb-3">
        {facts.map((f) => (
          <li key={f.id} className="text-[0.95rem]" data-fact={f.id}>
            <VerificationBadge status={f.status} locale={locale} date={f.checkedAt} /> <span>{tr(f.statement, locale)}</span>
            {f.conflict && <p className="m-0 mt-1 text-sm text-[var(--color-brick)]">⚠ {ui('sourceConflict', locale)}: {f.conflict}</p>}
          </li>
        ))}
      </ul>
    </details>
  );
}
