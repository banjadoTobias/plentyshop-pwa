<template>
  <div v-for="(group, groupIndex) in orderPropertiesGroups" :key="`group-${groupIndex}`" class="mt-5 mb-4">
    <div class="font-semibold">
      {{ productPropertyGetters.getOrderPropertyGroupName(group) }}
    </div>

    <div class="font-normal typography-text-sm mb-2">
      {{ productPropertyGetters.getOrderPropertyGroupDescription(group) }}
    </div>

    <div
      v-for="(productProperty, propIndex) in visibleOrderProperties(group)"
      :key="`group-prop-${propIndex}`"
      class="mt-2 flex items-center"
    >
      <!-- ClientOnly until fixed: https://github.com/nuxt/nuxt/issues/23768#issuecomment-1849023053 -->
      <Component
        :is="componentsMapper[productPropertyGetters.getOrderPropertyValueType(productProperty)]"
        v-if="componentsMapper[productPropertyGetters.getOrderPropertyValueType(productProperty)]"
        :has-tooltip="hasTooltip"
        :product-property="productProperty"
      >
        <template v-if="productPropertyGetters.hasOrderPropertyDescription(productProperty)" #tooltip>
          <SfTooltip
            :label="productPropertyGetters.getOrderPropertyDescription(productProperty)"
            :placement="'bottom'"
            :show-arrow="true"
            class="ml-2 z-dropdown"
          >
            <SfIconInfo :size="'sm'" />
          </SfTooltip>
        </template>
      </Component>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Kopie von app/components/OrderProperties/OrderProperties.vue.
 *
 * Ueberschrieben wird OrderProperties und nicht OrderPropertyFileUpload: die
 * Kern-Datei importiert die Upload-Komponente statisch und referenziert die
 * Import-Bindung direkt im Mapper. An dieser Bindung kommt die
 * Auto-Import-Registry nicht vorbei, ein components:extend auf
 * OrderPropertyFileUpload bliebe wirkungslos. OrderProperties selbst wird in
 * PurchaseCard.vue per Auto-Import verwendet — dort greift der Austausch.
 *
 * Gegenueber dem Original geaendert: der Mapper-Eintrag "file" und die
 * Sichtbarkeit der beiden Vorschau-Felder, die das Upload-Modul selbst rendert.
 */
import { productPropertyGetters } from '@plentymarkets/shop-api';
import type { OrderPropertiesGroup } from '@plentymarkets/shop-api';
import type { ComponentsMapper, OrderPropertiesProps } from '~/components/OrderProperties/types';
import OrderPropertyInput from '~/components/OrderPropertyInput/OrderPropertyInput.vue';
import OrderPropertySelect from '~/components/OrderPropertySelect/OrderPropertySelect.vue';
import OrderPropertyCheckbox from '~/components/OrderPropertyCheckbox/OrderPropertyCheckbox.vue';
import BanjadoMotivUpload from './BanjadoMotivUpload.vue';
import { SfIconInfo, SfTooltip } from '@storefront-ui/vue';
import { planMotivUpload } from '../utils/order-property-plan';

const props = defineProps<OrderPropertiesProps>();
const orderPropertiesGroups = computed(() => productPropertyGetters.getOrderPropertiesGroups(props.product));
const hasTooltip = productPropertyGetters.hasOrderPropertiesGroupsTooltips(orderPropertiesGroups.value);
const componentsMapper: ComponentsMapper = {
  empty: OrderPropertyCheckbox,
  int: OrderPropertyInput,
  text: OrderPropertyInput,
  float: OrderPropertyInput,
  selection: OrderPropertySelect,
  file: BanjadoMotivUpload,
};

const hiddenPropertyIds = computed(() => {
  const orderPropertyIds = Object.values(orderPropertiesGroups.value).flatMap((group) =>
    group.orderProperties.map((productProperty) => productPropertyGetters.getOrderPropertyId(productProperty)),
  );

  return planMotivUpload(orderPropertyIds).hiddenPropertyIds;
});

const visibleOrderProperties = (group: OrderPropertiesGroup) =>
  group.orderProperties.filter(
    (productProperty) => !hiddenPropertyIds.value.includes(productPropertyGetters.getOrderPropertyId(productProperty)),
  );
</script>
