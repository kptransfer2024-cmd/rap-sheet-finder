import { ArrowRight, Route } from 'lucide-react';
import { useMemo } from 'react';
import { previewRoute, walk } from '../domain/engine';
import type { AnswerValue, Answers, Locale, QuestionInstance } from '../domain/types';
import { STATUS_LABEL, tr, ui } from '../i18n/strings';
import { PrivacyNotice } from './PrivacyNotice';
import { RouteProgress } from './Progress';
import { QuestionCard } from './QuestionCard';

interface Props {
  answers: Answers;
  editingKey?: string;
  locale: Locale;
  onAnswer: (key: string, value: AnswerValue) => void;
  onSkip: (inst: QuestionInstance) => void;
  onBack: (fromKey: string) => void;
  onEdit: (key: string) => void;
  onShowPlan: () => void;
  onOpenTerm: (id: string) => void;
}

export function Wizard({ answers, editingKey, locale, onAnswer, onSkip, onBack, onEdit, onShowPlan, onOpenTerm }: Props) {
  const w = useMemo(() => walk(answers, 'pending'), [answers]);
  const applicable = w.instances.filter((x) => x.applicable);
  const current: QuestionInstance | undefined =
    (editingKey && applicable.find((x) => x.key === editingKey)) || w.firstPending || undefined;
  const preview = useMemo(() => previewRoute(answers), [answers]);

  if (!current) return null;
  const number = applicable.findIndex((x) => x.key === current.key) + 1;
  const caseLabel = current.caseKey ? w.cases.find((c) => c.key === current.caseKey)?.label : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div>
        <QuestionCard
          key={current.key}
          node={current.node}
          caseLabel={w.cases.length > 1 ? caseLabel : undefined}
          initial={answers[current.key]}
          number={number}
          locale={locale}
          onSubmit={(v) => onAnswer(current.key, v)}
          onSkip={() => onSkip(current)}
          onBack={() => onBack(current.key)}
          onOpenTerm={onOpenTerm}
        />
        {preview && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-ghost" onClick={onShowPlan}>
              {ui('showPlanNow', locale)} <ArrowRight aria-hidden="true" size={18} />
            </button>
            <span className="text-sm text-[var(--color-ink-soft)]">{ui('showPlanNowHint', locale)}</span>
          </div>
        )}
      </div>

      <aside className="grid gap-4" aria-label={ui('pathSoFar', locale)}>
        <section className="card p-5" aria-labelledby="preview-h" aria-live="polite">
          <h2 id="preview-h" className="eyebrow m-0 flex items-center gap-2">
            <Route aria-hidden="true" size={16} /> {ui('pathSoFar', locale)}
          </h2>
          {preview ? (
            <div className="mt-2">
              <p className="m-0 text-xs font-bold tracking-wide text-[var(--color-ink-soft)] uppercase">
                {tr(STATUS_LABEL[preview.status], locale)}
              </p>
              <p className="font-display m-0 mt-1 text-xl leading-snug font-semibold">{tr(preview.shortTitle, locale)}</p>
              {preview.whyThisPath[0] && (
                <p className="m-0 mt-2 text-sm text-[var(--color-ink-soft)]">{tr(preview.whyThisPath[0], locale)}</p>
              )}
            </div>
          ) : (
            <p className="m-0 mt-2 text-sm text-[var(--color-ink-soft)]">{ui('pathPreviewEmpty', locale)}</p>
          )}
        </section>
        <section className="card p-5">
          <RouteProgress answers={answers} currentKey={current.key} locale={locale} onEdit={onEdit} />
        </section>
        <div className="card p-4">
          <PrivacyNotice locale={locale} compact />
        </div>
      </aside>
    </div>
  );
}
