<template>
  <ul
    class="grid grid-cols-2 gap-3 @sm:grid-cols-3 @md:grid-cols-4 @md:gap-4 @lg:grid-cols-6"
    data-testid="motivkatalog-grid"
  >
    <li v-for="(item, index) in items" :key="item.n">
      <!-- Klick fuehrt zur Suche nach der Motivnummer: dort stehen alle Produkte mit dem Motiv.
           Plain img statt NuxtImg: image.provider ist 'none', und 2.400 Kacheln brauchen
           keinen Komponentenaufwand. Breite/Hoehe stehen fest, damit nichts springt. -->
      <NuxtLink
        :to="getSearchPath(item.n)"
        class="group block rounded-brand-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        :title="t('banjadoMotivkatalog.tile.viewProducts')"
        data-testid="motivkatalog-tile"
      >
        <span class="relative block aspect-square overflow-hidden rounded-brand-sm bg-brand-line-2">
          <img
            :src="getMotifImageUrl(item.n)"
            :alt="t('banjadoMotivkatalog.tile.alt', { title: item.t, number: item.n })"
            :width="MOTIF_IMAGE_THUMB_PX"
            :height="MOTIF_IMAGE_THUMB_PX"
            :loading="index < eagerCount ? 'eager' : 'lazy'"
            decoding="async"
            class="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          />
          <span
            class="pointer-events-none absolute inset-x-0 bottom-0 hidden bg-white/90 px-2 py-1.5 text-center text-2xs font-semibold text-brand-green-ink @md:group-hover:block"
            aria-hidden="true"
          >
            {{ t('banjadoMotivkatalog.tile.viewProducts') }}
          </span>
        </span>
        <span class="mt-1.5 block truncate text-sm text-brand-ink">{{ item.t }}</span>
        <span class="block text-xs tabular-nums text-brand-ink-3">
          {{ t('banjadoMotivkatalog.tile.number', { number: item.n }) }}
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { EAGER_IMAGE_COUNT, MOTIF_IMAGE_THUMB_PX } from '../config/constants';
import { getMotifImageUrl } from '../utils/motifImage';
import type { BanjadoMotivkatalogGridProps } from './types';

const { items, eagerCount = EAGER_IMAGE_COUNT } = defineProps<BanjadoMotivkatalogGridProps>();

const { t } = useI18n();
</script>
