import { ShieldCheck } from 'lucide-react';
import type { Locale } from '../domain/types';
import { ui } from '../i18n/strings';

export function PrivacyNotice({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  return (
    <aside aria-label={ui('privacyTitle', locale)} className={`flex gap-3 ${compact ? 'text-sm' : ''}`}>
      <ShieldCheck aria-hidden="true" className="mt-0.5 flex-none text-[var(--color-teal)]" size={compact ? 18 : 22} />
      <p className="m-0 text-[var(--color-ink-soft)]">
        <strong className="text-[var(--color-ink)]">{ui('privacyTitle', locale)}.</strong> {ui('privacyBody', locale)}
      </p>
    </aside>
  );
}
