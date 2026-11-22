import { Pencil } from 'lucide-react';
import { answeredInstances, progressEstimate, toArray } from '../domain/engine';
import type { Answers, Locale } from '../domain/types';
import { tr, ui } from '../i18n/strings';

/** Short label for an answered question: the chosen option labels. */
export function answerSummary(answers: Answers, key: string, locale: Locale, node: { options: { code: string; label: { en: string; es?: string } }[] }) {
  return toArray(answers[key])
    .map((c) => tr(node.options.find((o) => o.code === c)?.label, locale))
    .join(', ');
}

/**
 * Transit-style progress: filled stops = answered (each with Edit), a marigold stop
 * for the current question, dashed stops for the estimated remainder. The count is
 * an estimate because branches vary — we say so.
 */
export function RouteProgress({
  answers,
  currentKey,
  locale,
  onEdit,
}: {
  answers: Answers;
  currentKey?: string;
  locale: Locale;
  onEdit: (key: string) => void;
}) {
  const done = answeredInstances(answers);
  const est = progressEstimate(answers);
  const remainingAfterCurrent = Math.max(0, est.remaining - (currentKey && !answers[currentKey] ? 1 : 0));
  const pct = Math.round(est.fraction * 100);

  return (
    <section aria-labelledby="progress-h">
      <h2 id="progress-h" className="eyebrow m-0">
        {ui('yourAnswers', locale)}
      </h2>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-paper-2)]"
        role="progressbar"
        aria-label={ui('progressLabel', locale)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={
          remainingAfterCurrent > 0 ? ui('aboutMore', locale, { n: remainingAfterCurrent }) : ui('almostDone', locale)
        }
      >
        <div className="h-full rounded-full bg-[var(--color-teal)] transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 mb-4 text-sm text-[var(--color-ink-soft)]">
        {remainingAfterCurrent > 0 ? ui('aboutMore', locale, { n: remainingAfterCurrent }) : ui('almostDone', locale)}
      </p>

      {done.length === 0 && <p className="text-sm text-[var(--color-ink-soft)]">{ui('noAnswersYet', locale)}</p>}
      <ol className="route">
        {done.map((inst, i) => (
          <li key={inst.key} className={inst.key === currentKey ? 'current' : 'done'}>
            <span className="stop" aria-hidden="true">
              {i + 1}
            </span>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="m-0 text-sm text-[var(--color-ink-soft)]">
                  {tr(inst.node.prompt, locale)}
                  {inst.caseKey ? ` (${inst.caseKey === 'all' ? '★' : `#${inst.caseKey}`})` : ''}
                </p>
                <p className="m-0 font-bold">{answerSummary(answers, inst.key, locale, inst.node)}</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-small no-print flex-none"
                onClick={() => onEdit(inst.key)}
                aria-label={`${ui('edit', locale)}: ${tr(inst.node.prompt, locale)}`}
              >
                <Pencil aria-hidden="true" size={14} />
                {ui('edit', locale)}
              </button>
            </div>
          </li>
        ))}
        {currentKey && !answers[currentKey] && (
          <li className="current">
            <span className="stop" aria-hidden="true">
              {done.length + 1}
            </span>
            <p className="m-0 pt-1 text-sm font-bold">…</p>
          </li>
        )}
        {Array.from({ length: Math.min(remainingAfterCurrent, 3) }).map((_, i) => (
          <li key={`ahead-${i}`} className="ahead" aria-hidden="true">
            <span className="stop">?</span>
            <p className="m-0 pt-1 text-sm text-[var(--color-ink-soft)]">&nbsp;</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
