<template>
  <div
    v-if="visible"
    class="fixed inset-x-0 bottom-[3.9rem] z-sticky flex items-center gap-3 border-t border-brand-line bg-white px-4 py-2.5 shadow-brand-lg @md:hidden"
    data-testid="banjado-sticky-buy"
  >
    <NuxtImg
      v-if="image"
      :src="image"
      :alt="name"
      width="44"
      height="44"
      loading="lazy"
      class="h-11 w-11 flex-none rounded-brand-sm bg-brand-sand object-cover"
    />
    <span class="text-lg font-bold tabular-nums text-brand-ink" data-testid="banjado-sticky-buy-price">
      {{ format(price) }}
    </span>
    <UiButton
      type="button"
      class="flex-1"
      :disabled="loading"
      data-testid="banjado-sticky-buy-button"
      @click="submitPurchaseCard"
    >
      <template #prefix>
        <SfIconShoppingCart size="sm" />
      </template>
      {{ t('common.actions.addToCart') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { productGetters } from '@plentymarkets/shop-api';
import { SfIconShoppingCart } from '@storefront-ui/vue';
import type { BanjadoStickyBuyProps } from './blocks/PriceCard/types';

/**
 * Mobiler Kaufbalken nach Prototyp v2 (.stickybuy): Bild, Preis, "In den Warenkorb".
 * Sitzt fest ueber der NavbarBottom und erscheint nur, wenn der Kaufknopf der Kauf-Box
 * aus dem Sichtfenster ist - sonst gaebe es zwei Knoepfe. Ab @md (Tablet/Desktop) ist
 * die Kauf-Box selbst sticky, der Balken bleibt per Container-Query weg. Im Editor nie.
 *
 * bottom-[3.9rem] = Hoehe der NavbarBottom, derselbe Wert wie in
 * app/components/Cookiebar/Cookiebar.vue (@max-md:bottom-[3.9rem]); ein Token dafuer
 * gibt es in tailwind.config.ts noch nicht.
 */

/** Formular der Kauf-Box, app/components/ui/PurchaseCard/PurchaseCard.vue. */
const PURCHASE_CARD_FORM_SELECTOR = 'form[data-testid="purchase-card"]';
/** Kaufknopf in der Kauf-Box; solange er zu sehen ist, braucht es keinen zweiten. */
const ADD_TO_CART_BUTTON_SELECTOR = '[data-testid="add-to-cart"]';

const props = defineProps<BanjadoStickyBuyProps>();

const { isInEditor } = useEditorState();
const { format } = usePriceFormatter();
const { loading } = useCart();
const { getPropertiesPrice } = useProductOrderProperties();
const { addModernImageExtension } = useModernImage();

// Auf dem Server und bis zum ersten Messwert gilt der Knopf als sichtbar: so rendert
// SSR nichts, die Hydration passt, und der Balken blendet erst nach dem Messen ein.
const buttonInViewport = ref(true);

const salable = computed(() => productGetters.isSalable(props.product));
const visible = computed(() => !isInEditor.value && !buttonInViewport.value && salable.value);

const name = computed(() => productGetters.getName(props.product));
const image = computed(() => addModernImageExtension(productGetters.getCoverImagePreview(props.product)));

// Einzelpreis samt Aufschlaegen aus Bestelleigenschaften, wie der Preis in der Kauf-Box.
// Menge und Staffelpreis kennt nur die Kauf-Box selbst; der Balken zeigt den Stueckpreis.
const price = computed(
  () =>
    (productGetters.getSpecialOffer(props.product) || productGetters.getPrice(props.product) || 0) +
    getPropertiesPrice(props.product),
);

let observer: IntersectionObserver | null = null;

const stopObserving = () => {
  observer?.disconnect();
  observer = null;
};

const observe = (anchor: HTMLElement | null) => {
  stopObserving();

  if (!anchor || !('IntersectionObserver' in globalThis)) {
    return;
  }

  // Beobachtet wird der Kaufknopf; gibt es ihn (noch) nicht, die ganze Kauf-Box.
  const target = anchor.querySelector<HTMLElement>(ADD_TO_CART_BUTTON_SELECTOR) ?? anchor;

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry) {
        buttonInViewport.value = entry.isIntersecting;
      }
    },
    { threshold: 0 },
  );
  observer.observe(target);
};

// Der Anker kommt erst nach dem ersten Render der Kauf-Box herein, deshalb ein watch.
watch(() => props.anchor, observe, { immediate: true });
onBeforeUnmount(stopObserving);

// requestSubmit statt submit(): so laufen Browser-Pflichtfeldpruefung, das @submit der
// Kauf-Box (Varianten, Bestelleigenschaften, Warenkorb) und das Zubehoer-Plugin genau wie
// beim echten Knopf.
const submitPurchaseCard = () => {
  const form = props.anchor?.querySelector<HTMLFormElement>(PURCHASE_CARD_FORM_SELECTOR);
  form?.requestSubmit();
};
</script>
