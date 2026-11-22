import { FACT_BY_ID } from '../data/facts';
import type { Locale, ResolvedStep } from '../domain/types';
import { METHOD_LABEL, tr, ui } from '../i18n/strings';
import { OfficialLink } from './OfficialLink';
import { VerificationBadge } from './VerificationBadge';

/** Numbered steps on the route line. Optional steps use a dashed stop and an "Option" label. */
export function StepChecklist({ steps, locale, idPrefix }: { steps: ResolvedStep[]; locale: Locale; idPrefix: string }) {
  let n = 0;
  return (
    <ol className="route steps mt-5">
      {steps.map((s) => {
        n += 1;
        const facts = (s.factIds ?? []).map((f) => FACT_BY_ID[f]).filter(Boolean);
        const flagged = facts.filter((f) => f.status !== 'verified');
        return (
          <li key={s.id} className={`done ${s.optional ? 'is-optional' : ''}`} data-step={s.id} data-optional={s.optional ? 'true' : 'false'}>
            <span className="stop" aria-hidden="true">
              {n}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="m-0 text-[1.15rem] leading-snug font-bold" id={`${idPrefix}-${s.id}`}>
                <span className="sr-only">{n}. </span>
                {s.optional && <span className="mr-1 text-[var(--color-teal)]">{ui('option', locale)}:</span>}
                {tr(s.title, locale)}
              </h4>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="chip chip-method">{tr(METHOD_LABEL[s.method], locale)}</span>
              {s.isConvention ? (
                <span className="chip chip-method" data-status="convention">
                  {ui('practicalTip', locale)}
                </span>
              ) : (
                <VerificationBadge status={s.verificationStatus} locale={locale} />
              )}
            </div>
            <p className="mb-0 mt-2">{tr(s.instruction, locale)}</p>

            {s.requiredInformation && s.requiredInformation.length > 0 && (
              <div className="mt-3 rounded-lg border border-dashed border-[var(--color-line)] px-3 py-2">
                <p className="m-0 text-sm font-bold">{ui('haveReady', locale)}</p>
                <ul className="m-0 mt-1 pl-5 text-[0.97rem]">
                  {s.requiredInformation.map((r, i) => (
                    <li key={i}>{tr(r, locale)}</li>
                  ))}
                </ul>
              </div>
            )}
            {s.costs && (
              <p className="m-0 mt-2 text-[0.97rem]">
                <strong>{ui('costs', locale)}:</strong> {tr(s.costs, locale)}
              </p>
            )}
            {s.accessibilityAlternative && (
              <p className="m-0 mt-2 text-[0.97rem]">
                <strong>{ui('accessAlt', locale)}:</strong> {tr(s.accessibilityAlternative, locale)}
              </p>
            )}
            {s.contingency && (
              <p className="m-0 mt-2 text-[0.97rem]">
                <strong>{ui('ifProblem', locale)}:</strong> {tr(s.contingency, locale)}
              </p>
            )}
            {flagged.length > 0 && (
              <ul className="m-0 mt-2 list-none p-0 text-sm">
                {flagged.map((f) => (
                  <li key={f.id} className="mt-1 flex flex-wrap items-start gap-2" data-fact={f.id}>
                    <VerificationBadge status={f.status} locale={locale} />
                    <span className="flex-1 basis-60">{tr(f.statement, locale)}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.officialResources.length > 0 && (
              <ul className="m-0 mt-3 grid list-none gap-1.5 p-0">
                {s.officialResources.map((r) => (
                  <li key={r}>
                    <OfficialLink id={r} locale={locale} showStatus={false} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
