import type { FacetSearchCriteria } from '@plentymarkets/shop-api';
import type { AccessorySelectionMode } from './types';

export const SELECTION_MODE_SINGLE: AccessorySelectionMode = 'single';
export const SELECTION_MODE_MULTIPLE: AccessorySelectionMode = 'multiple';

/** Kennung der Auffang-Gruppe, in die alles ohne passende Regel faellt. */
export const FALLBACK_GROUP_ID = 'fallback';

/** Sprachschluessel des Titels der Auffang-Gruppe (runtime/lang). */
export const FALLBACK_GROUP_TITLE_KEY = 'banjadoAccessories.fallbackGroup';

export const CROSS_SELLING_TYPE: FacetSearchCriteria['type'] = 'cross_selling';
export const CROSS_SELLING_RELATION_ACCESSORY: FacetSearchCriteria['crossSellingRelation'] = 'Accessory';

/**
 * Fuer Cross-Selling wertet die API die Kategorie nicht aus, verlangt den Parameter aber.
 * Traegt der Artikel keine Kategorie, geht die 0 raus - so laeuft der Aufruf, der am
 * 17.08.2026 gegen den Briefkasten 2112266555 geprueft wurde.
 */
export const DEFAULT_CATEGORY_ID = '0';

/**
 * Trefferzahl je Cross-Selling-Aufruf. Die Kern-Composable useProductRecommended kappt bei 20;
 * die Magnete-Kategorie zaehlt 38 Artikel (Stand 08.09.2026), da fehlten sonst welche
 * stillschweigend. 60 laesst Luft nach oben.
 */
export const ACCESSORY_ITEMS_PER_PAGE = 60;

/** Sortierung wie im Standardblock fuer empfohlene Artikel: das Guenstigste zuerst. */
export const ACCESSORY_SORT = 'sorting.price.avg_asc';
