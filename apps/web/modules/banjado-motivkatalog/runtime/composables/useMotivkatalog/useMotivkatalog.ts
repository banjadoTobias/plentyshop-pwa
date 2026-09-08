import {
  ASYNC_DATA_KEY_CATALOG,
  ASYNC_DATA_KEY_TAGS,
  HISTORY_STATE_VISIBLE_KEY,
  MOTIVKATALOG_API_ROUTE,
  MOTIVKATALOG_SEARCH_API_ROUTE,
  PAGE_SIZE,
  QUERY_PARAM_SEARCH,
  QUICK_CHIP_COUNT,
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_LENGTH,
} from '../../config/constants';
import { applyFilters, isNumberSearch, normalizeSearchTerm } from '../../utils/applyFilters';
import { countFacets } from '../../utils/countFacets';
import {
  countActiveFacets,
  createEmptyFilterState,
  getActiveFilters,
  hasActiveFilters,
  parseFilterQuery,
  removeFacetValue,
  serializeFilterQuery,
  toggleFacetValue,
} from '../../utils/urlState';
import type { MotivCatalog, MotivFacetKey, MotivFilterState, MotivSearchResponse } from '../../types';

const emptySearchResponse = (): MotivSearchResponse => ({ q: '', n: [] });

/**
 * Wie viele Kacheln auf dieser History-Position schon geladen waren. Steht in history.state,
 * nicht in der URL: so kommt man mit "Zurueck" von der Suche wieder an dieselbe Stelle, ohne
 * dass ein geteilter Link 400 Kacheln auf einmal rendert. Auf dem Server immer der erste Schub.
 */
const readRememberedVisibleCount = (): number => {
  if (import.meta.server) {
    return PAGE_SIZE;
  }

  const saved = Number(window.history.state?.[HISTORY_STATE_VISIBLE_KEY]);

  return Number.isFinite(saved) && saved > PAGE_SIZE ? saved : PAGE_SIZE;
};

const rememberVisibleCount = (count: number) => {
  if (import.meta.server) {
    return;
  }

  try {
    window.history.replaceState({ ...window.history.state, [HISTORY_STATE_VISIBLE_KEY]: count }, '');
  } catch {
    // Kein Zugriff auf history (z. B. eingebettet) — dann eben ohne Merker.
  }
};

/**
 * @description Zustand der Seite /motivauswahl: laedt den Katalog ueber die eigene Nitro-Route,
 * liest den Filterstand aus route.query (Thema, Farbe, Neuheiten, Saison, Suche), filtert
 * client-seitig und gibt Kacheln in Schueben frei. Aenderungen gehen per router.replace in die
 * URL, so sind Filterlinks teilbar und Zurueck/Vor funktionieren.
 * @returns Katalogdaten, Filterstand, sichtbare Kacheln und die Aktionen dazu
 * @example
 * ``` ts
 * const { fetchCatalog, visibleItems, toggleFacet, loadMore } = useMotivkatalog();
 * await fetchCatalog();
 * ```
 */
