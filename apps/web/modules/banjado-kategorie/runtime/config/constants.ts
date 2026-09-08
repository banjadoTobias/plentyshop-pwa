import type { ComponentOverride } from '../types';

export const MODULE_NAME = 'banjado-kategorie';

/**
 * MIME-Typ, unter dem Suchmaschinen strukturierte Daten erwarten. Explizit als
 * Literaltyp: useHead verlangt fuer script.type genau diesen Wert; ohne Annotation
 * weitet TypeScript ihn im Objektliteral zu string und vue-tsc lehnt ab.
 */
export const JSON_LD_MIME_TYPE: 'application/ld+json' = 'application/ld+json';

/** Prefix der useHead-Schluessel, damit gleiche Objekte aus zwei Bloecken nur einmal im <head> landen. */
export const JSON_LD_HEAD_KEY_PREFIX = 'banjado-category-jsonld-';

/**
 * Kern-Komponenten, die das Modul per addComponent austauscht. Beide werden im
 * Kern nur per Auto-Import benutzt (Sort.vue bzw. CategoryFilters.vue), darum
 * greift der Austausch; ein statischer Import wuerde ihn unterlaufen.
 */
export const COMPONENT_OVERRIDES: ComponentOverride[] = [
  { name: 'CategoryFiltersSortSections', path: './runtime/components/CategoryFilters/SortSections.vue' },
  { name: 'CategoryFiltersFilter', path: './runtime/components/CategoryFilters/Filter.vue' },
];

/** Prioritaet oberhalb des Kern-Scans (0) - dasselbe Muster wie modules/paypal und banjado-motiv-upload. */
export const OVERRIDE_PRIORITY = 100;
