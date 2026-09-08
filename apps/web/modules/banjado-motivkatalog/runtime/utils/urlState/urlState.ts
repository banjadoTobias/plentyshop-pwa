import { FACET_KEYS, QUERY_PARAM_SEARCH, QUERY_VALUE_SEPARATOR, SEARCH_MAX_LENGTH } from '../../config/constants';
import type { MotivActiveFilter, MotivFacetKey, MotivFilterState, MotivRouteQuery } from '../../types';

export const createEmptyFilterState = (): MotivFilterState => ({ thema: [], farbe: [], neu: [], saison: [], q: '' });

const toStrings = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }

  return typeof value === 'string' ? [value] : [];
};

/**
 * @description Liest den Filterstand aus route.query. Mehrfachwerte stehen kommagetrennt
 * (?thema=Natur,Tiere), vue-router hat Prozent-Kodierung schon aufgeloest. Unbekannte Parameter
 * werden ignoriert, Werte dedupliziert.
 * @param query route.query.
 * @example
 * ``` ts
 * parseFilterQuery({ thema: 'Natur,Tiere', q: 'holz' });
 * ```
 */
export const parseFilterQuery = (query: MotivRouteQuery): MotivFilterState => {
  const state = createEmptyFilterState();

  for (const key of FACET_KEYS) {
    const values = toStrings(query[key])
      .flatMap((value) => value.split(QUERY_VALUE_SEPARATOR))
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    state[key] = [...new Set(values)];
  }

  state.q = (toStrings(query[QUERY_PARAM_SEARCH])[0] ?? '').trim().slice(0, SEARCH_MAX_LENGTH);

  return state;
};

/**
 * @description Filterstand als Query-Objekt fuer router.replace — leere Gruppen fehlen,
 * damit die URL ohne Filter wieder nackt ist.
 * @param state Der Filterstand.
 * @example
 * ``` ts
 * router.replace({ query: serializeFilterQuery(state) });
 * ```
 */
export const serializeFilterQuery = (state: MotivFilterState): Record<string, string> => {
  const query: Record<string, string> = {};

  for (const key of FACET_KEYS) {
    if (state[key].length > 0) {
      query[key] = state[key].join(QUERY_VALUE_SEPARATOR);
    }
  }

  const term = state.q.trim();

  if (term.length > 0) {
    query[QUERY_PARAM_SEARCH] = term;
  }

  return query;
};

/**
 * @description Filterstand als Query-String mit encodeURIComponent je Wert; das Komma zwischen
 * Mehrfachwerten bleibt lesbar. Dieselbe Form erzeugen die Links im Motivband-Block.
 * @param state Der Filterstand.
 * @example
 * ``` ts
 * toQueryString({ ...empty, thema: ['Blumen & Blüten'] }); // 'thema=Blumen%20%26%20Bl%C3%BCten'
 * ```
 */
export const toQueryString = (state: MotivFilterState): string => {
  const parts: string[] = [];

  for (const key of FACET_KEYS) {
    if (state[key].length > 0) {
      parts.push(`${key}=${state[key].map((value) => encodeURIComponent(value)).join(QUERY_VALUE_SEPARATOR)}`);
    }
  }

  const term = state.q.trim();

  if (term.length > 0) {
    parts.push(`${QUERY_PARAM_SEARCH}=${encodeURIComponent(term)}`);
  }

  return parts.join('&');
};

export const toggleFacetValue = (state: MotivFilterState, key: MotivFacetKey, value: string): MotivFilterState => ({
  ...state,
  [key]: state[key].includes(value) ? state[key].filter((entry) => entry !== value) : [...state[key], value],
});

export const removeFacetValue = (state: MotivFilterState, key: MotivFacetKey, value: string): MotivFilterState => ({
  ...state,
  [key]: state[key].filter((entry) => entry !== value),
});

export const hasActiveFilters = (state: MotivFilterState): boolean =>
  FACET_KEYS.some((key) => state[key].length > 0) || state.q.trim().length > 0;

export const countActiveFacets = (state: MotivFilterState): number =>
  FACET_KEYS.reduce((sum, key) => sum + state[key].length, 0);

/** Aktive Facettenwerte in Gruppenreihenfolge — fuer die entfernbaren Chips ueber dem Raster. */
export const getActiveFilters = (state: MotivFilterState): MotivActiveFilter[] =>
  FACET_KEYS.flatMap((key) => state[key].map((value) => ({ key, value })));
