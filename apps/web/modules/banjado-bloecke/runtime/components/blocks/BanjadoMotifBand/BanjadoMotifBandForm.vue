<template>
  <div>
    <EditorFormPanel v-model="open" title="Text" data-testid="banjado-motif-band-form">
      <div class="py-2">
        <UiFormLabel>Zeile über der Überschrift</UiFormLabel>
        <SfInput v-model="bandContent.text.eyebrow" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Überschrift (HTML)</UiFormLabel>
        <SfInput v-model="bandContent.text.titleHtml" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Beschreibung</UiFormLabel>
        <textarea v-model="bandContent.text.description" rows="3" class="w-full rounded-md border border-gray-300 p-2 text-sm" />
      </div>
      <div class="py-2">
        <UiFormLabel>Knopf — Beschriftung</UiFormLabel>
        <SfInput v-model="bandContent.button.label" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Knopf — Link</UiFormLabel>
        <SfInput v-model="bandContent.button.link" type="text" />
      </div>
    </EditorFormPanel>

    <div class="mx-5 mb-0 mt-1 rounded-md border border-[#BBC6BE] bg-[#FEDCA5] px-4 py-3 text-sm shadow-md">
      Motivwand und Themen-Chips pflegt der Agent aus bilder.json — kurze Nachricht genügt.
    </div>
  </div>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import type { BanjadoMotifBandProps, BanjadoMotifBandContent } from './types';

const open = ref(true);

const props = defineProps<BanjadoMotifBandProps>();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();

const bandContent = computed<BanjadoMotifBandContent>(() => {
  const uuid = props.meta?.uuid || blockUuid.value;
  const content = (findOrDeleteBlockByUuid(data.value, uuid)?.content ?? {}) as Partial<BanjadoMotifBandContent>;

  content.text = { eyebrow: '', titleHtml: '', description: '', ...content.text };
  content.button = { label: '', link: '', ...content.button };

  return content as BanjadoMotifBandContent;
});
</script>
