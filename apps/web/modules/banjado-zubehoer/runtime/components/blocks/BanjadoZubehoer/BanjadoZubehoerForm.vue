<template>
  <div class="mx-5 my-2 rounded-md border border-[#BBC6BE] bg-[#FEDCA5] px-4 py-3 text-sm shadow-md">
    Dieser Block zeigt das in Plenty gepflegte Cross-Selling vom Typ „Zubehör" des
    aktuellen Artikels. Gepflegt wird er in Plenty am Artikel, nicht hier im Editor.
  </div>
</template>

<script setup lang="ts">
import type { BanjadoZubehoerProps } from './types';

defineProps<BanjadoZubehoerProps>();
</script>
