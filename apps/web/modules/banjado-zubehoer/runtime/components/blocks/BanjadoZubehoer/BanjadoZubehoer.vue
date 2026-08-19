<template>
  <!-- Block-Huelle um den Zubehoer-Kasten, damit er im Editor als Block auf der
       Produktseite platziert, verschoben und entfernt werden kann. Die ganze
       Logik lebt in BanjadoAccessories.
       Achtung: content darf nie leer sein - Bloecke ohne content filtert
       useBlocksVisibility als "ohne Inhalt" komplett aus. -->
  <BanjadoAccessories :title="props.content?.text?.title" :hint="props.content?.text?.hint" />
</template>

<script setup lang="ts">
import type { BanjadoZubehoerProps } from './types';

const props = defineProps<BanjadoZubehoerProps>();
</script>
