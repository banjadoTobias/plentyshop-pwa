<template>
  <div data-testid="motivkatalog-filter">
    <!-- Unter @lg ist die Leiste ein Drawer von links; der Hintergrund schliesst ihn.
         Ab @lg steht sie fest neben dem Raster, ohne Hintergrund. Nur ein Markup fuer beides,
         damit die Facetten einmal im SSR-HTML stehen und nichts doppelt geladen wird. -->
    <div
      v-if="open"
      class="fixed inset-0 z-drawer-backdrop bg-brand-ink/40 @lg:hidden"
      aria-hidden="true"
      data-testid="motivkatalog-filter-backdrop"
      @click="emit('close')"
    />
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-drawer flex w-full max-w-sm flex-col bg-white shadow-brand-lg transition-transform duration-200',
        '@lg:static @lg:z-base @lg:w-auto @lg:max-w-none @lg:translate-x-0 @lg:bg-transparent @lg:shadow-none @lg:visible',
        open ? 'translate-x-0' : 'invisible -translate-x-full',
      ]"
      :aria-label="t('banjadoMotivkatalog.filter')"
      data-testid="motivkatalog-filter-panel"
      @keydown.esc="emit('close')"
    >
      <div class="flex items-center gap-3 border-b border-brand-line-2 px-4 py-3 @lg:px-0 @lg:pt-0">
        <span class="text-base font-semibold text-brand-ink">{{ t('banjadoMotivkatalog.filter') }}</span>
        <button
          v-if="hasSelection"
          type="button"
          class="ml-auto text-sm text-brand-orange-ink hover:text-brand-ink hover:underline"
          data-testid="motivkatalog-filter-reset"
          @click="emit('reset')"
        >
          {{ t('banjadoMotivkatalog.resetFilters') }}
        </button>
        <button
          ref="closeButton"
          type="button"
          :class="[
            'rounded-brand-sm p-1 text-2xl leading-none text-brand-ink-2 hover:bg-brand-sand @lg:hidden',
            { 'ml-auto': !hasSelection },
          ]"
          :aria-label="t('banjadoMotivkatalog.closeFilter')"
          data-testid="motivkatalog-filter-close"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto @lg:overflow-visible">
        <section
          v-for="key in FACET_KEYS"
          :key="key"
          class="border-b border-brand-line-2 px-4 py-3 @lg:px-0"
          :data-testid="`motivkatalog-facet-${key}`"
        >
          <h2 class="text-sm font-semibold text-brand-ink">{{ t(FACET_LABEL_KEYS[key]) }}</h2>
          <ul class="mt-1.5 grid gap-px">
            <li v-for="facet in visibleValues(key)" :key="facet.wert">
              <label
                :class="[
                  'flex cursor-pointer items-center gap-2.5 py-1.5 text-sm hover:text-brand-green-ink',
                  isDimmed(key, facet.wert) ? 'text-brand-ink-3' : 'text-brand-ink',
                ]"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 flex-none accent-brand-green-ink"
                  :checked="isSelected(key, facet.wert)"
                  :disabled="isDimmed(key, facet.wert)"
                  :data-testid="`motivkatalog-facet-option-${key}`"
                  @change="emit('toggle', key, facet.wert)"
                />
                <span
                  v-if="key === FACET_FARBE && swatchOf(facet.wert)"
                  class="h-4 w-4 flex-none rounded-full border border-brand-line"
                  :style="{ background: swatchOf(facet.wert) }"
                  aria-hidden="true"
                />
                <span class="min-w-0 flex-1 truncate">{{ facet.wert }}</span>
                <span class="text-xs tabular-nums text-brand-ink-3">{{
                  formatCount(countOf(key, facet.wert), locale)
                }}</span>
              </label>
            </li>
          </ul>
          <button
            v-if="facets[key].length > FACET_COLLAPSED_COUNT"
            type="button"
            class="mt-1 text-sm text-brand-green-ink hover:underline"
            :aria-expanded="isExpanded(key)"
            :data-testid="`motivkatalog-facet-more-${key}`"
            @click="toggleExpanded(key)"
          >
            {{
              isExpanded(key)
                ? t('banjadoMotivkatalog.showLess')
                : t('banjadoMotivkatalog.showAll', { count: facets[key].length })
            }}
          </button>
        </section>
      </div>

      <div class="border-t border-brand-line bg-white p-4 @lg:hidden">
        <button
          type="button"
          class="w-full rounded-brand-sm bg-brand-green px-5 py-3 text-base font-semibold text-brand-ink transition hover:bg-brand-green-ink hover:text-white"
          data-testid="motivkatalog-filter-apply"
          @click="emit('close')"
        >
          {{ t('banjadoMotivkatalog.showResults', { count: formatCount(resultCount, locale) }, resultCount) }}
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { COLOR_SWATCHES, FACET_COLLAPSED_COUNT, FACET_FARBE, FACET_KEYS, FACET_LABEL_KEYS } from '../config/constants';
import { formatCount } from '../utils/formatCount';
import { hasActiveFilters } from '../utils/urlState';
import type { MotivFacetKey } from '../types';
import type { BanjadoMotivkatalogFilterEmits, BanjadoMotivkatalogFilterProps } from './types';

const props = defineProps<BanjadoMotivkatalogFilterProps>();
const emit = defineEmits<BanjadoMotivkatalogFilterEmits>();

const { t, locale } = useI18n();

const closeButton = ref<HTMLButtonElement | null>(null);
const expanded = ref<MotivFacetKey[]>([]);

const hasSelection = computed(() => hasActiveFilters(props.state));

const isExpanded = (key: MotivFacetKey) => expanded.value.includes(key);

const toggleExpanded = (key: MotivFacetKey) => {
  expanded.value = isExpanded(key) ? expanded.value.filter((entry) => entry !== key) : [...expanded.value, key];
};

const isSelected = (key: MotivFacetKey, value: string) => props.state[key].includes(value);

const countOf = (key: MotivFacetKey, value: string) => props.counts[key][value] ?? 0;

// Ohne Treffer unter dem aktuellen Stand ist der Wert nicht waehlbar — ausser er ist selbst
// angehakt, dann muss er sich abhaken lassen.
const isDimmed = (key: MotivFacetKey, value: string) => countOf(key, value) === 0 && !isSelected(key, value);

// Lange Listen zeigen die haeufigsten Werte; angehakte Werte bleiben immer sichtbar.
const visibleValues = (key: MotivFacetKey) => {
  const values = props.facets[key];

  if (isExpanded(key) || values.length <= FACET_COLLAPSED_COUNT) {
    return values;
  }

  return values.filter((facet, index) => index < FACET_COLLAPSED_COUNT || isSelected(key, facet.wert));
};

const swatchOf = (value: string) => COLOR_SWATCHES[value] ?? '';

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      closeButton.value?.focus();
    }
  },
);
</script>
