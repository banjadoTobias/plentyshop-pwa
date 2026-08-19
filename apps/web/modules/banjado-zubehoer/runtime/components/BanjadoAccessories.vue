<template>
  <div ref="blockRef">
    <section
      v-if="groups.length > 0"
      class="mt-4 border border-neutral-200 rounded-xl bg-white overflow-hidden"
      data-testid="banjado-accessories"
    >
      <div class="flex items-center gap-2.5 px-4 py-3.5 bg-neutral-50 border-b border-neutral-100">
        <SfIconPackage size="sm" class="text-primary-700" />
        <span class="font-bold">{{ props.title || t('banjadoAccessories.title') }}</span>
        <span class="ml-auto text-sm text-neutral-500">{{ props.hint || t('banjadoAccessories.hint') }}</span>
      </div>

      <BanjadoAccessoryGroup v-for="group in groups" :key="group.id" :group="group" />

      <div class="flex items-center gap-3 px-4 py-3 bg-primary-50 border-t border-primary-100">
        <span class="text-sm" data-testid="accessory-summary-note">{{ summaryNote }}</span>
        <span class="ml-auto text-lg font-bold" data-testid="accessory-summary-total">{{ format(total) }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { SfIconPackage } from '@storefront-ui/vue';
import { getEffectivePrice } from '../utils/getEffectivePrice';
import { groupAccessories } from '../utils/groupAccessories';
import type { BanjadoAccessoriesProps } from './types';

const props = defineProps<BanjadoAccessoriesProps>();

const { t } = useI18n();
const { format } = usePriceFormatter();
const { currentProduct } = useProducts();
const { products, selectedProducts, accessoriesTotal, fetchAccessories } = useAccessorySelection();

const blockRef = ref<HTMLElement | null>(null);
const { isNearViewport } = useNearViewport(blockRef, {
  rootMargin: '200px 0px 200px 0px',
  once: true,
});

const product = computed(() => props.product ?? currentProduct.value);

const groups = computed(() => groupAccessories(products.value, t('banjadoAccessories.fallbackGroup')));

const total = computed(() => getEffectivePrice(product.value) + accessoriesTotal.value);

const summaryNote = computed(() =>
  selectedProducts.value.length > 0
    ? t('banjadoAccessories.someSelected', {
        count: selectedProducts.value.length,
        price: format(accessoriesTotal.value),
      })
    : t('banjadoAccessories.noneSelected'),
);

// Erst laden, wenn der Kasten in die Naehe des Sichtfensters kommt - dasselbe Muster wie
// beim Standardblock fuer empfohlene Artikel.
watch(
  [isNearViewport, product],
  async ([visible]) => {
    if (visible) {
      await fetchAccessories(product.value);
    }
  },
  { immediate: true },
);
</script>
