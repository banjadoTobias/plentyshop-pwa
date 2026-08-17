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
const { isSelected, toggle } = useAccessorySelection();

const open = ref(false);

const selectedItems = computed(() => props.group.items.filter((item) => isSelected(item)));
const selectedTotal = computed(() => selectedItems.value.reduce((total, item) => total + getEffectivePrice(item), 0));

// Zugeklappt zeigt der Gruppenkopf, was drin steckt: ein Name bei einem Haken, sonst die Anzahl.
const selectionLabel = computed(() => {
  if (selectedItems.value.length === 0) {
    return '';
  }

  const price = format(selectedTotal.value);

  return selectedItems.value.length === 1
    ? t('banjadoAccessories.groupSelectedOne', { name: productGetters.getName(selectedItems.value[0]!), price })
    : t('banjadoAccessories.groupSelectedMany', { count: selectedItems.value.length, price });
});

const imageUrl = (item: Product) => addModernImageExtension(productGetters.getPreviewImage(item));
</script>
