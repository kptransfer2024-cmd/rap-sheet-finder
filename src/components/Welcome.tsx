import { ArrowRight, HandHeart } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PERSONAS } from '../data/personas';
import type { Locale } from '../domain/types';
import { tr, ui } from '../i18n/strings';
import { PrivacyNotice } from './PrivacyNotice';

interface Props {
  locale: Locale;
  onStart: (whose: 'own' | 'helping' | 'someone_else') => void;
  onPersona: (id: string) => void;
}

export function Welcome({ locale, onStart, onPersona }: Props) {
  const h = useRef<HTMLHeadingElement>(null);
  useEffect(() => h.current?.focus(), []);
  const reasons = ['reason1', 'reason2', 'reason3', 'reason4'];
  return (
    <div className="grid gap-10">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
        <div className="rise">
          <p className="eyebrow m-0">{ui('badge', locale)}</p>
          <h1
            ref={h}
            tabIndex={-1}
            className="mb-0 mt-3 text-[2.6rem] leading-[1.02] font-semibold sm:text-[3.6rem]"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
          >
            {ui('welcomeTitle', locale)}
          </h1>
          <p className="mb-0 mt-5 max-w-[38rem] text-[1.15rem] text-[var(--color-ink-soft)]">{ui('welcomeLead', locale)}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={() => onStart('own')}>
              {ui('startOwn', locale)} <ArrowRight aria-hidden="true" size={18} />
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onStart('helping')}>
              <HandHeart aria-hidden="true" size={18} /> {ui('startHelping', locale)}
            </button>
          </div>
          <button type="button" className="btn btn-ghost btn-small mt-2 -ml-2" onClick={() => onStart('someone_else')}>
            {ui('someoneElse', locale)}
          </button>
          <p className="mb-0 mt-4 max-w-[38rem] text-sm text-[var(--color-ink-soft)]">{ui('disclaimerShort', locale)}</p>
        </div>

        <div className="card rise rise-2 p-6 sm:p-8">
          <ol className="route">
            {reasons.map((r, i) => (
              <li key={r} className={i < reasons.length - 1 ? 'done' : 'current'}>
                <span className="stop" aria-hidden="true">
                  {i + 1}
                </span>
                <p className="m-0 pt-0.5 text-[1.05rem] font-bold">{ui(r, locale)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-2 rounded-xl bg-[var(--color-paper-2)] p-4">
            <PrivacyNotice locale={locale} />
            <p className="m-0 mt-2 text-sm">{ui('noPersonal', locale)}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="examples-h" className="rise rise-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="examples-h" className="m-0 text-2xl">
            {ui('tryExample', locale)}
          </h2>
          <p className="m-0 text-sm text-[var(--color-ink-soft)]">{ui('tryExampleLead', locale)}</p>
        </div>
        <ul className="m-0 mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((p) => (
            <li key={p.id}>
              <button type="button" className="ticket" onClick={() => onPersona(p.id)} data-persona={p.id}>
                <span className="letter" aria-hidden="true">
                  {p.letter}
                </span>
                <span>
                  <span className="block font-bold">{tr(p.title, locale)}</span>
                  <span className="block text-sm text-[var(--color-ink-soft)]">{tr(p.blurb, locale)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
