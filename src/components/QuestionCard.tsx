import { ChevronRight, HelpCircle } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { toggleMulti } from '../domain/engine';
import type { AnswerValue, LText, Locale, QuestionNode } from '../domain/types';
import { tr, ui } from '../i18n/strings';
import { TermButton } from './Glossary';

interface Props {
  node: QuestionNode;
  caseLabel?: LText;
  initial?: AnswerValue;
  number: number;
  locale: Locale;
  onSubmit: (value: AnswerValue) => void;
  onSkip: () => void;
  onBack: () => void;
  onOpenTerm: (id: string) => void;
}

/**
 * One question at a time. Native radio/checkbox inputs inside large labels give
 * full keyboard support (Tab into the group, arrow keys between radios, Space to
 * toggle checkboxes, Enter submits the form).
 */
export function QuestionCard({ node, caseLabel, initial, number, locale, onSubmit, onSkip, onBack, onOpenTerm }: Props) {
  const [value, setValue] = useState<AnswerValue | undefined>(initial);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const uid = useId();

  useEffect(() => {
    setValue(initial);
    headingRef.current?.focus();
  }, [node.id, caseLabel?.en, initial]);

  const selected = (code: string) => (Array.isArray(value) ? value.includes(code) : value === code);
  const canSubmit = Array.isArray(value) ? value.length > 0 : !!value;
  const helpId = `${uid}-help`;

  return (
    <form
      className="card rise p-5 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit && value !== undefined) onSubmit(value);
      }}
      aria-labelledby={`${uid}-q`}
    >
      <p className="eyebrow m-0">
        {ui('questionOf', locale, { n: number })}
        {caseLabel ? ` · ${tr(caseLabel, locale)}` : ''}
        {node.optional ? ` · ${ui('optional', locale)}` : ''}
      </p>
      <h2
        id={`${uid}-q`}
        ref={headingRef}
        tabIndex={-1}
        className="mb-2 mt-2 text-[1.75rem] leading-tight font-semibold sm:text-[2.1rem]"
        style={{ fontVariationSettings: '"SOFT" 50, "WONK" 0' }}
      >
        {tr(node.prompt, locale)}
      </h2>
      {(node.help || node.type === 'multi') && (
        <p id={helpId} className="m-0 text-[1.05rem] text-[var(--color-ink-soft)]">
          {node.help ? tr(node.help, locale) : ui('pickAll', locale)}
        </p>
      )}

      <fieldset className="m-0 mt-5 border-0 p-0" aria-describedby={node.help ? helpId : undefined}>
        <legend className="sr-only">{tr(node.prompt, locale)}</legend>
        <div className="grid gap-3">
          {node.options.map((o) => {
            const isUnknown = o.kind === 'unknown' || o.kind === 'prefer_not';
            return (
              <label key={o.code} className={`option ${isUnknown ? 'unknown' : ''}`} data-code={o.code}>
                <input
                  type={node.type === 'single' ? 'radio' : 'checkbox'}
                  name={`${uid}-${node.id}`}
                  value={o.code}
                  checked={selected(o.code)}
                  onChange={() => {
                    if (node.type === 'single') setValue(o.code);
                    else setValue(toggleMulti(node, Array.isArray(value) ? value : [], o.code));
                  }}
                />
                <span aria-hidden="true" className={`mark ${node.type === 'single' ? 'radio' : 'check'}`} />
                <span className="flex flex-col">
                  <span className="text-[1.06rem] font-bold">{tr(o.label, locale)}</span>
                  {o.hint && <span className="text-[0.95rem] text-[var(--color-ink-soft)]">{tr(o.hint, locale)}</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <details className="disclose mt-5 rounded-xl bg-[var(--color-paper-2)] px-4 py-1">
        <summary>
          <HelpCircle aria-hidden="true" size={18} className="text-[var(--color-teal)]" />
          {ui('whyWeAsk', locale)}
          <ChevronRight aria-hidden="true" size={18} className="chev ml-auto" />
        </summary>
        <p className="mt-0 pb-3">{tr(node.whyWeAsk, locale)}</p>
      </details>

      {node.glossary && node.glossary.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-ink-soft)]">{ui('glossary', locale)}:</span>
          {node.glossary.map((t) => (
            <TermButton key={t} termId={t} locale={locale} onOpen={onOpenTerm} />
          ))}
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          ← {ui('back', locale)}
        </button>
        <button type="submit" className="btn btn-primary min-w-[9rem]" disabled={!canSubmit}>
          {ui('next', locale)} →
        </button>
        {node.optional && (
          <button type="button" className="btn btn-ghost" onClick={onSkip}>
            {ui('skip', locale)}
          </button>
        )}
      </div>
    </form>
  );
}
