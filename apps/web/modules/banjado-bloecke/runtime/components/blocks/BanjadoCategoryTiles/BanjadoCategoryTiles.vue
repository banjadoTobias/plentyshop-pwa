<template>
  <section class="border-y border-brand-line bg-white" data-testid="banjado-category-tiles">
    <div class="mx-auto max-w-[1280px] px-4 py-9 md:px-6 md:py-14">
      <div class="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p v-if="content.text?.eyebrow" class="text-xs font-bold uppercase tracking-[0.09em] text-brand-ink-3">
            {{ content.text.eyebrow }}
          </p>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight text-brand-ink md:text-3xl">
            {{ content.text?.title }}
          </h2>
        </div>
        <NuxtLink
          v-if="content.linkAll?.label"
          :to="content.linkAll.link || '/'"
          class="py-2 font-semibold text-brand-orange-ink hover:text-brand-ink hover:underline"
        >
          {{ content.linkAll.label }} →
        </NuxtLink>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
        <NuxtLink
          v-for="(tile, index) in tiles"
          :key="index"
          :to="tile.link || '/'"
          class="block overflow-hidden rounded-brand border border-brand-line bg-white text-center transition duration-200 hover:-translate-y-0.5 hover:border-brand-green hover:shadow-brand"
        >
          <NuxtImg
            :src="tile.image"
            :alt="tile.label"
            loading="lazy"
            class="aspect-square w-full bg-brand-sand object-cover"
            sizes="sm:50vw md:33vw lg:200px"
          />
          <span class="block px-2 py-3 text-sm font-semibold text-brand-ink">{{ tile.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BanjadoCategoryTilesProps } from './types';

const props = defineProps<BanjadoCategoryTilesProps>();

const content = computed(() => props.content ?? {});
const tiles = computed(() => content.value.tiles ?? []);
</script>
