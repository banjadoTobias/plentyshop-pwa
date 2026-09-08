import { categoryTreeGetters, productGetters, tagGetters } from '@plentymarkets/shop-api';
import type { CategoryTreeItem, Product } from '@plentymarkets/shop-api';
import { FALLBACK_GROUP_ID, FALLBACK_GROUP_TITLE_KEY, SELECTION_MODE_MULTIPLE } from '../../config/constants';
import { accessoryGroupConfig } from '../../config/zubehoer-gruppen';
import type { AccessoryGroupConfig } from '../../config/types';
import type { AccessoryGroup, CategoryCandidate } from './types';

const normalize = (value: string | number) => String(value).trim().toLowerCase();

const matchesTag = (product: Product, tags: AccessoryGroupConfig['tags']) => {
  if (!tags || tags.length === 0) {
    return false;
  }

  const wanted = tags.map(normalize);

  return tagGetters
    .getTags(product)
    .some(
      (productTag) =>
        wanted.includes(normalize(tagGetters.getTagId(productTag))) ||
        wanted.includes(normalize(tagGetters.getTagName(productTag))),
    );
};

/** Tiefe laut Plenty (DefaultCategory.level, 1 = Wurzel) - der Notnagel ohne Kategoriebaum. */
const getDefaultCategoryLevel = (product: Product, categoryId: number) =>
  product.defaultCategories?.find((category) => category.id === categoryId)?.level ?? 1;

/**
 * Sammelt alle Kategorien, in denen der Artikel steht: die Standardkategorien (alle Mandanten)
 * plus die Kategorie-Slugs aus dem urlPath, den Plenty bei manchen Artikeln mit dem
 * Kategoriepfad fuellt (BKZH: "zubehoer/briefkasten-befestigung/..." nennt 2015, die in
 * defaultCategories fehlt). Mit Baum kommen alle Vorfahren als eigene Kandidaten dazu, damit
 * eine konfigurierte Oberkategorie ihre Unterkategorien mitnimmt. Ohne Baum bleiben nur die
 * rohen IDs mit der Tiefe laut Plenty.
 * @returns Kandidaten ohne Doppelte, die tiefste zuerst.
 */
const collectCategoryCandidates = (product: Product, tree: CategoryTreeItem[]): CategoryCandidate[] => {
  const depthById = new Map<number, number>();

  const add = (id: number, depth: number) => {
    depthById.set(id, Math.max(depth, depthById.get(id) ?? 0));
  };

  const addWithAncestors = (id: number, fallbackDepth: number) => {
    const path = categoryTreeGetters.findCategoriesPathByCategoryId(tree, id);

    if (path.length === 0) {
      add(id, fallbackDepth);
      return;
    }

    path.forEach((node, index) => add(categoryTreeGetters.getId(node), index + 1));
  };

  productGetters
    .getCategoryIds(product)
    .map(Number)
    .filter((id) => id > 0)
    .forEach((id) => addWithAncestors(id, getDefaultCategoryLevel(product, id)));

  productGetters
    .getUrlPath(product)
    .split('/')
    .slice(0, -1)
    .filter((slug) => slug !== '')
    .forEach((slug) => {
      const category = categoryTreeGetters.findCategoryBySlug(tree, slug);

      if (category) {
        addWithAncestors(categoryTreeGetters.getId(category), 1);
      }
    });

  return [...depthById.entries()].map(([id, depth]) => ({ id, depth })).sort((a, b) => b.depth - a.depth);
};

const findGroupByTag = (product: Product, config: AccessoryGroupConfig[]) =>
  config.find((entry) => matchesTag(product, entry.tags));

/** Die tiefste Kategorie des Artikels, die eine Gruppe nennt, entscheidet; danach die Konfig-Reihenfolge. */
const findGroupByCategory = (product: Product, config: AccessoryGroupConfig[], tree: CategoryTreeItem[]) => {
  for (const candidate of collectCategoryCandidates(product, tree)) {
    const entry = config.find((group) => group.categoryIds?.includes(candidate.id));

    if (entry) {
      return entry;
    }
  }

  return undefined;
};

const findGroupBySku = (product: Product, config: AccessoryGroupConfig[]) => {
  const sku = productGetters.getVariationNumber(product).toUpperCase();

  if (sku === '') {
    return undefined;
  }

  return config.find((entry) =>
    entry.skuPrefixes?.some((prefix) => prefix !== '' && sku.startsWith(prefix.toUpperCase())),
  );
};

const findGroupByKeyword = (product: Product, config: AccessoryGroupConfig[]) => {
  const name = productGetters.getName(product).toLowerCase();

  if (name === '') {
    return undefined;
  }

  return config.find((entry) =>
    entry.keywords?.some((keyword) => keyword !== '' && name.includes(keyword.toLowerCase())),
  );
};

/** Die Ebenen greifen in fester Reihenfolge; die erste, die trifft, entscheidet. */
const resolveGroup = (product: Product, config: AccessoryGroupConfig[], tree: CategoryTreeItem[]) =>
  findGroupByTag(product, config) ??
  findGroupByCategory(product, config, tree) ??
  findGroupBySku(product, config) ??
  findGroupByKeyword(product, config);

/**
 * Sortiert die Zubehoer-Artikel in die konfigurierten Gruppen. Je Artikel greift die erste
 * Ebene, die trifft: Tag, dann Kategorie (samt Vorfahren, die tiefste gewinnt), dann
 * SKU-Praefix, dann Schluesselwort im Namen. Was nichts einsammelt, bleibt in der
 * Auffang-Gruppe am Ende. Reine Funktion - der Kategoriebaum kommt als Parameter, damit sie
 * ohne Nuxt testbar bleibt.
 * @param products Die Treffer des Cross-Selling-Aufrufs, in Preisreihenfolge.
 * @param config Die Gruppen in Anzeige-Reihenfolge, per Vorgabe die Datei zubehoer-gruppen.ts.
 * @param categoryTree Der Kategoriebaum (useCategoryTree().data). Ohne ihn trifft die
 *   Kategorie-Ebene nur ueber die IDs am Artikel; SKU und Schluesselwort laufen unveraendert.
 * @returns Die gefuellten Gruppen in Konfig-Reihenfolge, dahinter die Auffang-Gruppe; leere fallen weg.
 * @example groupAccessories(products, accessoryGroupConfig, categoryTree.value);
 */
export const groupAccessories = (
  products: Product[],
  config: AccessoryGroupConfig[] = accessoryGroupConfig,
  categoryTree: CategoryTreeItem[] = [],
): AccessoryGroup[] => {
  const itemsByGroupId = new Map<string, Product[]>();
  const remaining: Product[] = [];

  products.forEach((product) => {
    const entry = resolveGroup(product, config, categoryTree);

    if (!entry) {
      remaining.push(product);
      return;
    }

    itemsByGroupId.set(entry.id, [...(itemsByGroupId.get(entry.id) ?? []), product]);
  });

  const groups: AccessoryGroup[] = config.flatMap((entry) => {
    const items = itemsByGroupId.get(entry.id) ?? [];

    if (items.length === 0) {
      return [];
    }

    return [
      {
        id: entry.id,
        titleKey: entry.titleKey,
        mode: entry.mode,
        initiallyOpen: entry.initiallyOpen ?? false,
        items,
      },
    ];
  });

  if (remaining.length > 0) {
    groups.push({
      id: FALLBACK_GROUP_ID,
      titleKey: FALLBACK_GROUP_TITLE_KEY,
      mode: SELECTION_MODE_MULTIPLE,
      initiallyOpen: false,
      items: remaining,
    });
  }

  return groups;
};
