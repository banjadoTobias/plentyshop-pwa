<template>
  <section class="border-y border-[#DCEACB] bg-brand-green-tint" data-testid="banjado-trust">
    <div class="mx-auto grid max-w-[1280px] grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 md:px-6 lg:grid-cols-4 lg:gap-6">
      <div v-for="(item, index) in items" :key="index" class="flex items-start gap-3">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
          class="mt-0.5 flex-none text-brand-green-ink"
          aria-hidden="true"
        >
          <template v-if="item.icon === 'shield'">
            <path d="M12 3l7 3v6c0 4-3 7.4-7 9-4-1.6-7-5-7-9V6l7-3Z" />
            <path d="m9 12 2 2 4-4" />
          </template>
          <template v-else-if="item.icon === 'truck'">
            <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
            <circle cx="7" cy="17" r="1.8" />
            <circle cx="17" cy="17" r="1.8" />
          </template>
          <template v-else-if="item.icon === 'return'">
            <path d="M4 12a8 8 0 1 1 2.6 5.9" />
            <path d="M4 20v-5h5" />
          </template>
          <template v-else>
            <path d="M12 3.5 14.6 9l6 .8-4.4 4.2 1.1 6-5.3-2.9L6.7 20l1.1-6L3.4 9.8 9.4 9Z" />
          </template>
        </svg>
        <div>
          <b class="block text-sm font-semibold text-brand-ink">{{ item.title }}</b>
          <span class="text-[13px] text-brand-ink-2">{{ item.text }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BanjadoTrustProps } from './types';

const props = defineProps<BanjadoTrustProps>();

const items = computed(() => props.content?.items ?? []);
</script>
