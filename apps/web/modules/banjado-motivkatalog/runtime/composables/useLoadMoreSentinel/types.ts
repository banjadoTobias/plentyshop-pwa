import type { Ref } from 'vue';

export interface UseLoadMoreSentinelOptions {
  /** Das unsichtbare Element unter dem Raster. */
  target: Ref<HTMLElement | null>;
  /** Nur solange noch etwas nachzuladen ist. */
  enabled: Ref<boolean>;
  /** Aendert sich dieser Wert, wird neu beobachtet — sonst feuert ein sichtbar gebliebener Sentinel nie wieder. */
  refreshKey: Ref<number>;
  onLoadMore: () => void;
  rootMargin?: string;
}
