import { BookOpen, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { GLOSSARY, GLOSSARY_BY_ID } from '../data/glossary';
import type { Locale } from '../domain/types';
import { tr, ui } from '../i18n/strings';
import { OfficialLink } from './OfficialLink';

/**
 * Glossary dialog (native <dialog>: focus is trapped, Escape closes, focus returns).
 * `focusTerm` scrolls to and highlights one term.
 */
export function GlossaryDialog({
  open,
  focusTerm,
  onClose,
  locale,
}: {
  open: boolean;
  focusTerm?: string;
  onClose: () => void;
  locale: Locale;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
      if (focusTerm) {
        const el = d.querySelector<HTMLElement>(`#term-${focusTerm}`);
        el?.scrollIntoView({ block: 'center' });
        el?.focus();
      }
    } else if (!open && d.open) {
      if (typeof d.close === 'function') d.close();
      else d.removeAttribute('open');
    }
  }, [open, focusTerm]);

  return (
    <dialog ref={ref} className="sheet" aria-labelledby="glossary-title" onClose={onClose} onCancel={onClose}>
      <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-[var(--color-line)] bg-[var(--color-card)] px-5 py-4">
        <h2 id="glossary-title" className="m-0 flex items-center gap-2 text-2xl">
          <BookOpen aria-hidden="true" /> {ui('glossary', locale)}
        </h2>
        <button type="button" className="btn btn-secondary btn-small" onClick={onClose}>
          <X aria-hidden="true" size={18} /> <span>{ui('close', locale)}</span>
        </button>
      </div>
      <dl className="m-0 px-5 py-4">
        {GLOSSARY.map((g) => (
          <div
            key={g.id}
            id={`term-${g.id}`}
            tabIndex={-1}
            className={`rounded-lg px-3 py-3 ${focusTerm === g.id ? 'bg-[var(--color-marigold-wash)]' : ''}`}
          >
            <dt className="font-display text-lg font-semibold">{tr(g.term, locale)}</dt>
            <dd className="m-0 mt-1">
              {tr(g.definition, locale)}
              {g.example && <span className="mt-1 block text-[var(--color-ink-soft)]">{tr(g.example, locale)}</span>}
              <span className="mt-1 block text-sm">
                <OfficialLink id={g.sourceIds[0]} locale={locale} showStatus={false} />
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </dialog>
  );
}

/** Inline term button — opens the glossary at that term. No hover-only content. */
export function TermButton({ termId, locale, onOpen }: { termId: string; locale: Locale; onOpen: (id: string) => void }) {
  const g = GLOSSARY_BY_ID[termId];
  if (!g) return null;
  return (
    <button
      type="button"
      onClick={() => onOpen(termId)}
      className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-dashed border-[var(--color-teal)] px-3 text-sm font-bold text-[var(--color-teal)] hover:bg-[var(--color-teal-wash)]"
    >
      <BookOpen aria-hidden="true" size={14} />
      {tr(g.term, locale)}
      <span className="sr-only"> — {ui('glossary', locale)}</span>
    </button>
  );
}
