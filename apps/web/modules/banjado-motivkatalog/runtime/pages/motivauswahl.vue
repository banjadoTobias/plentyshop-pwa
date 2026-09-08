<template>
  <NuxtLayout name="default" :breadcrumbs="breadcrumbs">
    <NarrowContainer class="px-4 pb-16 @md:px-6" data-testid="motivkatalog-page">
      <header class="pb-6 pt-2 @md:pb-8">
        <h1 class="text-3xl font-semibold tracking-tight text-brand-ink @md:text-4xl">
          {{ t('banjadoMotivkatalog.title') }}
        </h1>
        <p class="mt-3 max-w-prose text-base text-brand-ink-2">
          {{ t('banjadoMotivkatalog.intro', { count: totalCountLabel }) }}
        </p>
      </header>

      <div class="@lg:flex @lg:items-start @lg:gap-8">
        <BanjadoMotivkatalogFilter
          class="@lg:sticky @lg:top-24 @lg:w-64 @lg:flex-none"
          :facets="facets"
          :counts="facetCounts"
          :state="filterState"
          :result-count="filteredItems.length"
          :open="filtersOpen"
          @toggle="toggleFacet"
          @reset="resetFilters"
          @close="closeFilters"
        />

        <div class="min-w-0 flex-1">
          <BanjadoMotivkatalogToolbar
            :search-input="searchInput"
            :quick-chips="quickChips"
            :counts="facetCounts"
            :state="filterState"
            :active-filters="activeFilters"
            :active-facet-count="activeFacetCount"
            :result-count="filteredItems.length"
            :filters-open="filtersOpen"
            @search-input="onSearchInput"
            @clear-search="clearSearch"
            @toggle="toggleFacet"
            @remove="removeFacet"
            @reset="resetFilters"
            @open-filters="openFilters"
          />

          <div class="mt-5">
            <p
              v-if="catalogError"
              class="rounded-brand border border-brand-line bg-brand-sand px-6 py-8 text-center text-brand-ink-2"
              data-testid="motivkatalog-error"
            >
              {{ t('banjadoMotivkatalog.error') }}
            </p>
            <BanjadoMotivkatalogSkeleton v-else-if="!catalog" />
            <BanjadoMotivkatalogGrid
              v-else-if="visibleItems.length"
              :items="visibleItems"
              :eager-count="EAGER_IMAGE_COUNT"
            />
            <div
              v-else
              class="rounded-brand border border-brand-line bg-brand-sand px-6 py-10 text-center"
              data-testid="motivkatalog-empty"
            >
              <p class="font-semibold text-brand-ink">{{ t('banjadoMotivkatalog.empty.title') }}</p>
              <p class="mt-1 text-sm text-brand-ink-2">{{ t('banjadoMotivkatalog.empty.text') }}</p>
              <button
                v-if="isFiltered"
                type="button"
                class="mt-4 inline-flex items-center justify-center rounded-brand-sm border border-brand-line bg-white px-5 py-2.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-sand"
                data-testid="motivkatalog-empty-reset"
                @click="resetFilters"
              >
                {{ t('banjadoMotivkatalog.resetFilters') }}
              </button>
            </div>
          </div>

          <!-- Nachladen in Schueben: der Sentinel loest es beim Scrollen aus, der Knopf bleibt
               fuer Tastatur und Leser ohne IntersectionObserver. Kein virtuelles Scrollen —
               2.400 Kacheln mit lazy Bildern sind beherrschbar, und Google sieht den ersten Schub. -->
          <div ref="sentinel" class="h-px" aria-hidden="true" data-testid="motivkatalog-sentinel" />
          <div v-if="hasMore" class="mt-6 text-center">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-brand border border-brand-line bg-white px-6 py-3 text-base font-semibold text-brand-ink transition hover:border-brand-ink-3 hover:bg-brand-sand"
              data-testid="motivkatalog-load-more"
              @click="loadMore"
            >
              {{ t('banjadoMotivkatalog.loadMore', { count: nextBatchCount }) }}
            </button>
            <p class="mt-2 text-sm text-brand-ink-3">
              {{
                t('banjadoMotivkatalog.shownOf', {
                  shown: formatCount(visibleItems.length, locale),
                  total: formatCount(filteredItems.length, locale),
                })
              }}
            </p>
          </div>
        </div>
      </div>
    </NarrowContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Locale } from '#i18n';
