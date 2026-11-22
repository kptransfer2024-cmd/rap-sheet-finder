import { Clipboard, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { FACT_BY_ID } from '../data/facts';
import type { Locale, ResolvedPlace } from '../domain/types';
import { copyText } from '../lib/export';
import { tr, ui } from '../i18n/strings';
import { VerificationBadge } from './VerificationBadge';

const tel = (n: string) => `tel:+1${n.replace(/\D/g, '')}`;
const mapUrl = (address: string) => `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;

/**
 * A place card. An address here is NOT proof this is the right place for a case —
 * `matchNote` says how confident the routing is, and unknowns are spelled out.
 */
export function LocationCard({ place, locale, hideMatchNote = false }: { place: ResolvedPlace; locale: Locale; hideMatchNote?: boolean }) {
  const [copied, setCopied] = useState(false);
  const hours = place.hoursFactId ? FACT_BY_ID[place.hoursFactId] : undefined;
  return (
    <article className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4" data-place={place.id} data-match={place.match}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="font-display m-0 flex items-start gap-2 text-lg leading-snug font-semibold">
          <MapPin aria-hidden="true" className="mt-1 flex-none text-[var(--color-teal)]" size={18} />
          {tr(place.name, locale)}
        </h4>
        <VerificationBadge status={place.status} locale={locale} />
      </div>
      {place.matchNote && !hideMatchNote && (
        <p className="m-0 mt-2 rounded-md bg-[var(--color-marigold-wash)] px-3 py-2 text-sm text-[var(--color-marigold-ink)]">
          {tr(place.matchNote, locale)}
        </p>
      )}
      <dl className="m-0 mt-3 grid gap-2 text-[0.97rem]">
        <div>
          <dt className="text-sm font-bold text-[var(--color-ink-soft)]">{ui('street', locale)}</dt>
          <dd className="m-0">{place.streetAddress}</dd>
        </div>
        {place.mailingAddress && (
          <div>
            <dt className="text-sm font-bold text-[var(--color-ink-soft)]">{ui('mailing', locale)}</dt>
            <dd className="m-0">{place.mailingAddress}</dd>
          </div>
        )}
        {hours && (
          <div>
            <dt className="text-sm font-bold text-[var(--color-ink-soft)]">{ui('hours', locale)}</dt>
            <dd className="m-0">{tr(hours.statement, locale)}</dd>
          </div>
        )}
      </dl>
      <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
        {place.phones.map((p) => (
          <li key={p.number}>
            <a className="btn btn-secondary btn-small" href={tel(p.number)}>
              <Phone aria-hidden="true" size={15} />
              <span>
                {tr(p.label, locale)}: {p.number}
              </span>
            </a>
          </li>
        ))}
        {place.emails?.map((e) => (
          <li key={e}>
            <a className="btn btn-secondary btn-small" href={`mailto:${e}`}>
              <Mail aria-hidden="true" size={15} /> <span className="break-all">{e}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="no-print mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={async () => setCopied(await copyText(place.mailingAddress ?? place.streetAddress))}
        >
          <Clipboard aria-hidden="true" size={15} /> {ui('copyAddress', locale)}
        </button>
        <a className="btn btn-ghost btn-small" href={mapUrl(place.streetAddress)} target="_blank" rel="noopener noreferrer">
          <MapPin aria-hidden="true" size={15} /> {ui('map', locale)}
          <span className="sr-only"> (openstreetmap.org, {ui('opensNewTab', locale)})</span>
        </a>
        <span role="status" className="self-center text-sm text-[var(--color-teal)]">
          {copied ? ui('addressCopied', locale) : ''}
        </span>
      </div>
      <ul className="m-0 mt-3 grid list-none gap-1 p-0 text-sm">
        {place.unknowns.map((u, i) => (
          <li key={i} className="flex flex-wrap items-start gap-2">
            <span className="chip chip-needs_review flex-none">{ui('notPublished', locale)}</span>
            <span className="min-w-0 flex-1 basis-48">{tr(u, locale)}</span>
          </li>
        ))}
        {place.notes?.map((n, i) => (
          <li key={`n${i}`} className="text-[var(--color-ink-soft)]">
            {tr(n, locale)}
          </li>
        ))}
        <li className="font-bold">{ui('confirmBeforeTravel', locale)}</li>
      </ul>
    </article>
  );
}
