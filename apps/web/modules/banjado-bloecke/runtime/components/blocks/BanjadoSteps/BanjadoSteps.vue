<template>
  <section class="mx-auto max-w-[1280px] px-4 py-9 @md:px-6 @md:py-14" data-testid="banjado-steps">
    <p v-if="content.text?.eyebrow" class="text-xs font-bold uppercase tracking-[0.09em] text-brand-ink-3">
      {{ content.text.eyebrow }}
    </p>
    <div class="mt-6 grid grid-cols-1 gap-4 @md:grid-cols-3">
      <div v-for="(step, index) in steps" :key="index" class="rounded-brand border border-brand-line bg-white p-6">
        <div
          class="mb-4 grid h-[34px] w-[34px] place-items-center rounded-full bg-brand-green-ink text-[15px] font-bold text-white"
        >
          {{ index + 1 }}
        </div>
        <h3 class="mb-1.5 text-lg font-semibold text-brand-ink">{{ step.title }}</h3>
        <p class="text-sm text-brand-ink-2">{{ step.text }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BanjadoStepsProps } from './types';

const props = defineProps<BanjadoStepsProps>();

const content = computed(() => props.content ?? {});
const steps = computed(() => content.value.steps ?? []);
</script>
