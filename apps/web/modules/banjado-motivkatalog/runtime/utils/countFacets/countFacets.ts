import { FACET_KEYS, ITEM_FIELD_BY_FACET } from '../../config/constants';
import { matchesFacets, matchesSearch, normalizeSearchTerm } from '../applyFilters';
import type { MotivFacetCounts, MotivFilterState, MotivItem } from '../../types';

export const createEmptyCounts = (): MotivFacetCounts => ({ thema: {}, farbe: {}, neu: {}, saison: {} });

/**
 * @description Trefferzahl je Facettenwert unter dem aktuellen Stand. Fuer jede Gruppe zaehlen
 * die Motive, die Suche und alle ANDEREN Gruppen bestehen — die eigene Auswahl bleibt aussen vor,
 * damit weitere Werte derselben Gruppe (ODER) ihre echte Zusatzmenge zeigen.
 * @param items Alle Motive.
 * @param state Der Filterstand.
 * @param tagHits Nummern mit Tag-Treffer vom Server.
 * @example
 * ``` ts
 * countFacets(items, state).farbe['Blau']; // 87
 * ```
 */
export const countFacets = (
  items: MotivItem[],
  state: MotivFilterState,
  tagHits?: ReadonlySet<string>,
): MotivFacetCounts => {
  const term = normalizeSearchTerm(state.q);
  const counts = createEmptyCounts();

  for (const item of items) {
    if (!matchesSearch(item, term, tagHits)) {
      continue;
    }

    for (const key of FACET_KEYS) {
      if (!matchesFacets(item, state, key)) {
        continue;
      }

      const group = counts[key];

      for (const value of item[ITEM_FIELD_BY_FACET[key]]) {
        group[value] = (group[value] ?? 0) + 1;
      }
    }
  }

  return counts;
};
