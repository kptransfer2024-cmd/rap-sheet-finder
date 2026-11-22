import type { JurisdictionAdapter } from './types';

/**
 * San Francisco — PLACEHOLDER ONLY.
 *
 * A historical SF records-access flowchart (internal research material, not published)
 * informed the *shape* of this app's questions (arrest vs conviction, out-of-state/federal,
 * juvenile, county known?, on probation?, case number known?, pick up vs mail).
 * Its SF addresses, room numbers, portal steps and fees are NOT copied here: they must be
 * freshly researched from official SF sources before this adapter is activated.
 */
export const SAN_FRANCISCO: JurisdictionAdapter = {
  id: 'san_francisco',
  name: { en: 'San Francisco County', es: 'Condado de San Francisco' },
  status: 'placeholder',
  courtResourceId: 'sf_court',
  places: [],
  notes: {
    en: 'Not available yet. San Francisco procedures are not shown in this demo.',
    es: 'Aún no disponible.',
  },
};
