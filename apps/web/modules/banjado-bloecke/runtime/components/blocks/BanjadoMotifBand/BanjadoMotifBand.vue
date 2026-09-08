<template>
  <section class="border-y border-brand-line bg-brand-sand" data-testid="banjado-motif-band">
    <div
      class="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-7 px-4 py-9 @md:px-6 @md:py-14 @lg:grid-cols-[340px_1fr] @lg:gap-11"
    >
      <div>
        <p v-if="content.text?.eyebrow" class="text-xs font-bold uppercase tracking-[0.09em] text-brand-green-ink">
          {{ content.text.eyebrow }}
        </p>
        <!-- eslint-disable-next-line vue/no-v-html — Inhalt kommt aus dem Editor, wie bei TextCard -->
        <h2
          class="mt-2.5 text-2xl font-semibold tracking-tight text-brand-ink @md:text-[34px] @md:leading-tight"
          v-html="content.text?.titleHtml"
        />
        <p v-if="content.text?.description" class="mt-3.5 text-[15.5px] text-brand-ink-2">
          {{ content.text.description }}
        </p>

        <div v-if="chips.length" class="mt-5 flex flex-wrap gap-2">
          <NuxtLink
            v-for="(chip, index) in chips"
            :key="index"
            :to="chip.link || '/'"
            class="inline-flex items-center gap-1.5 rounded-full border border-brand-line bg-white px-3.5 py-1.5 text-sm text-brand-ink transition hover:border-brand-ink-3"
          >
            {{ chip.label }}
            <span v-if="chip.count" class="text-xs tabular-nums text-brand-ink-3">{{ chip.count }}</span>
          </NuxtLink>
        </div>

        <NuxtLink
          v-if="content.button?.label"
          :to="content.button.link || '/'"
          class="mt-6 inline-flex items-center justify-center rounded-brand bg-brand-green px-6 py-3.5 text-lg font-semibold text-[#0F1508] transition hover:bg-brand-green-ink hover:text-white"
        >
          {{ content.button.label }}
        </NuxtLink>
      </div>

      <div v-if="wall.length" class="grid grid-cols-4 gap-2 @md:grid-cols-6 @lg:grid-cols-8">
        <NuxtLink
          v-for="(tile, index) in wall"
          :key="index"
          :to="tile.link || content.button?.link || '/'"
          :title="tile.alt"
          class="group"
        >
          <NuxtImg
            :src="tile.image"
            :alt="tile.alt"
            loading="lazy"
            width="200"
            height="200"
            class="aspect-square w-full rounded-brand-sm bg-brand-line-2 object-cover transition duration-200 group-hover:scale-105 group-hover:outline group-hover:outline-2 group-hover:outline-brand-green"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BanjadoMotifBandProps } from './types';

const props = defineProps<BanjadoMotifBandProps>();

const content = computed(() => props.content ?? {});
const chips = computed(() => content.value.chips ?? []);
const wall = computed(() => (content.value.wall ?? []).slice(0, 24));
</script>