import {
  EAGER_IMAGE_COUNT,
  MOTIF_IMAGE_SIZE_LARGE,
  MOTIVKATALOG_PATH,
  OG_MOTIF_NUMBER,
  PAGE_META_ICON,
} from '../config/constants';
import { formatCount } from '../utils/formatCount';
import { getMotifImageUrl } from '../utils/motifImage';
import { createEmptyFacets } from '../utils/parseMotive';

// Die Seite liegt nicht unter app/pages, deshalb greift die Ausnahme fuer einteilige
// Seitennamen (vue/multi-word-component-names) nicht — der Name kommt daher ausdruecklich.
defineOptions({ name: 'BanjadoMotivauswahl' });

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

definePageMeta({
  layout: false,
  pageType: 'static',
});

const { t, locale, defaultLocale } = useI18n();
const { setPageMeta } = usePageMeta();
const localePath = useLocalePath();
const runtimeConfig = useRuntimeConfig();
const { applyToUrl } = useUrlTrailingSlash();
const { getAvailableLocales } = useLocalization();

setPageMeta(t('banjadoMotivkatalog.title'), PAGE_META_ICON);

const {
  catalog,
  catalogError,
  fetchCatalog,
  filterState,
  searchInput,
  totalCount,
  filteredItems,
  facetCounts,
  activeFilters,
  isFiltered,
  activeFacetCount,
  quickChips,
  visibleItems,
  hasMore,
  nextBatchCount,
  filtersOpen,
  toggleFacet,
  removeFacet,
  onSearchInput,
  clearSearch,
  resetFilters,
  loadMore,
  openFilters,
  closeFilters,
} = useMotivkatalog();

await fetchCatalog();

const facets = computed(() => catalog.value?.facets ?? createEmptyFacets());
const totalCountLabel = computed(() => formatCount(totalCount.value, locale.value));

const breadcrumbs = computed(() => [
  { name: t('common.labels.home'), link: '/' },
  { name: t('banjadoMotivkatalog.title'), link: MOTIVKATALOG_PATH },
]);

// Canonical und hreflang zeigen immer auf die nackte Seite, nie auf einen Filterstand:
// sonst wuerde jede Kombination aus ?thema=…&farbe=… zu einer eigenen Seite fuer Google.
// Deshalb nicht setStaticPageMeta() aus dem Kern (das nimmt route.fullPath samt Query),
// sondern dieselben Bausteine mit dem festen Pfad.
const absoluteUrl = (targetLocale?: Locale) =>
  applyToUrl(`${runtimeConfig.public.domain}${localePath(MOTIVKATALOG_PATH, targetLocale)}`);

// Domain, Sprache und Trailing-Slash aendern sich waehrend der Seite nicht; ein Sprachwechsel
// ist eine neue Route und baut die Seite neu auf. Deshalb feste Werte statt Getter.
const canonicalUrl = absoluteUrl();

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl },
    { rel: 'alternate', hreflang: 'x-default', href: absoluteUrl(defaultLocale) },
    ...getAvailableLocales().map((availableLocale: Locale) => ({
      rel: 'alternate' as const,
      hreflang: availableLocale,
      href: absoluteUrl(availableLocale),
    })),
  ],
});

useSeoMeta({
  title: () => t('banjadoMotivkatalog.metaTitle', { count: totalCountLabel.value }),
  description: () => t('banjadoMotivkatalog.metaDescription', { count: totalCountLabel.value }),
  ogTitle: () => t('banjadoMotivkatalog.metaTitle', { count: totalCountLabel.value }),
  ogDescription: () => t('banjadoMotivkatalog.metaDescription', { count: totalCountLabel.value }),
  ogImage: getMotifImageUrl(OG_MOTIF_NUMBER, MOTIF_IMAGE_SIZE_LARGE),
  ogUrl: canonicalUrl,
  robots: 'all',
});

const sentinel = ref<HTMLElement | null>(null);

useLoadMoreSentinel({
  target: sentinel,
  enabled: hasMore,
  refreshKey: computed(() => visibleItems.value.length),
  onLoadMore: loadMore,
});
</script>
