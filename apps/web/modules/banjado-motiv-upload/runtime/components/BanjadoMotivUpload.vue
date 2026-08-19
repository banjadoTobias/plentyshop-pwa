<template>
  <div class="w-full">
    <div class="flex row">
      <label :for="inputId" class="leading-5 text-sm text-zinc-900">
        {{ productPropertyGetters.getOrderPropertyName(productProperty) }}
        <span v-if="loading"> ({{ t('orderProperties.upload.uploading') }}) </span>
        <span v-if="loaded"> ({{ t('orderProperties.upload.uploaded') }}) </span>

        <template v-if="orderPropertyLabel.surchargeType">
          ({{ t('orderProperties.vat.' + orderPropertyLabel.surchargeType) }}
          {{ format(productPropertyGetters.getOrderPropertySurcharge(productProperty)) }})
        </template>
        {{ orderPropertyLabel.surchargeIndicator }}
        <template v-if="orderPropertyLabel.surchargeIndicator && orderPropertyLabel.requiredIndicator"> , </template>
        {{ orderPropertyLabel.requiredIndicator }}
      </label>
    </div>

    <!-- Weg A: eigenes Bild hochladen. Liegt offen, weil die Mehrheit ihn geht. -->
    <div v-if="!showPreviewPanel">
      <div v-if="!loaded && !loading" class="flex items-center" @drop="handleDrop" @dragover="handleDragOver">
        <input
          :id="inputId"
          ref="uploadForm"
          type="file"
          hidden
          :accept="ACCEPT_ATTRIBUTE"
          @change="handleFileUpload"
        />
        <div class="w-full">
          <div class="flex items-center">
            <UiButton
              class="w-full border-dashed border-2 flex items-center flex-col !p-5"
              variant="tertiary"
              @click="openUploadModal"
            >
              <span class="font-medium">Bild auswählen oder hierher ziehen</span>
              <span class="text-sm text-neutral-500">
                JPG, PNG oder PDF · bis {{ maxFileSizeLabel }} · wir prüfen die Auflösung sofort
              </span>
            </UiButton>
            <div v-if="hasTooltip" class="w-[28px]">
              <slot name="tooltip" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="w-full border-dashed border-2 justify-center flex p-5">
        <SfLoaderCircular class="animate-spin" size="3xl" />
      </div>

      <div v-if="loaded" class="flex items-center">
        <SfInput v-model="fileName" :wrapper-class="'w-full'" readonly>
          <template #suffix><SfIconClose @click="clearUploadedFile" /></template>
        </SfInput>
        <slot v-if="hasTooltip" name="tooltip" class="w-[28px]" />
      </div>

      <div v-if="notice" class="mt-3 rounded-md border p-3 text-sm" :class="noticeClasses">
        <span class="block font-medium">{{ notice.title }}</span>
        <span v-if="notice.fileName" class="block text-xs mt-0.5">{{ notice.fileName }}</span>
        <span class="block mt-1">{{ notice.text }}</span>
      </div>

      <p v-if="isWunschmotivProperty" class="text-xs text-neutral-500 mt-3">
        Ihr Bild wird als Motiv Nr. 10000 (Wunschmotiv) gefertigt. Der Preis bleibt gleich.
      </p>

      <!-- Der Nebenweg: klein, aber als Schalter erkennbar. Wortlaut wie in der
           Vorschau-Mail, damit der Kunde ihn wiedererkennt statt ihn zu suchen. -->
      <button
        v-if="canAssignPreview"
        type="button"
        class="text-sm font-medium text-secondary-700 underline mt-2"
        @click="openPreviewPanel"
      >
        Ich habe schon eine Vorschau von banjado
      </button>
    </div>

    <!-- Weg B: der Kunde hat die Vorschau per Mail freigegeben und ordnet sie zu. -->
    <div v-else class="border border-neutral-200 rounded-md bg-neutral-50 p-4 mt-2">
      <span class="block font-medium">Ihre Vorschau zuordnen</span>
      <p class="text-sm text-neutral-500 mt-1">
        Tragen Sie beides so ein, wie es in unserer Mail steht — dann drucken wir genau die Vorschau, die Sie
        freigegeben haben.
      </p>

      <div
        v-if="confirmationText"
        class="mt-3 rounded-md border border-positive-200 bg-positive-100 text-positive-800 p-3 text-sm"
      >
        <span class="block font-medium">{{ confirmationText }}</span>
        <span class="block mt-1">Bitte prüfen Sie kurz, ob das stimmt.</span>
      </div>

      <div class="mt-3">
        <label :for="previewNumberId" class="block text-sm font-medium mb-1">WM-Nummer</label>
        <SfInput :id="previewNumberId" v-model="previewNumber" size="lg" :wrapper-class="'w-full'" />
        <p class="text-xs text-neutral-500 mt-1">Steht in unserer Mail zur Vorschau.</p>
      </div>

      <div class="mt-3">
        <label :for="previewVersionId" class="block text-sm font-medium mb-1">Vorschau-Version</label>
        <SfInput :id="previewVersionId" v-model="previewVersion" size="lg" :wrapper-class="'w-full'" />
        <p class="text-xs text-neutral-500 mt-1">
          Ebenfalls in der Mail. Unsicher? Feld leer lassen — wir nehmen die zuletzt freigegebene Version.
        </p>
      </div>

      <button type="button" class="text-sm font-medium text-secondary-700 underline mt-3" @click="closePreviewPanel">
        Doch ein eigenes Bild hochladen
      </button>
      <p class="text-xs text-neutral-500 mt-2">
        Noch keine Vorschau? Laden Sie einfach Ihr Bild hoch — wir prüfen es vor dem Druck.
      </p>
    </div>

    <ErrorMessage as="span" name="value" class="flex text-negative-700 text-sm mt-2" />
  </div>
