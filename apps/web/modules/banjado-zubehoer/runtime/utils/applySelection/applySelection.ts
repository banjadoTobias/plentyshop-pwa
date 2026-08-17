import { productGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';
import { SELECTION_MODE_SINGLE } from '../../config/constants';
import type { AccessoryGroup } from '../groupAccessories/types';

/**
 * Rechnet aus, welche Varianten nach einem Klick auf einen Haken ausgewaehlt sind.
 * In Gruppen mit Einfachauswahl faellt der Haken der Geschwister dabei weg; ein zweiter
 * Klick auf denselben Artikel nimmt ihn in beiden Fallrichtungen zurueck.
 * @param selectedVariationIds Die bisher angehakten Varianten-IDs.
 * @param group Die Gruppe, in der der Artikel steht.
 * @param product Der angeklickte Zubehoer-Artikel.
 * @returns Die neue Liste der angehakten Varianten-IDs.
 * @example applySelection([1001], group, accessory);
 */
export const applySelection = (selectedVariationIds: number[], group: AccessoryGroup, product: Product): number[] => {
  const variationId = productGetters.getVariationId(product);

  if (selectedVariationIds.includes(variationId)) {
    return selectedVariationIds.filter((id) => id !== variationId);
  }

  if (group.mode === SELECTION_MODE_SINGLE) {
    const siblings = group.items.map((item) => productGetters.getVariationId(item));

    return [...selectedVariationIds.filter((id) => !siblings.includes(id)), variationId];
  }

  return [...selectedVariationIds, variationId];
};
