<!-- @overrides-core-block -->
<template>
  <section ref="cardRef" class="grid-in-left-top @md:h-full">
    <UiPurchaseCard :product="currentProduct" :configuration="content" />
    <BanjadoStickyBuy v-if="showStickyBuy" :product="currentProduct" :anchor="cardRef" />
  </section>
</template>

<script setup lang="ts">
import type { PriceCardProps } from '~/components/blocks/PriceCard/types';

/**
 * Override des Kern-Blocks app/components/blocks/PriceCard/PriceCard.vue: gleicher Inhalt
 * (UiPurchaseCard) plus der mobile Kaufbalken BanjadoStickyBuy, der einblendet, sobald der
 * Kaufknopf der Kauf-Box aus dem Sichtfenster gescrollt ist. Der Balken haengt an der
 * Kauf-Box und nicht am Layout, damit er auf jeder Produktseiten-Vorlage mitkommt.
 * Bei Upstream-Aenderungen an PriceCard.vue hier nachziehen.
 */
const props = defineProps<PriceCardProps>();
const { currentProduct } = useProducts();

const cardRef = ref<HTMLElement | null>(null);

// Ohne Kaufknopf in der Kauf-Box gibt es nichts, was der Balken ausloesen koennte.
const showStickyBuy = computed(() => props.content?.fields?.quantityAndAddToCart !== false);
</script>
