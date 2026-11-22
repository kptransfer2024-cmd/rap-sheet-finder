import { ExternalLink } from 'lucide-react';
import { RESOURCE_BY_ID } from '../data/resources';
import type { Locale } from '../domain/types';
import { tr, ui } from '../i18n/strings';
import { VerificationBadge } from './VerificationBadge';

/**
 * An official external link. Always: descriptive name, visible domain, an
 * "official site" icon, and screen-reader text warning that it leaves the app.
 * Opening it is a normal user-initiated browser action — no automated requests.
 */
export function OfficialLink({ id, locale, showStatus = true }: { id: string; locale: Locale; showStatus?: boolean }) {
  const r = RESOURCE_BY_ID[id];
  if (!r) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-bold underline decoration-2"
      >
        <ExternalLink aria-hidden="true" size={16} strokeWidth={2.4} />
        <span>{tr(r.title, locale)}</span>
        <span className="sr-only"> {ui('opensNewTab', locale)}</span>
      </a>
      <span className="text-sm text-[var(--color-ink-soft)]">
        {ui('officialSite', locale)} · {r.officialDomain}
      </span>
      {showStatus && <VerificationBadge status={r.verificationStatus} locale={locale} date={r.lastCheckedByBuild} />}
    </span>
  );
}
