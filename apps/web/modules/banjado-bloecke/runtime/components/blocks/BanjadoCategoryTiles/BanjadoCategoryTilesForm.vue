<template>
  <div>
    <EditorFormPanel v-model="open" title="Kacheln" data-testid="banjado-category-tiles-form">
      <div class="py-2">
        <UiFormLabel>Zeile über der Überschrift</UiFormLabel>
        <SfInput v-model="tilesContent.text.eyebrow" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Überschrift</UiFormLabel>
        <SfInput v-model="tilesContent.text.title" type="text" />
      </div>
      <div v-for="(tile, index) in tilesContent.tiles" :key="index" class="border-t border-gray-200 py-2">
        <UiFormLabel>Kachel {{ index + 1 }} — Beschriftung</UiFormLabel>
        <SfInput v-model="tile.label" type="text" />
        <UiFormLabel class="mt-2">Kachel {{ index + 1 }} — Link</UiFormLabel>
        <SfInput v-model="tile.link" type="text" />
        <UiFormLabel class="mt-2">Kachel {{ index + 1 }} — Bild-URL</UiFormLabel>
        <SfInput v-model="tile.image" type="text" />
      </div>
    </EditorFormPanel>
  </div>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import type { BanjadoCategoryTilesProps, BanjadoCategoryTilesContent } from './types';

const open = ref(true);

const props = defineProps<BanjadoCategoryTilesProps>();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();

const tilesContent = computed<BanjadoCategoryTilesContent>(() => {
  const uuid = props.meta?.uuid || blockUuid.value;
  const content = (findOrDeleteBlockByUuid(data.value, uuid)?.content ?? {}) as Partial<BanjadoCategoryTilesContent>;

  content.text = { eyebrow: '', title: '', ...content.text };
  if (!content.tiles) content.tiles = [];

  return content as BanjadoCategoryTilesContent;
});
</script>
