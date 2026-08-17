import { productGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';

/**
 * Liefert den Preis, der im Zubehoer-Kasten steht: das Sonderangebot, sonst den regulaeren Preis.
 * Staffelpreise bleiben aussen vor, weil jedes Zubehoer einzeln in den Warenkorb geht.
 * @param product Der Artikel, dessen Preis angezeigt oder aufsummiert wird.
 * @returns Der Preis in der Waehrung des Shops, 0 wenn kein Preis gepflegt ist.
 * @example getEffectivePrice(accessory);
 */
export const getEffectivePrice = (product: Product): number => {
  const specialOffer = productGetters.getSpecialOffer(product);
  const price = productGetters.getPrice(product) ?? 0;

  return specialOffer && specialOffer < price ? specialOffer : price;
};
