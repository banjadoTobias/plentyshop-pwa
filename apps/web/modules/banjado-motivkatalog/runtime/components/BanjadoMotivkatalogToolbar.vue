<template>
  <div data-testid="motivkatalog-toolbar">
    <!-- Suche zuerst: auf dem Handy der Haupteinstieg, deshalb nicht im Drawer versteckt. -->
    <div
      class="flex items-center gap-2.5 rounded-full border border-brand-line bg-brand-sand px-4 py-2.5 transition focus-within:border-brand-green focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-green-tint"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="flex-none text-brand-ink-3"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <label :for="searchId" class="sr-only">{{ t('banjadoMotivkatalog.search.label') }}</label>
      <input
        :id="searchId"
        type="search"
        :value="searchInput"
        :placeholder="t('banjadoMotivkatalog.search.placeholder')"
        :maxlength="SEARCH_MAX_LENGTH"
        autocomplete="off"
        class="min-w-0 flex-1 bg-transparent text-base text-brand-ink outline-none placeholder:text-brand-ink-3"
        data-testid="motivkatalog-search"
        @input="emit('search-input', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="searchInput.length > 0"
        type="button"
        class="flex-none rounded-full px-1 text-xl leading-none text-brand-ink-3 hover:text-brand-ink"
        :aria-label="t('banjadoMotivkatalog.search.clear')"
        data-testid="motivkatalog-search-clear"
        @click="emit('clear-search')"
      >
        ×
      </button>
    </div>

    <!-- Die sechs haeufigsten Themen als Schnellwahl, wie im Prototyp v2 -->
    <div v-if="quickChips.length" class="mt-4 flex flex-wrap gap-2" data-testid="motivkatalog-quick-chips">
      <span class="sr-only">{{ t('banjadoMotivkatalog.popularThemes') }}</span>
      <button
        v-for="chip in quickChips"
        :key="chip.wert"
        type="button"
        :aria-pressed="isThemeSelected(chip.wert)"
        :class="[
          'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition',
          isThemeSelected(chip.wert)
            ? 'border-brand-green-ink bg-brand-green-ink text-white'
            : 'border-brand-line bg-white text-brand-ink hover:border-brand-ink-3',
        ]"
        data-testid="motivkatalog-quick-chip"
        @click="emit('toggle', FACET_THEMA, chip.wert)"
      >
        {{ chip.wert }}
        <span
          :class="['text-xs tabular-nums', isThemeSelected(chip.wert) ? 'text-brand-green-tint' : 'text-brand-ink-3']"
        >
          {{ formatCount(themeCount(chip.wert), locale) }}
        </span>
      </button>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-brand-sm border border-brand-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-sand @lg:hidden"
        :aria-expanded="filtersOpen"
        data-testid="motivkatalog-open-filters"
        @click="emit('open-filters')"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        {{ t('banjadoMotivkatalog.openFilter') }}
        <span
          v-if="activeFacetCount > 0"
          class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-green-ink px-1.5 text-2xs font-bold text-white"
          data-testid="motivkatalog-filter-badge"
        >
          {{ activeFacetCount }}
        </span>
      </button>
      <p class="text-sm text-brand-ink-2" data-testid="motivkatalog-result-count">
        <b class="font-semibold text-brand-ink">{{ formatCount(resultCount, locale) }}</b>
        {{ t('banjadoMotivkatalog.motifNoun', resultCount) }}
      </p>
    </div>

    <div
      v-if="activeFilters.length"
      class="mt-3 flex flex-wrap items-center gap-2"
      data-testid="motivkatalog-active-filters"
    >
      <span class="sr-only">{{ t('banjadoMotivkatalog.activeFilters') }}</span>
      <span
        v-for="filter in activeFilters"
        :key="`${filter.key}-${filter.value}`"
        class="inline-flex items-center gap-1 rounded-full border border-brand-green/40 bg-brand-green-tint py-1 pl-3 pr-1.5 text-sm font-semibold text-brand-ink"
      >
        {{ filter.value }}
        <button
          type="button"
          class="rounded-full px-1 text-base leading-none text-brand-green-ink hover:text-brand-ink"
          :aria-label="t('banjadoMotivkatalog.removeFilter', { value: filter.value })"
          data-testid="motivkatalog-remove-filter"
          @click="emit('remove', filter.key, filter.value)"
        >
          ×
        </button>
      </span>
      <button
        type="button"
        class="text-sm text-brand-orange-ink hover:text-brand-ink hover:underline"
        data-testid="motivkatalog-reset"
        @click="emit('reset')"
      >
        {{ t('banjadoMotivkatalog.resetFilters') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FACET_THEMA, SEARCH_MAX_LENGTH } from '../config/constants';
import { formatCount } from '../utils/formatCount';
import type { BanjadoMotivkatalogToolbarEmits, BanjadoMotivkatalogToolbarProps } from './types';

const props = defineProps<BanjadoMotivkatalogToolbarProps>();
const emit = defineEmits<BanjadoMotivkatalogToolbarEmits>();

const { t, locale } = useI18n();

// SSR-sichere Id fuer label/for; useId kommt aus Nuxt 4 (Vue 3.5).
const searchId = useId();

const isThemeSelected = (value: string) => props.state[FACET_THEMA].includes(value);

const themeCount = (value: string) => props.counts[FACET_THEMA][value] ?? 0;
</script>
