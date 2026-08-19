<template>
  <div>
    <EditorFormPanel v-model="textOpen" title="Text" data-testid="banjado-hero-form">
      <div class="py-2">
        <UiFormLabel>Zeile über der Überschrift</UiFormLabel>
        <SfInput v-model="heroContent.text.eyebrow" type="text" data-testid="hero-input-eyebrow" />
      </div>
      <div class="py-2">
        <UiFormLabel>Überschrift (HTML, &lt;em&gt; färbt grün)</UiFormLabel>
        <SfInput v-model="heroContent.text.titleHtml" type="text" data-testid="hero-input-title" />
      </div>
      <div class="py-2">
        <UiFormLabel>Einleitung</UiFormLabel>
        <textarea
          v-model="heroContent.text.lead"
          rows="3"
          class="w-full rounded-md border border-gray-300 p-2 text-sm"
          data-testid="hero-input-lead"
        />
      </div>
    </EditorFormPanel>

    <EditorFormPanel v-model="buttonsOpen" title="Knöpfe" data-testid="banjado-hero-form-buttons">
      <div class="py-2">
        <UiFormLabel>Erster Knopf — Beschriftung</UiFormLabel>
        <SfInput v-model="heroContent.buttons.primaryLabel" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Erster Knopf — Link</UiFormLabel>
        <SfInput v-model="heroContent.buttons.primaryLink" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Zweiter Knopf — Beschriftung</UiFormLabel>
        <SfInput v-model="heroContent.buttons.secondaryLabel" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Zweiter Knopf — Link</UiFormLabel>
        <SfInput v-model="heroContent.buttons.secondaryLink" type="text" />
      </div>
    </EditorFormPanel>

    <div class="mx-5 mb-0 mt-1 rounded-md border border-[#BBC6BE] bg-[#FEDCA5] px-4 py-3 text-sm shadow-md">
      Kennzahlen und Bilder pflegt der Agent im Block-Inhalt — kurze Nachricht genügt.
    </div>
  </div>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import type { BanjadoHeroProps, BanjadoHeroContent } from './types';

const textOpen = ref(true);
const buttonsOpen = ref(true);

const props = defineProps<BanjadoHeroProps>();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();

const heroContent = computed<BanjadoHeroContent>(() => {
  const uuid = props.meta?.uuid || blockUuid.value;
  const content = (findOrDeleteBlockByUuid(data.value, uuid)?.content ?? {}) as Partial<BanjadoHeroContent>;

  content.text = { eyebrow: '', titleHtml: '', lead: '', ...content.text };
  content.buttons = { primaryLabel: '', primaryLink: '', secondaryLabel: '', secondaryLink: '', ...content.buttons };

  return content as BanjadoHeroContent;
});
</script>