export const useMotivkatalog = () => {
  const route = useRoute();
  const router = useRouter();

  const {
    data: catalog,
    status: catalogStatus,
    error: catalogError,
    execute: executeCatalog,
  } = useAsyncData<MotivCatalog | null>(ASYNC_DATA_KEY_CATALOG, () => $fetch<MotivCatalog>(MOTIVKATALOG_API_ROUTE), {
    default: () => null,
    immediate: false,
  });

  // Die Seite bleibt waehrend einer Navigation weg (Klick auf ein Motiv) sichtbar, bis die
  // naechste Seite steht. route.query ist dann schon die fremde Query — der Filterstand friert
  // deshalb ein, sobald der Pfad nicht mehr der eigene ist, sonst springt das Raster kurz um.
  const pagePath = route.path;
  const pageQuery = shallowRef(route.query);
  const isOnPage = () => route.path === pagePath;

  const filterState = computed(() => parseFilterQuery(pageQuery.value));
  const searchTerm = computed(() => normalizeSearchTerm(filterState.value.q));

  // Tags liegen nur auf dem Server; ab drei Zeichen Text fragt der Client die Suchroute.
  // Ziffern suchen die Nummer, das kann der Client allein.
  const tagTerm = computed(() =>
    searchTerm.value.length >= SEARCH_MIN_LENGTH && !isNumberSearch(searchTerm.value) ? searchTerm.value : '',
  );

  const { data: tagSearch, execute: executeTagSearch } = useAsyncData<MotivSearchResponse>(
    ASYNC_DATA_KEY_TAGS,
    () =>
      tagTerm.value.length > 0
        ? $fetch<MotivSearchResponse>(MOTIVKATALOG_SEARCH_API_ROUTE, {
            query: { [QUERY_PARAM_SEARCH]: tagTerm.value },
          })
        : Promise.resolve(emptySearchResponse()),
    {
      default: () => emptySearchResponse(),
      immediate: false,
    },
  );

  // Nur Treffer zum aktuellen Begriff zaehlen; eine alte Antwort darf nicht in den neuen Stand.
  const tagHits = computed(() => {
    const response = tagSearch.value;

    if (tagTerm.value.length === 0 || !response || response.q !== tagTerm.value) {
      return undefined;
    }

    return new Set(response.n);
  });

  const items = computed(() => catalog.value?.items ?? []);
  const totalCount = computed(() => items.value.length);
  const filteredItems = computed(() => applyFilters(items.value, filterState.value, tagHits.value));
  const facetCounts = computed(() => countFacets(items.value, filterState.value, tagHits.value));
  const activeFilters = computed(() => getActiveFilters(filterState.value));
  const isFiltered = computed(() => hasActiveFilters(filterState.value));
  const activeFacetCount = computed(() => countActiveFacets(filterState.value));
  const quickChips = computed(() => (catalog.value?.facets.thema ?? []).slice(0, QUICK_CHIP_COUNT));

  const visibleCount = ref(PAGE_SIZE);
  const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value));
  const hasMore = computed(() => visibleCount.value < filteredItems.value.length);
  const nextBatchCount = computed(() =>
    Math.max(0, Math.min(PAGE_SIZE, filteredItems.value.length - visibleCount.value)),
  );

  const filtersOpen = ref(false);
  const searchInput = ref(filterState.value.q);
  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  const needsTagSearch = () => tagTerm.value.length > 0 && tagSearch.value?.q !== tagTerm.value;

  /**
   * @description Holt Katalog und — bei Suchbegriff in der URL — die Tag-Treffer. Auf dem Server
   * blockierend, damit die ersten Kacheln im HTML stehen; im Browser nicht, damit die Seite bei
   * Klicknavigation sofort mit Platzhaltern erscheint. Ein schon vorhandener Stand wird nicht
   * neu geladen.
   * @example
   * ``` ts
   * await fetchCatalog();
   * ```
   */
  const fetchCatalog = async () => {
    const pending: Promise<unknown>[] = [];

    if (!catalog.value) {
      pending.push(executeCatalog());
    }

    if (needsTagSearch()) {
      pending.push(executeTagSearch());
    }

    if (import.meta.server) {
      await Promise.all(pending);
    }
  };

  const replaceQuery = (next: MotivFilterState) => router.replace({ query: serializeFilterQuery(next) });

  const toggleFacet = (key: MotivFacetKey, value: string) =>
    replaceQuery(toggleFacetValue(filterState.value, key, value));

  const removeFacet = (key: MotivFacetKey, value: string) =>
    replaceQuery(removeFacetValue(filterState.value, key, value));

  const setSearch = (term: string) => replaceQuery({ ...filterState.value, q: term });

  const resetFilters = () => {
    clearTimeout(searchTimer);
    searchInput.value = '';

    return replaceQuery(createEmptyFilterState());
  };

  /** Tippen landet erst nach einer kurzen Pause in der URL, sonst flackert die Liste bei jedem Buchstaben. */
  const onSearchInput = (value: string) => {
    searchInput.value = value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (value.trim() !== filterState.value.q) {
        setSearch(value);
      }
    }, SEARCH_DEBOUNCE_MS);
  };

  const clearSearch = () => {
    clearTimeout(searchTimer);
    searchInput.value = '';

    if (filterState.value.q.length > 0) {
      setSearch('');
    }
  };

  const loadMore = () => {
    if (!hasMore.value) {
      return;
    }

    visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, filteredItems.value.length);
    rememberVisibleCount(visibleCount.value);
  };

  const openFilters = () => {
    filtersOpen.value = true;
  };

  const closeFilters = () => {
    filtersOpen.value = false;
  };

  // Zurueck/Vor bringen einen alten Filterstand samt Merker; ein eigener router.replace kommt
  // ohne Merker und faengt wieder beim ersten Schub an.
  watch(
    () => route.query,
    (query) => {
      if (!isOnPage()) {
        return;
      }

      pageQuery.value = query;
      visibleCount.value = readRememberedVisibleCount();
    },
  );

  watch(
    () => filterState.value.q,
    (term) => {
      if (term !== searchInput.value.trim()) {
        searchInput.value = term;
      }
    },
  );

  watch(tagTerm, () => {
    if (needsTagSearch()) {
      executeTagSearch();
    }
  });

  onMounted(() => {
    visibleCount.value = readRememberedVisibleCount();
  });

  onBeforeUnmount(() => {
    clearTimeout(searchTimer);
  });

  return {
    catalog,
    catalogStatus,
    catalogError,
    fetchCatalog,
    filterState,
    searchInput,
    tagHits,
    totalCount,
    filteredItems,
    facetCounts,
    activeFilters,
    isFiltered,
    activeFacetCount,
    quickChips,
    visibleCount,
    visibleItems,
    hasMore,
    nextBatchCount,
    filtersOpen,
    toggleFacet,
    removeFacet,
    setSearch,
    onSearchInput,
    clearSearch,
    resetFilters,
    loadMore,
    openFilters,
    closeFilters,
  };
};
