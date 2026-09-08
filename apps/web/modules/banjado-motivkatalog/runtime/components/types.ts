import type {
  MotivActiveFilter,
  MotivFacetCounts,
  MotivFacetKey,
  MotivFacets,
  MotivFacetValue,
  MotivFilterState,
  MotivItem,
} from '../types';

export interface BanjadoMotivkatalogFilterProps {
  /** Alle Facettenwerte mit Gesamtzahl, sortiert nach Haeufigkeit. */
  facets: MotivFacets;
  /** Trefferzahl je Wert unter dem aktuellen Filterstand. */
  counts: MotivFacetCounts;
  state: MotivFilterState;
  resultCount: number;
  /** Unter @lg als Drawer offen; ab @lg steht die Leiste immer. */
  open: boolean;
}

export type BanjadoMotivkatalogFilterEmits = {
  toggle: [key: MotivFacetKey, value: string];
  reset: [];
  close: [];
};

export interface BanjadoMotivkatalogToolbarProps {
  searchInput: string;
  quickChips: MotivFacetValue[];
  counts: MotivFacetCounts;
  state: MotivFilterState;
  activeFilters: MotivActiveFilter[];
  activeFacetCount: number;
  resultCount: number;
  filtersOpen: boolean;
}

export type BanjadoMotivkatalogToolbarEmits = {
  'search-input': [value: string];
  'clear-search': [];
  toggle: [key: MotivFacetKey, value: string];
  remove: [key: MotivFacetKey, value: string];
  reset: [];
  'open-filters': [];
};

export interface BanjadoMotivkatalogGridProps {
  items: MotivItem[];
  /** So viele Bilder von oben laden sofort, der Rest lazy. */
  eagerCount?: number;
}

export interface BanjadoMotivkatalogSkeletonProps {
  count?: number;
}
