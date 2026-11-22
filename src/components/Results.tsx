import { ChevronRight, Copy, Pencil, Printer, RotateCcw, Sparkles, Workflow } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildPlan } from '../domain/engine';
import type { Answers, Locale } from '../domain/types';
import { aiService } from '../lib/ai';
import { copyText, planToText, printPlan } from '../lib/export';
import { tr, ui } from '../i18n/strings';
import { AlertBanner } from './AlertBanner';
import { OutcomeCard } from './OutcomeCard';
import { RouteProgress } from './Progress';
import { SourceDrawer } from './SourceDrawer';

interface Props {
  answers: Answers;
  locale: Locale;
  onEdit: (key: string) => void;
  onChangeAnswers: () => void;
  onStartOver: () => void;
}

export function Results({ answers, locale, onEdit, onChangeAnswers, onStartOver }: Props) {
  const plan = useMemo(() => buildPlan(answers), [answers]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copyMsg, setCopyMsg] = useState('');

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const others = plan.cards.slice(1);
  // Order alerts by urgency.
  const order = ['immigration', 'warrant', 'active_matter', 'sc_filing_unclear', 'juvenile_mixed', 'third_party'];
  const alerts = [...plan.alerts].sort((a, b) => order.indexOf(a) - order.indexOf(b));

  return (
    <div className="grid gap-6">
      <div className="print-only">
        <p className="m-0 font-bold">
          {ui('appName', locale)} — {ui('badge', locale)}
        </p>
        <p className="m-0 text-sm">{ui('printedOn', locale)}</p>
      </div>

      <section className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow m-0">{ui('badge', locale)}</p>
          <h1 ref={headingRef} tabIndex={-1} className="m-0 mt-1 text-[2.4rem] leading-none font-semibold sm:text-[3.2rem]">
            {ui('yourPlan', locale)}
          </h1>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary btn-small" onClick={printPlan}>
            <Printer aria-hidden="true" size={17} /> {ui('print', locale)}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={async () => setCopyMsg((await copyText(planToText(plan, locale))) ? ui('copied', locale) : ui('copyFailed', locale))}
          >
            <Copy aria-hidden="true" size={17} /> {ui('copyChecklist', locale)}
          </button>
          <button type="button" className="btn btn-secondary btn-small" onClick={onChangeAnswers}>
            <Pencil aria-hidden="true" size={17} /> {ui('changeAnswers', locale)}
          </button>
          <button type="button" className="btn btn-ghost btn-small" onClick={onStartOver}>
            <RotateCcw aria-hidden="true" size={17} /> {ui('startOver', locale)}
          </button>
        </div>
      </section>
      <p role="status" className="no-print m-0 -mt-3 min-h-[1.2em] text-sm font-bold text-[var(--color-teal)]">
        {copyMsg}
      </p>

      <p className="rise rise-1 m-0 rounded-xl border-2 border-dashed border-[var(--color-line)] px-4 py-3 text-[0.97rem]">
        {tr(plan.primary.legalNotice, locale)}
      </p>

      {alerts.length > 0 && (
        <div className="rise rise-1 grid gap-3">
          {alerts.map((a) => (
            <AlertBanner key={a} id={a} locale={locale} />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="grid gap-6">
          <div className="rise rise-2">
            <OutcomeCard card={plan.primary} locale={locale} primary />
          </div>

          {others.length > 0 && (
            <section aria-labelledby="also-h" className="grid gap-4">
              <h2 id="also-h" className="m-0 text-2xl">
                {ui('alsoInPlan', locale)}
              </h2>
              {others.map((c) => (
                <OutcomeCard key={c.instanceId} card={c} locale={locale} />
              ))}
            </section>
          )}

          <SourceDrawer plan={plan} locale={locale} />

          <details className="disclose card print-open px-5 py-2" id="trace">
            <summary>
              <Workflow aria-hidden="true" size={18} /> {ui('ruleTrace', locale)}
              <ChevronRight aria-hidden="true" size={18} className="chev ml-auto" />
            </summary>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{ui('ruleTraceLead', locale)}</p>
            <ol className="m-0 overflow-x-auto pb-3 pl-5 font-mono text-[0.82rem] leading-relaxed" data-testid="rule-trace">
              {plan.trace.map((t, i) => (
                <li key={i} data-kind={t.kind} className={t.kind === 'rule' || t.kind === 'fallback' ? 'font-bold text-[var(--color-teal)]' : t.kind === 'default' ? 'text-[var(--color-marigold-ink)]' : ''}>
                  {t.text}
                </li>
              ))}
            </ol>
          </details>
        </div>

        <aside className="no-print grid gap-4 lg:sticky lg:top-4">
          <section className="card p-5">
            <RouteProgress answers={answers} locale={locale} onEdit={onEdit} />
          </section>
          <section className="card p-5" aria-labelledby="ai-h">
            <h2 id="ai-h" className="eyebrow m-0 flex items-center gap-2">
              <Sparkles aria-hidden="true" size={16} /> {ui('aiTitle', locale)}
            </h2>
            <p className="m-0 mt-2 text-sm" data-ai-mode={aiService.mode}>
              {ui('aiOff', locale)}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