</template>

<script setup lang="ts">
import { SfInput, SfIconClose, SfLoaderCircular } from '@storefront-ui/vue';
import { productPropertyGetters } from '@plentymarkets/shop-api';
import type { BasketItemOrderParamsProperty } from '@plentymarkets/shop-api';
import { useForm, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import { object, string } from 'yup';
import type { BanjadoMotivUploadProps, ImageDimensions, MotivNotice, ResolutionLevel } from '../types';
import { ACCEPT_ATTRIBUTE, MAX_FILE_SIZE_BYTES, checkFile, formatFileSize, isPdf } from '../utils/file-validation';
import { checkResolution } from '../utils/resolution-check';
import {
  normalizePreviewVersion,
  normalizeWunschmotivNumber,
  previewConfirmationText,
  readPreviewLink,
} from '../utils/preview-link';
import { resolveMotivFormat } from '../config/motiv-formate';
import {
  MOTIV_UPLOAD_PROPERTY_ID,
  PREVIEW_NUMBER_PROPERTY_ID,
  PREVIEW_VERSION_PROPERTY_ID,
} from '../config/order-properties';

/**
 * Der Kern-Composable laesst fileToBase64 haengen, wenn der FileReader etwas
 * anderes als einen String liefert: das Promise wird dann weder erfuellt noch
 * abgelehnt und der Spinner dreht ewig. Deshalb hier ein hartes Zeitlimit.
 */
const UPLOAD_TIMEOUT_MS = 60_000;

const noticeStyles: Record<ResolutionLevel, string> = {
  ok: 'border-positive-200 bg-positive-100 text-positive-800',
  warn: 'border-warning-200 bg-warning-100 text-warning-800',
  bad: 'border-negative-200 bg-negative-100 text-negative-800',
};

const props = defineProps<BanjadoMotivUploadProps>();
const productProperty = props.productProperty;
const hasTooltip = props.hasTooltip;

const { format } = usePriceFormatter();
const { registerValidator, registerInvalidFields } = useValidatorAggregator('properties');
const { uploadFile, getPropertyById } = useProductOrderProperties();
const { send } = useNotification();
const route = useRoute();

const orderPropertyId = productPropertyGetters.getOrderPropertyId(productProperty);
const orderPropertyLabel = productPropertyGetters.getOrderPropertyLabel(productProperty);
const isOrderPropertyRequired = productPropertyGetters.isOrderPropertyRequired(productProperty);
const property = getPropertyById(orderPropertyId);

const inputId = `prop-${orderPropertyId}`;
const previewNumberId = `prop-${PREVIEW_NUMBER_PROPERTY_ID}`;
const previewVersionId = `prop-${PREVIEW_VERSION_PROPERTY_ID}`;
const maxFileSizeLabel = formatFileSize(MAX_FILE_SIZE_BYTES);

// Das Modul haengt am Datei-Typ, greift also auch fuer andere Datei-Eigenschaften.
// Die beiden Wege zum Wunschmotiv gehoeren aber nur an Eigenschaft 189.
const isWunschmotivProperty = orderPropertyId === MOTIV_UPLOAD_PROPERTY_ID;
const previewNumberProperty = isWunschmotivProperty ? getPropertyById(PREVIEW_NUMBER_PROPERTY_ID) : undefined;
const previewVersionProperty = isWunschmotivProperty ? getPropertyById(PREVIEW_VERSION_PROPERTY_ID) : undefined;

// Ohne die beiden Textfelder kaeme die Zuordnung nicht am Auftrag an — dann
// bieten wir Weg B gar nicht erst an, statt ins Leere zu schreiben.
const canAssignPreview = Boolean(previewNumberProperty && previewVersionProperty);

const motivFormat = resolveMotivFormat(null);

const uploadForm = ref<HTMLInputElement | null>(null);
const loaded = ref(false);
const loading = ref(false);
const notice = ref<MotivNotice | null>(null);

const initialAssignment = canAssignPreview ? readPreviewLink(route.query) : null;
const showPreviewPanel = ref(Boolean(initialAssignment));
const previewNumber = ref(initialAssignment?.wunschmotivNumber ?? '');
const previewVersion = ref(initialAssignment?.previewVersion ?? '');
const confirmationText = ref(initialAssignment ? previewConfirmationText(initialAssignment) : '');

const noticeClasses = computed(() => (notice.value ? noticeStyles[notice.value.level] : ''));

const validationSchema = toTypedSchema(
  object({
    value: string().test((value, context) => {
      if (!isOrderPropertyRequired || value) return true;

      // Eine zugeordnete Vorschau erfuellt die Pflicht genauso wie ein Upload.
      if (canAssignPreview && previewNumber.value.trim()) return true;

      return context.createError({
        message: canAssignPreview
          ? 'Bitte laden Sie ein Bild hoch oder tragen Sie Ihre WM-Nummer ein.'
          : t('error.requiredField'),
      });
    }),
  }),
);

const { defineField, validate, meta } = useForm({
  validationSchema: validationSchema,
});

registerValidator(validate);

const [fileName] = defineField('value');

const writeProperty = (target: BasketItemOrderParamsProperty | undefined, value: string) => {
  if (!target) return;
  target.property.value = value.trim() === '' ? null : value.trim();
};

const resetInput = () => {
  // Ohne dieses Zuruecksetzen feuert change nicht, wenn dieselbe Datei erneut
  // gewaehlt wird — der Kunde klickt dann und es passiert nichts.
  if (uploadForm.value) uploadForm.value.value = '';
};

const reject = (message: string) => {
  resetInput();
  send({ type: 'negative', message });
};

const uploadWithTimeout = (file: File): Promise<string | null> =>
  Promise.race([
    uploadFile(file),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), UPLOAD_TIMEOUT_MS);
    }),
  ]);

