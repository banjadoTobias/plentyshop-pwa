import { QUERY_PARAM_SEARCH, SEARCH_CACHE_CONTROL, SEARCH_MIN_LENGTH } from '../config/constants';
import { normalizeSearchTerm, searchTags } from '../utils/applyFilters';
import { getMotivCatalog } from './loadMotivCatalog';
import type { MotivSearchResponse } from '../types';

const SOURCE_UNAVAILABLE_STATUS = 503;
const SOURCE_UNAVAILABLE_MESSAGE = 'Motivkatalog nicht erreichbar';
const CACHE_CONTROL_HEADER = 'cache-control';

/**
 * GET /api/banjado/motive/suche?q=holz — Nummern der Motive, deren Tags den Begriff enthalten.
 * Die Tags (rund 1 MB) bleiben so auf dem Server; der Client mischt die Nummern zu seinen
 * Titel-/Nummern-Treffern dazu. Zu kurze Begriffe liefern eine leere Liste, ohne die Quelle
 * anzufassen.
 */
export default defineEventHandler(async (event): Promise<MotivSearchResponse> => {
  const rawTerm = getQuery(event)[QUERY_PARAM_SEARCH];
  const term = normalizeSearchTerm(typeof rawTerm === 'string' ? rawTerm : '');

  setHeader(event, CACHE_CONTROL_HEADER, SEARCH_CACHE_CONTROL);

  if (term.length < SEARCH_MIN_LENGTH) {
    return { q: term, n: [] };
  }

  let catalog;

  try {
    catalog = await getMotivCatalog();
  } catch (error) {
    console.error('[banjado-motivkatalog] Quelle nicht ladbar und kein Stand im Cache', error);
    throw createError({ statusCode: SOURCE_UNAVAILABLE_STATUS, statusMessage: SOURCE_UNAVAILABLE_MESSAGE });
  }

  return { q: term, n: searchTags(catalog.search, term) };
});
