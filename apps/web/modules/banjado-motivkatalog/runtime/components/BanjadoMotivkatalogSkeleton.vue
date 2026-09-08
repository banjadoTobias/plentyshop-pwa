<template>
  <div
    class="grid grid-cols-2 gap-3 @sm:grid-cols-3 @md:grid-cols-4 @md:gap-4 @lg:grid-cols-6"
    aria-hidden="true"
    data-testid="motivkatalog-skeleton"
  >
    <div v-for="index in count" :key="index" class="animate-pulse">
      <div class="aspect-square rounded-brand-sm bg-brand-sand" />
      <div class="mt-2 h-3 w-3/4 rounded-brand-sm bg-brand-sand" />
      <div class="mt-1.5 h-2.5 w-1/3 rounded-brand-sm bg-brand-sand" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BanjadoMotivkatalogSkeletonProps } from './types';

const SKELETON_TILE_COUNT = 12;

const { count = SKELETON_TILE_COUNT } = defineProps<BanjadoMotivkatalogSkeletonProps>();
</script>
