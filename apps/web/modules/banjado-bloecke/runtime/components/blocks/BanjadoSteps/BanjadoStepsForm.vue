<template>
  <div>
    <EditorFormPanel v-model="open" title="Schritte" data-testid="banjado-steps-form">
      <div class="py-2">
        <UiFormLabel>Zeile über den Schritten</UiFormLabel>
        <SfInput v-model="stepsContent.text.eyebrow" type="text" />
      </div>
      <div v-for="(step, index) in stepsContent.steps" :key="index" class="border-t border-gray-200 py-2">
        <UiFormLabel>Schritt {{ index + 1 }} — Titel</UiFormLabel>
        <SfInput v-model="step.title" type="text" />
        <UiFormLabel class="mt-2">Schritt {{ index + 1 }} — Text</UiFormLabel>
        <textarea v-model="step.text" rows="2" class="w-full rounded-md border border-gray-300 p-2 text-sm" />
      </div>
    </EditorFormPanel>
  </div>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import type { BanjadoStepsProps, BanjadoStepsContent } from './types';

const open = ref(true);

const props = defineProps<BanjadoStepsProps>();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();

const stepsContent = computed<BanjadoStepsContent>(() => {
  const uuid = props.meta?.uuid || blockUuid.value;
  const content = (findOrDeleteBlockByUuid(data.value, uuid)?.content ?? {}) as Partial<BanjadoStepsContent>;

  content.text = { eyebrow: '', ...content.text };
  if (!content.steps) content.steps = [];

  return content as BanjadoStepsContent;
});
</script>
