import type { LText, Place } from '../../domain/types';

/**
 * A county adapter. Shared procedural logic (find case number -> request copies ->
 * clearance information) lives in the rule engine; county-specific facts live here.
 *
 * An adapter with `status: 'placeholder'` must NOT be used to render procedures.
 * The engine only routes to adapters whose status is 'active'.
 */
export interface JurisdictionAdapter {
  id: string;
  name: LText;
  status: 'active' | 'placeholder';
  /** Main official court site. */
  courtResourceId: string;
  places: Place[];
  /** Courthouse ids keyed by coarse area code used in the `sc_area` style question. */
  areaToCourthouse?: Record<string, string>;
  /** Courthouse option code -> place id. */
  courthouseOptionToPlace?: Record<string, string>;
  /** Index coverage start year, if verified. */
  onlineIndexFromYear?: number;
  notes: LText;
}
