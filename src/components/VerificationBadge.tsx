import { CircleCheck, CircleAlert, CircleHelp } from 'lucide-react';
import type { Locale, VerificationStatus } from '../domain/types';
import { tr, VERIFICATION_LABEL } from '../i18n/strings';

export function VerificationBadge({ status, locale, date }: { status: VerificationStatus; locale: Locale; date?: string }) {
  const Icon = status === 'verified' ? CircleCheck : status === 'partial' ? CircleAlert : CircleHelp;
  const label = tr(VERIFICATION_LABEL[status], locale);
  return (
    <span className={`chip chip-${status}`} data-status={status}>
      <Icon aria-hidden="true" size={14} strokeWidth={2.6} />
      {label}
      {status === 'verified' && date ? ` ${date}` : ''}
    </span>
  );
}
