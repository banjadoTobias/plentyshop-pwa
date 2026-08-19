<template>
  <section
    class="border-b border-brand-line bg-[linear-gradient(160deg,#FAF9F5_0%,#F1F0E8_100%)]"
    data-testid="banjado-hero"
  >
    <div
      class="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-7 px-4 py-8 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:px-6 md:py-14"
    >
      <div>
        <p v-if="content.text?.eyebrow" class="mb-3.5 text-xs font-bold uppercase tracking-[0.09em] text-brand-ink-3">
          {{ content.text.eyebrow }}
        </p>
        <!-- eslint-disable-next-line vue/no-v-html — Inhalt kommt aus dem Editor, wie bei TextCard -->
        <h1
          class="text-4xl font-bold leading-[1.06] tracking-tight text-brand-ink md:text-[52px] [&_em]:not-italic [&_em]:text-brand-green-ink"
          v-html="content.text?.titleHtml"
        />
        <p v-if="content.text?.lead" class="mt-4 max-w-[44ch] text-base text-brand-ink-2 md:text-lg">
          {{ content.text.lead }}
        </p>

        <div class="mt-7 flex flex-wrap gap-3">
          <NuxtLink
            v-if="content.buttons?.primaryLabel"
            :to="content.buttons.primaryLink || '/'"
            class="inline-flex items-center justify-center rounded-brand bg-brand-green px-6 py-3.5 text-lg font-semibold text-[#0F1508] transition hover:bg-brand-green-ink hover:text-white"
          >
            {{ content.buttons.primaryLabel }}
          </NuxtLink>
          <NuxtLink
            v-if="content.buttons?.secondaryLabel"
            :to="content.buttons.secondaryLink || '/'"
            class="inline-flex items-center justify-center rounded-brand border border-brand-line bg-white px-6 py-3.5 text-lg font-semibold text-brand-ink transition hover:border-brand-ink-3 hover:bg-brand-sand"
          >
            {{ content.buttons.secondaryLabel }}
          </NuxtLink>
        </div>

        <div v-if="proof.length" class="mt-8 flex flex-wrap gap-7 border-t border-brand-line pt-6">
          <div v-for="(item, index) in proof" :key="index" class="text-sm text-brand-ink-2">
            <b class="block text-xl tracking-tight text-brand-ink">{{ item.value }}</b>
            {{ item.label }}
          </div>
        </div>
      </div>

      <div v-if="images.length" class="grid grid-cols-2 grid-rows-[auto_auto] gap-3.5">
        <figure
          v-for="(image, index) in images"
          :key="index"
          class="m-0 overflow-hidden rounded-brand bg-white shadow-brand"
          :class="index === 0 ? 'row-span-2 h-full' : 'aspect-square'"
        >
          <NuxtImg
            :src="image.url"
            :alt="image.alt"
            class="h-full w-full object-cover"
            :loading="index === 0 ? 'eager' : 'lazy'"
            :preload="index === 0"
            sizes="sm:100vw md:640px"
          />
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BanjadoHeroProps } from './types';

const props = defineProps<BanjadoHeroProps>();

const content = computed(() => props.content ?? {});
const proof = computed(() => content.value.proof ?? []);
const images = computed(() => (content.value.images ?? []).slice(0, 3));
</script>
