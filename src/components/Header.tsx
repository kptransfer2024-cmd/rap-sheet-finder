import { BookOpen, Contrast, Eraser, Type } from 'lucide-react';
import type { Locale } from '../domain/types';
import { ui } from '../i18n/strings';
import { LanguageSwitcher } from './LanguageSwitcher';

interface Props {
  locale: Locale;
  onLocale: (l: Locale) => void;
  largeText: boolean;
  onLargeText: (v: boolean) => void;
  highContrast: boolean;
  onHighContrast: (v: boolean) => void;
  onGlossary: () => void;
  onClear: () => void;
  onHome: () => void;
  canClear: boolean;
}

/** Wordmark: a tiny route line with three stops. No seals or government branding. */
function Mark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M6 28 C 6 18, 28 18, 28 6" fill="none" stroke="var(--color-teal)" strokeWidth="3.2" strokeDasharray="4 3" />
      <circle cx="6" cy="28" r="4.2" fill="var(--color-teal)" />
      <circle cx="17" cy="17" r="3.4" fill="var(--color-card)" stroke="var(--color-teal)" strokeWidth="2.6" />
      <circle cx="28" cy="6" r="4.6" fill="var(--color-marigold)" />
    </svg>
  );
}

export function Header(p: Props) {
  return (
    <header className="site-header border-b border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-paper)_88%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button type="button" onClick={p.onHome} className="flex items-center gap-2.5 border-0 bg-transparent p-0 text-left text-[var(--color-ink)]">
          <Mark />
          <span>
            <span className="font-display block text-[1.35rem] leading-none font-bold tracking-tight">{ui('appName', p.locale)}</span>
            <span className="block text-xs font-bold tracking-wide text-[var(--color-ink-soft)] uppercase">
              {ui('demoBadge', p.locale)} · {ui('badge', p.locale)}
            </span>
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitcher locale={p.locale} onChange={p.onLocale} />
          <button type="button" className="toggle" aria-pressed={p.largeText} onClick={() => p.onLargeText(!p.largeText)}>
            <Type aria-hidden="true" size={16} /> {ui('textSize', p.locale)}
          </button>
          <button type="button" className="toggle" aria-pressed={p.highContrast} onClick={() => p.onHighContrast(!p.highContrast)}>
            <Contrast aria-hidden="true" size={16} /> {ui('contrast', p.locale)}
          </button>
          <button type="button" className="toggle" onClick={p.onGlossary}>
            <BookOpen aria-hidden="true" size={16} /> {ui('glossary', p.locale)}
          </button>
          {p.canClear && (
            <button type="button" className="toggle !border-[var(--color-brick)] !text-[var(--color-brick)]" onClick={p.onClear}>
              <Eraser aria-hidden="true" size={16} /> {ui('clearAnswers', p.locale)}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
