import { tagGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';
import { FALLBACK_GROUP_ID, SELECTION_MODE_MULTIPLE } from '../../config/constants';
import { accessoryGroupConfig } from '../../config/zubehoer-gruppen';
import type { AccessoryGroupConfig } from '../../config/types';
import type { AccessoryGroup } from './types';

const matchesTag = (product: Product, tag: AccessoryGroupConfig['tag']) => {
  const wanted = String(tag).trim().toLowerCase();

  return tagGetters
    .getTags(product)
    .some(
      (productTag) =>
        tagGetters.getTagId(productTag) === wanted || tagGetters.getTagName(productTag).trim().toLowerCase() === wanted,
    );
};

/**
 * Sortiert die Zubehoer-Artikel anhand ihrer Tags in die konfigurierten Gruppen.
 * Was kein konfigurierter Tag einsammelt, bleibt in einer Auffang-Gruppe am Ende stehen -
 * ohne gepflegte Tags ist das die einzige Gruppe, und der Kasten sieht aus wie eine Liste.
 * @param products Die Treffer des Cross-Selling-Aufrufs.
 * @param fallbackTitle Titel der Auffang-Gruppe, uebersetzt vom Aufrufer.
 * @param config Zuordnung Tag -> Gruppe, per Vorgabe die Datei zubehoer-gruppen.ts.
 * @returns Die gefuellten Gruppen in der Reihenfolge der Konfiguration; leere Gruppen fallen weg.
 * @example groupAccessories(products, t('banjadoAccessories.fallbackGroup'));
 */
export const groupAccessories = (
  products: Product[],
  fallbackTitle: string,
  config: AccessoryGroupConfig[] = accessoryGroupConfig,
): AccessoryGroup[] => {
  const groups: AccessoryGroup[] = [];
  let remaining = products;

  config.forEach((entry) => {
    const items = remaining.filter((product) => matchesTag(product, entry.tag));

    if (items.length === 0) {
      return;
    }

    remaining = remaining.filter((product) => !items.includes(product));
    groups.push({
      id: String(entry.tag),
      title: entry.title,
      mode: entry.mode,
      items,
    });
  });

  if (remaining.length > 0) {
    groups.push({
      id: FALLBACK_GROUP_ID,
      title: fallbackTitle,
      mode: SELECTION_MODE_MULTIPLE,
      items: remaining,
    });
  }

  return groups;
};
