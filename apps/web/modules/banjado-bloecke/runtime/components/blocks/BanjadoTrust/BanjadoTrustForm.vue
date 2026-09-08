<template>
  <div>
    <EditorFormPanel v-model="open" title="Einträge" data-testid="banjado-trust-form">
      <div
        v-for="(item, index) in trustContent.items"
        :key="index"
        class="border-b border-gray-200 py-2 last:border-b-0"
      >
        <UiFormLabel>Eintrag {{ index + 1 }} — Titel</UiFormLabel>
        <SfInput v-model="item.title" type="text" />
        <UiFormLabel class="mt-2">Eintrag {{ index + 1 }} — Text</UiFormLabel>
        <SfInput v-model="item.text" type="text" />
      </div>
    </EditorFormPanel>
  </div>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import type { BanjadoTrustProps, BanjadoTrustContent } from './types';

const open = ref(true);

const props = defineProps<BanjadoTrustProps>();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();

const trustContent = computed<BanjadoTrustContent>(() => {
  const uuid = props.meta?.uuid || blockUuid.value;
  const content = (findOrDeleteBlockByUuid(data.value, uuid)?.content ?? {}) as Partial<BanjadoTrustContent>;

  if (!content.items) content.items = [];

  return content as BanjadoTrustContent;
});
</script>
