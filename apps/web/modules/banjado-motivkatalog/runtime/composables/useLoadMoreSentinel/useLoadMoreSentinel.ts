import { LOAD_MORE_ROOT_MARGIN } from '../../config/constants';
import type { UseLoadMoreSentinelOptions } from './types';

/**
 * @description Beobachtet ein Element unter dem Raster und ruft onLoadMore, sobald es in die
 * Naehe des sichtbaren Bereichs kommt. Ohne IntersectionObserver passiert nichts — dann bleibt
 * der sichtbare Knopf. Nach jedem Nachladen wird neu beobachtet, weil der Observer nur beim
 * Wechsel sichtbar/unsichtbar feuert und ein Sentinel auf grossen Bildschirmen sichtbar bleibt.
 * @param options Ziel, Schalter, Ausloeser
 * @example
 * ``` ts
 * useLoadMoreSentinel({ target: sentinel, enabled: hasMore, refreshKey: shownCount, onLoadMore: loadMore });
 * ```
 */
export const useLoadMoreSentinel = (options: UseLoadMoreSentinelOptions) => {
  let observer: IntersectionObserver | null = null;

  const observe = () => {
    const element = options.target.value;

    if (!observer || !element) {
      return;
    }

    observer.unobserve(element);
    observer.observe(element);
  };

  onMounted(() => {
    if (!('IntersectionObserver' in globalThis)) {
      return;
    }

    observer = new globalThis.IntersectionObserver(
      (entries) => {
        if (options.enabled.value && entries.some((entry) => entry.isIntersecting)) {
          options.onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: options.rootMargin ?? LOAD_MORE_ROOT_MARGIN,
        threshold: 0,
      },
    );

    observe();
  });

  watch([options.target, options.refreshKey], async () => {
    await nextTick();
    observe();
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });
};
