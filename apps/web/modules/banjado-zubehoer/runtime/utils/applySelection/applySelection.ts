import { productGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';
import { SELECTION_MODE_SINGLE } from '../../config/constants';
import type { AccessorySelection } from '../../composables/useAccessorySelection/types';
import type { AccessoryGroup } from '../groupAccessories/types';

/**
 * Rechnet aus, welche Varianten nach einem Klick auf einen Haken ausgewaehlt sind.
 * In Gruppen mit Einfachauswahl faellt der Haken der Geschwister dabei weg; ein zweiter
 * Klick auf denselben Artikel nimmt ihn in beiden Fallrichtungen zurueck.
 * Jeder neue Haken startet mit Menge 1; die Menge selbst stellt der Kunde am
 * Mengenwaehler der Position ein (W2: weder fest 1 noch die Menge des Hauptartikels).
 * @param selections Die bisher angehakten Positionen samt Menge.
 * @param group Die Gruppe, in der der Artikel steht.
 * @param product Der angeklickte Zubehoer-Artikel.
 * @returns Die neue Auswahl.
 * @example applySelection([{ variationId: 1001, quantity: 2 }], group, accessory);
 */
export const applySelection = (
  selections: AccessorySelection[],
  group: AccessoryGroup,
  product: Product,
): AccessorySelection[] => {
  const variationId = productGetters.getVariationId(product);

  if (selections.some((selection) => selection.variationId === variationId)) {
    return selections.filter((selection) => selection.variationId !== variationId);
  }

  if (group.mode === SELECTION_MODE_SINGLE) {
    const siblings = group.items.map((item) => productGetters.getVariationId(item));

    return [...selections.filter((selection) => !siblings.includes(selection.variationId)), { variationId, quantity: 1 }];
  }

  return [...selections, { variationId, quantity: 1 }];
};

/**
 * Setzt die Menge einer bereits angehakten Position. Unter 1 faellt nichts —
 * abwaehlen geht ueber den Haken, nicht ueber die Menge, damit kein Artikel
 * "aus Versehen" verschwindet.
 * @param selections Die aktuelle Auswahl.
 * @param variationId Die Variante, deren Menge sich aendert.
 * @param quantity Die gewuenschte Menge.
 * @returns Die neue Auswahl.
 * @example applyQuantity([{ variationId: 1001, quantity: 1 }], 1001, 5);
 */
export const applyQuantity = (
  selections: AccessorySelection[],
  variationId: number,
  quantity: number,
): AccessorySelection[] => {
  const sane = Number.isFinite(quantity) ? Math.max(1, Math.round(quantity)) : 1;

  return selections.map((selection) =>
    selection.variationId === variationId ? { ...selection, quantity: sane } : selection,
  );
};
