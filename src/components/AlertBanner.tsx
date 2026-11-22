import { Info, OctagonAlert, TriangleAlert } from 'lucide-react';
import type { AlertId, Locale } from '../domain/types';
import { ALERT_TEXT, tr } from '../i18n/strings';

export function AlertBanner({ id, locale }: { id: AlertId; locale: Locale }) {
  const a = ALERT_TEXT[id];
  const Icon = a.tone === 'urgent' ? OctagonAlert : a.tone === 'caution' ? TriangleAlert : Info;
  return (
    <div className={`alert alert-${a.tone}`} role={a.tone === 'urgent' ? 'alert' : 'note'} data-alert={id}>
      <Icon aria-hidden="true" className="mt-0.5 flex-none" size={24} />
      <div>
        <p className="m-0 font-bold">{tr(a.title, locale)}</p>
        <p className="m-0 mt-1">{tr(a.body, locale)}</p>
      </div>
    </div>
  );
}
