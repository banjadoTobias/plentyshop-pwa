import {
  CACHE_KEY_VERSION,
  CACHE_MAX_AGE_SECONDS,
  CACHE_NAME_SOURCE,
  CACHE_STALE_MAX_AGE_SECONDS,
  MOTIV_SOURCE_FALLBACK_URL,
  MOTIV_SOURCE_TIMEOUT_MS,
  MOTIV_SOURCE_URL,
} from '../config/constants';
import { normalizeMotive, parseMotivSource } from '../utils/parseMotive';
import type { MotivCatalogWithSearch } from '../types';

const fetchSourceText = (url: string): Promise<string> =>
  $fetch<string>(url, {
    responseType: 'text',
    timeout: MOTIV_SOURCE_TIMEOUT_MS,
  });

/**
 * @description Laedt bilder.json (CDN, sonst S3) und normalisiert sie in den schlanken Katalog.
 * Beide Fassungen koennen mit einem BOM beginnen, deshalb geht der Text durch parseMotivSource
 * statt direkt durch ofetch als JSON.
 * @example
 * ``` ts
 * const catalog = await loadMotivCatalogFromSource();
 * ```
 */
export const loadMotivCatalogFromSource = async (): Promise<MotivCatalogWithSearch> => {
  let text: string;

  try {
    text = await fetchSourceText(MOTIV_SOURCE_URL);
  } catch (error) {
    console.warn('[banjado-motivkatalog] CDN-Quelle nicht erreichbar, weiche auf S3 aus', error);
    text = await fetchSourceText(MOTIV_SOURCE_FALLBACK_URL);
  }

  return normalizeMotive(parseMotivSource(text));
};

/**
 * Gecachter Stand der Quelle, geteilt von Katalog- und Suchroute. swr: nach Ablauf von maxAge
 * bekommt der Aufrufer sofort den alten Stand und Nitro laedt im Hintergrund nach; scheitert
 * das Nachladen, bleibt der alte Stand bis staleMaxAge gueltig. Nur ohne jeden Stand (Kaltstart
 * bei toter Quelle) wirft der Aufruf. In Produktion liegt der Cache im Speicher der Instanz.
 */
export const getMotivCatalog = defineCachedFunction(loadMotivCatalogFromSource, {
  name: CACHE_NAME_SOURCE,
  getKey: () => CACHE_KEY_VERSION,
  maxAge: CACHE_MAX_AGE_SECONDS,
  staleMaxAge: CACHE_STALE_MAX_AGE_SECONDS,
  swr: true,
});
