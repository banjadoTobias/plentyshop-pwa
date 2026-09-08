import {
  CACHE_KEY_VERSION,
  CACHE_MAX_AGE_SECONDS,
  CACHE_NAME_CATALOG,
  CACHE_STALE_MAX_AGE_SECONDS,
} from '../config/constants';
import { getMotivCatalog } from './loadMotivCatalog';
import type { MotivCatalog } from '../types';

const SOURCE_UNAVAILABLE_STATUS = 503;
const SOURCE_UNAVAILABLE_MESSAGE = 'Motivkatalog nicht erreichbar';

/**
 * GET /api/banjado/motive — der schlanke Katalog ohne Tags (~340 KB statt 1,4 MB).
 * Die Antwort selbst ist gecacht (fertig serialisiert, ein Schluessel fuer alle Anfragen,
 * Query-Parameter zaehlen nicht); Nitro setzt dazu s-maxage und stale-while-revalidate.
 * Zusammen mit dem Quell-Cache kann der Stand bis zu 2 x maxAge hinter bilder.json liegen —
 * bei einer Datei, die alle paar Monate wechselt, ist das in Ordnung.
 */
export default defineCachedEventHandler(
  async (): Promise<MotivCatalog> => {
    let catalog;

    try {
      catalog = await getMotivCatalog();
    } catch (error) {
      console.error('[banjado-motivkatalog] Quelle nicht ladbar und kein Stand im Cache', error);
      throw createError({ statusCode: SOURCE_UNAVAILABLE_STATUS, statusMessage: SOURCE_UNAVAILABLE_MESSAGE });
    }

    return {
      generatedAt: catalog.generatedAt,
      facets: catalog.facets,
      items: catalog.items,
    };
  },
  {
    name: CACHE_NAME_CATALOG,
    getKey: () => CACHE_KEY_VERSION,
    maxAge: CACHE_MAX_AGE_SECONDS,
    staleMaxAge: CACHE_STALE_MAX_AGE_SECONDS,
    swr: true,
  },
);
