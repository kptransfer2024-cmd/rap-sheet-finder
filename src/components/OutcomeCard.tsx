import { ChevronRight, CircleHelp, FileSearch, LifeBuoy, MessageSquareText } from 'lucide-react';
import type { Locale, OutcomeCard as Card } from '../domain/types';
import { STATUS_LABEL, isFallback, tr, ui } from '../i18n/strings';
import { LocationCard } from './LocationCard';
import { OfficialLink } from './OfficialLink';
import { StepChecklist } from './StepChecklist';

function Section({ title, icon, children, open = false }: { title: string; icon?: React.ReactNode; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="disclose print-open mt-3 border-t border-[var(--color-line)] pt-1" open={open}>
      <summary>
        {icon}
        {title}
        <ChevronRight aria-hidden="true" size={18} className="chev ml-auto" />
      </summary>
      <div className="pb-2">{children}</div>
    </details>
  );
}

export function OutcomeCard({ card, locale, primary = false }: { card: Card; locale: Locale; primary?: boolean }) {
  const hid = `card-${card.instanceId.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const stepsInEnglish = locale === 'es' && card.steps.some((s) => isFallback(s.instruction, locale));
  return (
    <article
      className={`card ${primary ? 'border-2 border-[var(--color-teal)] p-5 sm:p-8' : 'p-5 sm:p-6'}`}
      aria-labelledby={hid}
      data-outcome={card.id}
      data-primary={primary ? 'true' : 'false'}
    >
      <div className="flex flex-wrap items-center gap-2">
        {primary && <span className="chip chip-partial !border-[var(--color-marigold)] !bg-[var(--color-marigold)] !text-white">★ {ui('startHere', locale)}</span>}
        <span className="status-pill" data-status={card.status}>
          {tr(STATUS_LABEL[card.status], locale)}
        </span>
        {card.caseLabel && (
          <span className="chip chip-method">
            {ui('forCase', locale)}: {tr(card.caseLabel, locale)}
          </span>
        )}
      </div>
      <h3 id={hid} className={`mb-0 mt-3 leading-tight font-semibold ${primary ? 'text-[1.9rem] sm:text-[2.3rem]' : 'text-2xl'}`}>
        {tr(card.shortTitle, locale)}
      </h3>
      <p className={`mb-0 mt-3 ${primary ? 'text-[1.1rem]' : ''}`}>{tr(card.summaryPlainLanguage, locale)}</p>

      <div className="mt-4 rounded-xl bg-[var(--color-teal-wash)] px-4 py-3">
        <p className="m-0 flex items-center gap-2 text-sm font-bold">
          <CircleHelp aria-hidden="true" size={16} /> {ui('whyThis', locale)}
        </p>
        <ul className="m-0 mt-1 pl-5 text-[0.97rem]">
          {card.whyThisPath.map((w, i) => (
            <li key={i}>{tr(w, locale)}</li>
          ))}
        </ul>
      </div>

      {stepsInEnglish && <p className="m-0 mt-3 text-sm italic">{ui('spanishStepsNote', locale)}</p>}
      <StepChecklist steps={card.steps} locale={locale} idPrefix={hid} />

      {card.places.length > 0 && (
        <Section title={ui('whereToGo', locale)} open={primary && card.places.every((p) => p.match !== 'one_of_several')}>
          {card.places.length > 1 && card.places.every((p) => p.match === 'one_of_several') && card.places[0].matchNote && (
            <p className="m-0 mb-3 rounded-md bg-[var(--color-marigold-wash)] px-3 py-2 text-sm text-[var(--color-marigold-ink)]">
              {tr(card.places[0].matchNote, locale)}
            </p>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {card.places.map((p) => (
              <LocationCard key={p.id} place={p} locale={locale} hideMatchNote={card.places.length > 1 && p.match === 'one_of_several'} />
            ))}
          </div>
        </Section>
      )}

      {card.documentsToLookFor.length > 0 && (
        <Section title={ui('documentsToLookFor', locale)} icon={<FileSearch aria-hidden="true" size={18} />}>
          <ul className="m-0 pl-5">
            {card.documentsToLookFor.map((d, i) => (
              <li key={i}>{tr(d, locale)}</li>
            ))}
          </ul>
        </Section>
      )}

      {card.fallbacks.length > 0 && (
        <Section title={ui('whatIfNot', locale)} open={primary}>
          <ul className="m-0 pl-5">
            {card.fallbacks.map((d, i) => (
              <li key={i} className="mt-1">
                {tr(d, locale)}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {card.optionalRoutes.length > 0 && (
        <Section title={ui('otherOptions', locale)}>
          <ul className="m-0 pl-5">
            {card.optionalRoutes.map((d, i) => (
              <li key={i}>{tr(d, locale)}</li>
            ))}
          </ul>
        </Section>
      )}

      {card.uncertainties.length > 0 && (
        <Section title={ui('stillUncertain', locale)}>
          <ul className="m-0 pl-5">
            {card.uncertainties.map((d, i) => (
              <li key={i}>{tr(d, locale)}</li>
            ))}
          </ul>
        </Section>
      )}

      {card.clerkQuestions.length > 0 && (
        <Section title={ui('clerkQuestions', locale)} icon={<MessageSquareText aria-hidden="true" size={18} />}>
          <p className="m-0 text-sm text-[var(--color-ink-soft)]">{ui('clerkQuestionsNote', locale)}</p>
          <ul className="m-0 mt-2 grid list-none gap-2 p-0">
            {card.clerkQuestions.map((q, i) => (
              <li key={i} className="rounded-lg border-l-4 border-[var(--color-marigold)] bg-[var(--color-paper)] px-3 py-2 italic">
                “{tr(q, locale)}”
              </li>
            ))}
          </ul>
        </Section>
      )}

      {card.legalHelpReferralIds.length > 0 && (
        <Section title={ui('getHelp', locale)} icon={<LifeBuoy aria-hidden="true" size={18} />}>
          <ul className="m-0 grid list-none gap-2 p-0">
            {card.legalHelpReferralIds.map((r) => (
              <li key={r}>
                <OfficialLink id={r} locale={locale} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
