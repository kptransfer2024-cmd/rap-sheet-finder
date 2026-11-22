import type { Locale } from '../domain/types';
import { ui } from '../i18n/strings';

export function LanguageSwitcher({ locale, onChange }: { locale: Locale; onChange: (l: Locale) => void }) {
  return (
    <div className="seg" role="group" aria-label={ui('language', locale)}>
      <button type="button" aria-pressed={locale === 'en'} onClick={() => onChange('en')} lang="en">
        English
      </button>
      <button type="button" aria-pressed={locale === 'es'} onClick={() => onChange('es')} lang="es">
        Español
      </button>
    </div>
  );
}
