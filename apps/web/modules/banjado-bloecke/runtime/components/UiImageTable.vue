<template>
  <div class="flex flex-col" data-testid="ui-image-table">
    <SfInput
      v-model="search"
      size="sm"
      placeholder="Search file or path..."
      wrapper-class="mb-5"
      data-testid="image-table-search"
    >
      <template #prefix>
        <SfIconSearch class="text-gray-500" />
      </template>
    </SfInput>

    <div v-if="loading" class="flex min-h-72 items-center justify-center">
      <SfLoaderCircular size="2xl" class="text-gray-400" />
    </div>

    <template v-else>
      <div class="overflow-x-auto rounded-md border border-gray-300">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th v-for="header in headers" :key="header.key" scope="col" class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 hover:text-gray-900"
                  :data-testid="`image-table-sort-${header.key}`"
                  @click="toggleSort(header.key)"
                >
                  {{ header.title }}
                  <span v-if="sortKey === header.key" aria-hidden="true">
                    {{ sortDirection === SORT_ASC ? '&#9650;' : '&#9660;' }}
                  </span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="visibleItems.length === 0">
              <td :colspan="headers.length" class="px-4 py-6 text-center text-gray-500" data-testid="image-table-empty">
                No images or folders found
              </td>
            </tr>
            <template v-for="item in visibleItems" :key="item.key">
              <UiImageTableSkeleton v-if="item.storageClass === UPLOADING_CLASS" />
              <tr
                v-else
                class="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                :class="{ 'bg-brand-green-tint': item.key === props.selectedKey }"
                data-testid="image-table-row"
                @click="onRowClick(item)"
              >
                <td class="px-4 py-2">
                  <div class="flex items-center gap-2">
                    <NuxtImg
                      data-testid="image-table-thumbnail"
                      :src="item.previewUrl || item.publicUrl"
                      alt="table thumbnail"
                      loading="lazy"
                      class="h-8 w-8 rounded object-cover"
                    />
                    <span data-testid="image-table-file-name">{{ item.fileName }}</span>
                  </div>
                </td>
                <td class="px-4 py-2" data-testid="image-table-path">{{ item.path }}</td>
                <td class="whitespace-nowrap px-4 py-2" data-testid="image-table-size">{{ bytesToMB(item.size) }}</td>
                <td class="whitespace-nowrap px-4 py-2" data-testid="image-table-last-modified">
                  {{ formatDate(item.lastModified) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="hiddenCount > 0" class="mt-3 flex items-center justify-between text-sm text-gray-600">
        <span>Showing {{ visibleItems.length }} of {{ sortedItems.length }}</span>
        <button
          type="button"
          class="rounded-md border border-editor-button px-3 py-1 text-editor-button hover:bg-gray-50"
          data-testid="image-table-show-more"
          @click="showMore"
        >
          Show more
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { StorageObject } from '@plentymarkets/shop-api';
import { SfIconSearch, SfInput, SfLoaderCircular } from '@storefront-ui/vue';

/**
 * Ersatz fuer app/components/ui/ImageTable/ImageTable.vue (Editor-Bildwaehler) ohne
 * Vuetify: gleiche Props, Emits und data-testids, dieselben Composables. Statt VDataTable
 * eine schlichte Tabelle mit Sortieren per Spaltenklick und "Show more" statt Seitenzahlen.
 * Editor-Oberflaeche, daher englische Texte wie im Kern.
 */

/** Zeilen je Klick auf "Show more"; Vuetify blaetterte in Zehnerschritten. */
const ROWS_PER_STEP = 25;
const SORT_ASC = 'asc';
const SORT_DESC = 'desc';
/** Spaltenschluessel aus useItemsTable().headers, fuer die nicht alphabetisch sortiert wird. */
const SIZE_COLUMN = 'size';
const LAST_MODIFIED_COLUMN = 'lastModified';
const PATH_COLUMN = 'path';

const { data: items, loading, headers, bytesToMB, formatDate, getStorageMetadata } = useItemsTable();

const { setMetadata } = useImageMetadata();
const lastFetchedKey = ref<string | null>(null);

const props = defineProps<{
  selectedKey: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:selectedKey', value: string | null): void;
  (e: 'select', item: { name: string; image: string }): void;
  (e: 'unselect'): void;
}>();

const fetchMetadata = async (key: string) => {
  const data = await getStorageMetadata(key);
  if (data && data.width && data.height) {
    setMetadata(key, { width: data.width, height: data.height });
  }
};

watch(
  () => props.selectedKey,
  (key) => {
    if (!key || key === lastFetchedKey.value) {
      return;
    }

    const row = items.value.find((item) => item.key === key);
    if (!row || row.storageClass === UPLOADING_CLASS) {
      return;
    }

    lastFetchedKey.value = key;

    emit('select', { name: row.key, image: row.publicUrl });
    fetchMetadata(key);
  },
);

const search = ref('');
const sortKey = ref<string | null>(null);
const sortDirection = ref<'asc' | 'desc'>(SORT_ASC);
const visibleCount = ref(ROWS_PER_STEP);

const itemsWithPath = computed(() =>
  items.value
    .filter((item: StorageObject) => !item.key.endsWith('/'))
    .map((item: StorageObject) => {
      const lastSlash = item.key.lastIndexOf('/');
      return {
        ...item,
        fileName: lastSlash >= 0 ? item.key.slice(lastSlash + 1) : item.key,
        path: lastSlash >= 0 ? item.key.slice(0, lastSlash + 1) : '',
      };
    }),
);

const filteredItems = computed(() => {
  if (!search.value) {
    return itemsWithPath.value;
  }
  const needle = search.value.toLowerCase();
  return itemsWithPath.value.filter(
    (item) => item.fileName.toLowerCase().includes(needle) || item.path.toLowerCase().includes(needle),
  );
});

const sortValue = (item: StorageObject & { fileName: string; path: string }, key: string): string | number => {
  switch (key) {
    case SIZE_COLUMN: {
      return Number(item.size) || 0;
    }
    case LAST_MODIFIED_COLUMN: {
      return new Date(item.lastModified).getTime() || 0;
    }
    case PATH_COLUMN: {
      return item.path.toLowerCase();
    }
    default: {
      return item.fileName.toLowerCase();
    }
  }
};

const compareValues = (a: string | number, b: string | number) => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b));
};

const sortedItems = computed(() => {
  const list = filteredItems.value;
  const key = sortKey.value;
  if (!key) {
    return list;
  }

  const factor = sortDirection.value === SORT_ASC ? 1 : -1;
  // Laufende Uploads bleiben oben, egal wie sortiert wird.
  const uploading = list.filter((item) => item.storageClass === UPLOADING_CLASS);
  const rest = list
    .filter((item) => item.storageClass !== UPLOADING_CLASS)
    .sort((a, b) => compareValues(sortValue(a, key), sortValue(b, key)) * factor);

  return [...uploading, ...rest];
});

const visibleItems = computed(() => sortedItems.value.slice(0, visibleCount.value));
const hiddenCount = computed(() => Math.max(sortedItems.value.length - visibleCount.value, 0));

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === SORT_ASC ? SORT_DESC : SORT_ASC;
    return;
  }
  sortKey.value = key;
  sortDirection.value = SORT_ASC;
};

const showMore = () => {
  visibleCount.value += ROWS_PER_STEP;
};

watch(search, () => {
  visibleCount.value = ROWS_PER_STEP;
});

const onRowClick = (item: StorageObject) => {
  emit('update:selectedKey', item.key);
  emit('select', {
    name: item.key,
    image: item.publicUrl,
  });
  fetchMetadata(item.key);
};
</script>
