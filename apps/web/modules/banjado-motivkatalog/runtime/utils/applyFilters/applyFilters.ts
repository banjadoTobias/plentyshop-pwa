import { FACET_KEYS, ITEM_FIELD_BY_FACET, SEARCH_MAX_LENGTH } from '../../config/constants';
import type { MotivFacetKey, MotivFilterState, MotivItem } from '../../types';

const DIGITS_ONLY = /^\d+$/;
const LEADING_ZEROS = /^0+/;
const WHITESPACE = /\s+/g;

/** Suchbegriff in die Form bringen, in der Titel und Tags verglichen werden. */
export const normalizeSearchTerm = (term: string): string =>
  term.trim().toLowerCase().replace(WHITESPACE, ' ').slice(0, SEARCH_MAX_LENGTH);

export const isNumberSearch = (term: string): boolean => DIGITS_ONLY.test(term);

/** '10' findet '0010' und '10003'; '0010' findet nur '0010'. */
export const matchesNumber = (number: string, term: string): boolean =>
  number.startsWith(term) || number.replace(LEADING_ZEROS, '').startsWith(term);

/**
 * @description Passt das Motiv zum Suchbegriff? Ziffern suchen die Nummer, alles andere den Titel.
 * Tag-Treffer kommen vom Server und werden per Nummernmenge dazugemischt.
 * @param item Das Motiv.
 * @param term Der bereits normalisierte Suchbegriff.
 * @param tagHits Nummern, deren Tags den Begriff enthalten.
 * @example
 * ``` ts
 * matchesSearch(item, 'holz', new Set(['10787']));
 * ```
 */
export const matchesSearch = (item: MotivItem, term: string, tagHits?: ReadonlySet<string>): boolean => {
  if (term.length === 0) {
    return true;
  }

  if (tagHits?.has(item.n)) {
    return true;
  }

  if (isNumberSearch(term)) {
    return matchesNumber(item.n, term);
  }

  return item.t.toLowerCase().includes(term);
};

/** Innerhalb einer Gruppe gilt ODER; ohne Auswahl passt alles. */
export const matchesFacetGroup = (values: readonly string[], selected: readonly string[]): boolean =>
  selected.length === 0 || values.some((value) => selected.includes(value));

/**
 * @description Zwischen den Gruppen gilt UND. skipKey laesst eine Gruppe aus — so zaehlt
 * countFacets die Treffer einer Gruppe unabhaengig von deren eigener Auswahl.
 * @param item Das Motiv.
 * @param state Der Filterstand.
 * @param skipKey Gruppe, die nicht geprueft wird.
 * @example
 * ``` ts
 * matchesFacets(item, state, 'farbe');
 * ```
 */
export const matchesFacets = (item: MotivItem, state: MotivFilterState, skipKey?: MotivFacetKey): boolean =>
  FACET_KEYS.every((key) => key === skipKey || matchesFacetGroup(item[ITEM_FIELD_BY_FACET[key]], state[key]));

/**
 * @description Wendet Facetten (ODER in der Gruppe, UND dazwischen) und Suche (zusaetzlich UND) an.
 * @param items Alle Motive.
 * @param state Der Filterstand aus der URL.
 * @param tagHits Nummern mit Tag-Treffer vom Server.
 * @example
 * ``` ts
 * const shown = applyFilters(catalog.items, filterState, tagHits);
 * ```
 */
export const applyFilters = (
  items: MotivItem[],
  state: MotivFilterState,
  tagHits?: ReadonlySet<string>,
): MotivItem[] => {
  const term = normalizeSearchTerm(state.q);

  return items.filter((item) => matchesFacets(item, state) && matchesSearch(item, term, tagHits));
};

/**
 * @description Serverseitige Tag-Suche: Nummern, deren kleingeschriebener Tag-Text den Begriff enthaelt.
 * @param search Suchkarte Nummer → Tag-Text.
 * @param term Suchbegriff, wird normalisiert.
 * @example
 * ``` ts
 * searchTags(catalog.search, 'Hund'); // ['10004', '10005', ...]
 * ```
 */
export const searchTags = (search: Record<string, string>, term: string): string[] => {
  const needle = normalizeSearchTerm(term);

  if (needle.length === 0) {
    return [];
  }

  return Object.keys(search).filter((number) => (search[number] ?? '').includes(needle));
};
