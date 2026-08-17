import type { FacetSearchCriteria } from '@plentymarkets/shop-api';
import type { AccessorySelectionMode } from './types';

export const SELECTION_MODE_SINGLE: AccessorySelectionMode = 'single';
export const SELECTION_MODE_MULTIPLE: AccessorySelectionMode = 'multiple';

/** Kennung der Auffang-Gruppe, in die alles ohne passenden Tag faellt. */
export const FALLBACK_GROUP_ID = 'fallback';

export const CROSS_SELLING_TYPE: FacetSearchCriteria['type'] = 'cross_selling';
export const CROSS_SELLING_RELATION_ACCESSORY: FacetSearchCriteria['crossSellingRelation'] = 'Accessory';

/**
 * Fuer Cross-Selling wertet die API die Kategorie nicht aus, verlangt den Parameter aber.
 * Traegt der Artikel keine Kategorie, geht die 0 raus - so laeuft der Aufruf, der am
 * 17.08.2026 gegen den Briefkasten 2112266555 geprueft wurde.
 */
export const DEFAULT_CATEGORY_ID = '0';