const measureImage = (file: File): Promise<ImageDimensions | null> =>
  new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    const finish = (dimensions: ImageDimensions | null) => {
      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };

    image.addEventListener('load', () => finish({ width: image.naturalWidth, height: image.naturalHeight }));
    image.addEventListener('error', () => finish(null));
    image.src = objectUrl;
  });

/**
 * Ampel gegen die bedruckbare Flaeche. Rot warnt deutlich, blockiert aber nicht
 * (Entscheidung Tobias, 18.08.2026): die Datei geht trotzdem hoch, die Manufaktur
 * sieht jede Datei vor dem Druck. PDF messen wir nicht im Browser, das prueft
 * die Manufaktur von Hand.
 */
const setNoticeForUpload = async (file: File): Promise<void> => {
  // Die Ampel rechnet gegen eine Produktflaeche. Fuer andere Datei-Eigenschaften
  // gaebe es nichts, wogegen zu rechnen waere — dort bleibt es bei Typ und Groesse.
  if (!isWunschmotivProperty) return;

  if (isPdf(file)) {
    notice.value = {
      level: 'warn',
      title: 'PDF angenommen — Auflösung prüfen wir von Hand',
      text: 'Wir sehen uns die Datei vor dem Druck an und melden uns, falls etwas fehlt.',
      fileName: file.name,
    };
    return;
  }

  const dimensions = await measureImage(file);

  if (!dimensions) {
    notice.value = {
      level: 'warn',
      title: 'Datei konnte nicht gelesen werden',
      text: 'Wir prüfen sie von Hand und melden uns, falls etwas fehlt.',
      fileName: file.name,
    };
    return;
  }

  const verdict = checkResolution(dimensions.width, dimensions.height, motivFormat);
  notice.value = { level: verdict.level, title: verdict.title, text: verdict.text, fileName: file.name };
};

