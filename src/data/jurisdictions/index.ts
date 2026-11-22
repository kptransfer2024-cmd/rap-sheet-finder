import { ALAMEDA } from './alameda';
import { SAN_FRANCISCO } from './san-francisco';
import { SANTA_CLARA } from './santa-clara';
import type { JurisdictionAdapter } from './types';

export const JURISDICTIONS: JurisdictionAdapter[] = [SANTA_CLARA, SAN_FRANCISCO, ALAMEDA];
export const ACTIVE_JURISDICTIONS = JURISDICTIONS.filter((j) => j.status === 'active');
export const PLANNED_JURISDICTIONS = JURISDICTIONS.filter((j) => j.status === 'placeholder');
export { SANTA_CLARA };
