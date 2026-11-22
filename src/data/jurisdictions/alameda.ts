import type { JurisdictionAdapter } from './types';

/**
 * Alameda — PLACEHOLDER ONLY. No Alameda research has been provided or reviewed,
 * so no Alameda procedure is rendered.
 */
export const ALAMEDA: JurisdictionAdapter = {
  id: 'alameda',
  name: { en: 'Alameda County', es: 'Condado de Alameda' },
  status: 'placeholder',
  courtResourceId: 'alameda_court',
  places: [],
  notes: {
    en: 'Not available yet. Alameda procedures are not shown in this demo.',
    es: 'Aún no disponible.',
  },
};