const acceptFile = async (file: File | null) => {
  // Ohne diese Sperre startet jeder weitere Klick einen zweiten Upload und das
  // zuletzt zurueckgemeldete Ergebnis gewinnt — unabhaengig davon, welche Datei
  // der Kunde zuletzt gewaehlt hat.
  if (loading.value || !file || !property) return;

  const check = checkFile(file);
  if (!check.accepted) {
    notice.value = null;
    reject(check.message);
    return;
  }

  loading.value = true;

  // Nur warnen, nie blockieren (W1): die Ampel setzt den Hinweis, der Upload
  // laeuft in jedem Fall weiter.
  await setNoticeForUpload(file);

  const uploaded = await uploadWithTimeout(file);

  if (uploaded) {
    fileName.value = file.name;
    loaded.value = true;
    property.property.value = uploaded;
  } else {
    loaded.value = false;
    property.property.value = null;
    resetInput();
    send({ type: 'negative', message: t('orderProperties.upload.uploadError') });
  }

  loading.value = false;
};

const clearUploadedFile = () => {
  loaded.value = false;
  fileName.value = '';
  notice.value = null;
  resetInput();

  if (property) property.property.value = null;
};

const openUploadModal = () => {
  uploadForm.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  acceptFile(target.files?.[0] ?? null);
};

const handleDragOver = (event: Event) => {
  event.preventDefault();
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  acceptFile(event.dataTransfer?.files[0] ?? null);
};

// Immer nur ein Weg ist aktiv, damit niemand beides ausfuellt und die
// Fertigung raten muss, was gilt.
const openPreviewPanel = () => {
  clearUploadedFile();
  showPreviewPanel.value = true;
};

const closePreviewPanel = () => {
  showPreviewPanel.value = false;
  previewNumber.value = '';
  previewVersion.value = '';
  confirmationText.value = '';
};

// Im Auftrag steht die normierte Schreibweise, egal wie der Kunde tippt —
// sonst laesst sich der Mailverkehr nicht auf den Auftrag paaren. Das Eingabe-
// feld selbst bleibt unangetastet, damit ihm beim Tippen nichts umspringt.
watch(previewNumber, (value) => writeProperty(previewNumberProperty, normalizeWunschmotivNumber(value)), {
  immediate: true,
});
watch(previewVersion, (value) => writeProperty(previewVersionProperty, normalizePreviewVersion(value)), {
  immediate: true,
});

watch(
  () => meta.value,
  () => {
    registerInvalidFields(meta.value.valid, inputId, productPropertyGetters.getOrderPropertyName(productProperty));
  },
);
</script>
