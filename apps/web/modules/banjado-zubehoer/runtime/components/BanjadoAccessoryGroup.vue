<template>
  <div class="border-b border-neutral-100 last:border-b-0">
    <UiAccordionItem
      v-model="open"
      summary-class="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-left hover:bg-neutral-50 select-none"
      content-padding-class=""
      :data-testid="`accessory-group-${group.id}`"
    >
      <template #summary>
        <span>{{ group.title }}</span>
        <span class="ml-auto mr-1 text-xs font-semibold text-primary-700" data-testid="accessory-group-state">
          {{ selectionLabel }}
        </span>
      </template>

      <ul class="border-t border-neutral-100">
        <li
          v-for="item in group.items"
          :key="productGetters.getVariationId(item)"
          class="border-b border-neutral-100 last:border-b-0"
        >
          <label class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50">
            <NuxtImg
              :src="imageUrl(item)"
              :alt="''"
              :width="56"
              :height="56"
              loading="lazy"
              class="w-14 h-14 flex-none rounded-lg object-contain border border-neutral-200 bg-neutral-50"
            />
            <span class="flex-1 min-w-0">
              <span class="block text-sm">{{ productGetters.getName(item) }}</span>
              <span class="block text-xs text-neutral-500">{{ productGetters.getVariationNumber(item) }}</span>
            </span>
            <span class="flex-none text-sm font-bold">+ {{ format(getEffectivePrice(item)) }}</span>
            <SfCheckbox
              :model-value="isSelected(item)"
              :aria-label="t('banjadoAccessories.selectItem', { name: productGetters.getName(item) })"
              data-testid="accessory-item-checkbox"
              @update:model-value="toggle(group, item)"
            />
          </label>

          <!-- Mengenwaehler je Position (W2, 18.08.2026): weder fest 1 noch die Menge des
               Hauptartikels. Beispiel: 5 Pinguinmagnete zu einer Magnettafel. Erscheint erst
               mit dem Haken, damit die Liste zugeklappt ruhig bleibt. -->
          <div
            v-if="isSelected(item)"
            class="flex items-center gap-3 px-4 pb-3 pl-[4.25rem]"
            data-testid="accessory-item-quantity"
          >
            <span class="text-xs text-neutral-500">{{ t('banjadoAccessories.quantity') }}</span>
            <div class="inline-flex items-center border border-neutral-200 rounded-md bg-white">
              <button
                type="button"
                class="w-8 h-8 text-neutral-500 hover:text-neutral-900 disabled:opacity-40"
                :disabled="quantityOf(item) <= 1"
                :aria-label="t('banjadoAccessories.decrease', { name: productGetters.getName(item) })"
                @click="setQuantity(item, quantityOf(item) - 1)"
              >
                −
              </button>
              <span class="w-8 text-center text-sm tabular-nums" data-testid="accessory-item-quantity-value">
                {{ quantityOf(item) }}
              </span>
              <button
                type="button"
                class="w-8 h-8 text-neutral-500 hover:text-neutral-900"
                :aria-label="t('banjadoAccessories.increase', { name: productGetters.getName(item) })"
                @click="setQuantity(item, quantityOf(item) + 1)"
              >
                +
              </button>
            </div>
            <span v-if="quantityOf(item) > 1" class="text-xs text-neutral-500 tabular-nums">
              = {{ format(getEffectivePrice(item) * quantityOf(item)) }}
            </span>
          </div>
        </li>
      </ul>
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import { productGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';
import { SfCheckbox } from '@storefront-ui/vue';
import { getEffectivePrice } from '../utils/getEffectivePrice';
import type { BanjadoAccessoryGroupProps } from './types';

const props = defineProps<BanjadoAccessoryGroupProps>();

const { t } = useI18n();
const { format } = usePriceFormatter();
const { addModernImageExtension } = useModernImage();
const { isSelected, toggle, quantityOf, setQuantity } = useAccessorySelection();

const open = ref(false);

const selectedItems = computed(() => props.group.items.filter((item) => isSelected(item)));
const selectedTotal = computed(() =>
  selectedItems.value.reduce((total, item) => total + getEffectivePrice(item) * quantityOf(item), 0),
);

// Zugeklappt zeigt der Gruppenkopf, was drin steckt: ein Name (mit Menge) bei einem
// Haken, sonst die Anzahl der Positionen.
const selectionLabel = computed(() => {
  if (selectedItems.value.length === 0) {
    return '';
  }

  const price = format(selectedTotal.value);

  if (selectedItems.value.length === 1) {
    const item = selectedItems.value[0]!;
    const quantity = quantityOf(item);
    const name = quantity > 1 ? `${quantity}× ${productGetters.getName(item)}` : productGetters.getName(item);

    return t('banjadoAccessories.groupSelectedOne', { name, price });
  }

  return t('banjadoAccessories.groupSelectedMany', { count: selectedItems.value.length, price });
});

const imageUrl = (item: Product) => addModernImageExtension(productGetters.getPreviewImage(item));
</script>
