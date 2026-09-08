import type { CategoryTreeItem, Product } from '@plentymarkets/shop-api';
import { groupAccessories } from '../groupAccessories';
import type { AccessoryGroup } from '../types';
import {
  FALLBACK_GROUP_ID,
  FALLBACK_GROUP_TITLE_KEY,
  SELECTION_MODE_MULTIPLE,
  SELECTION_MODE_SINGLE,
} from '../../../config/constants';
import { accessoryGroupConfig } from '../../../config/zubehoer-gruppen';
import type { AccessoryGroupConfig } from '../../../config/types';

interface ProductFixture {
  name?: string;
  sku?: string;
  urlPath?: string;
  tags?: { id: number; name: string }[];
  /** Standardkategorien wie in Plenty: dieselbe ID kann je Mandant doppelt auftauchen. */
  categories?: { id: number; level: number }[];
}

const buildProduct = (fixture: ProductFixture) =>
  ({
    texts: { name1: fixture.name ?? '', urlPath: fixture.urlPath ?? '' },
    variation: { number: fixture.sku ?? '' },
    tags: (fixture.tags ?? []).map((tag) => ({ id: tag.id, names: { name: tag.name, lang: 'de' } })),
    defaultCategories: (fixture.categories ?? []).map((category) => ({
      id: category.id,
      level: category.level,
      plentyId: 28060,
      name: `Kategorie ${category.id}_BAN`,
    })),
  }) as Product;

const node = (id: number, name: string, nameUrl: string, children: CategoryTreeItem[] = []) =>
  ({
    id,
    type: 'item',
    childCount: children.length,
    children,
    details: [{ name, nameUrl, lang: 'de' }],
    right: 'all',
  }) as CategoryTreeItem;

// Auszug des Live-Baums (08.09.2026). "zubehoer" und "magnete" kommen als Slug doppelt vor,
// genau wie im Shop - die Reihenfolge der Wurzeln entspricht der Middleware.
const categoryTree: CategoryTreeItem[] = [
  node(1956, 'Briefkasten', 'briefkasten', [
    node(2008, 'Briefkasten Zubehör', 'zubehoer', [
      node(2009, 'Briefkastenständer', 'standfuesse'),
      node(2011, 'Briefkastenschild', 'briefkastenschild'),
      node(2015, 'Briefkasten Befestigung', 'briefkasten-befestigung'),
      node(2017, 'Warnschild Hund', 'warnschild-hund'),
    ]),
  ]),
  node(1836, 'Magnettafel', 'magnettafel', [
    node(1847, 'Magnettafel Zubehör', 'magnettafel-zubehoer', [
      node(1947, 'Stifte', 'whiteboard-marker'),
      node(1948, 'Magnete', 'magnete'),
    ]),
  ]),
  node(1521, 'Zubehör', 'zubehoer', [
    node(1549, 'Magnete kaufen', 'magnete'),
    node(1550, 'Kreidestifte', 'kreidestifte'),
    node(1592, 'Befestigung', 'befestigung'),
  ]),
];

const group = (id: string, rules: Partial<AccessoryGroupConfig> = {}): AccessoryGroupConfig => ({
  id,
  titleKey: `banjadoAccessories.groups.${id}`,
  mode: SELECTION_MODE_MULTIPLE,
  ...rules,
});

const standConfig = group('briefkastenstaender', { tags: ['Briefkastenstaender'], mode: SELECTION_MODE_SINGLE });

// Helfer auf Modulebene, damit in describe > it kein vierter Callback entsteht (max-nested-callbacks 3)
const idsOf = (groups: AccessoryGroup[]) => groups.map((entry) => entry.id);
const itemsOf = (groups: AccessoryGroup[], id: string) => groups.find((entry) => entry.id === id)?.items;

// Die fuenf Zubehoer-Treffer des Briefkastens 2112266555 (getFacet, 08.09.2026), gekuerzt.
const zaunhalterung = buildProduct({
  name: 'banjado Briefkasten Zaunhalterung',
  sku: 'BKZH',
  urlPath: 'zubehoer/briefkasten-befestigung/banjado-briefkasten-zaunhalterung',
  categories: [
    { id: 2008, level: 2 },
    { id: 2008, level: 2 },
  ],
  tags: [
    { id: 26, name: 'Zubehör' },
    { id: 52, name: 'Befestigung' },
  ],
});
const warnschild = buildProduct({
  name: 'Vorsicht Hund Schild Warnschild Hund mit Motiv',
  sku: 'HUS1 10000',
  urlPath: 'briefkasten-personalisiert/briefkasten-mit-wunschmotiv/vorsicht-hund-schild',
  categories: [
    { id: 1970, level: 2 },
    { id: 2017, level: 3 },
  ],
  tags: [{ id: 22, name: 'WM' }],
});
const buildStand = (sku: string, color: string) =>
  buildProduct({
    name: `Universal Briefkastenständer Stahl ${color}`,
    sku,
    urlPath: `burg-waechter-standard-standfuesse-${color.toLowerCase()}`,
    categories: [
      { id: 2009, level: 3 },
      { id: 2009, level: 3 },
    ],
    tags: [
      { id: 26, name: 'Zubehör' },
      { id: 52, name: 'Befestigung' },
    ],
  });
const standBlack = buildStand('SF3', 'Schwarz');
const standWhite = buildStand('SF2', 'Weiß');
const standSilver = buildStand('SF4', 'Silber');

describe('groupAccessories', () => {
  describe('fallback group', () => {
    it('should put everything into one fallback group when no group is configured', () => {
      const products = [buildProduct({ name: 'Zaunhalterung' }), buildProduct({ name: 'Warnschild Hund' })];

      const groups = groupAccessories(products, []);

      expect(groups).toHaveLength(1);
      expect(groups[0]?.id).toBe(FALLBACK_GROUP_ID);
      expect(groups[0]?.titleKey).toBe(FALLBACK_GROUP_TITLE_KEY);
      expect(groups[0]?.mode).toBe(SELECTION_MODE_MULTIPLE);
      expect(groups[0]?.initiallyOpen).toBe(false);
      expect(groups[0]?.items).toHaveLength(2);
    });

    it('should keep unmatched products in the fallback group behind the configured groups', () => {
      const stand = buildProduct({
        name: 'Briefkastenständer Silber',
        tags: [{ id: 71, name: 'Briefkastenstaender' }],
      });
      const sign = buildProduct({ name: 'Warnschild Hund' });

      const groups = groupAccessories([stand, sign], [standConfig]);

      expect(groups).toHaveLength(2);
      expect(groups[0]?.items).toEqual([stand]);
      expect(groups[1]?.id).toBe(FALLBACK_GROUP_ID);
      expect(groups[1]?.items).toEqual([sign]);
    });

    it('should drop configured groups that stay empty', () => {
      const sign = buildProduct({ name: 'Warnschild Hund' });

      const groups = groupAccessories([sign], [standConfig]);

      expect(groups).toHaveLength(1);
      expect(groups[0]?.id).toBe(FALLBACK_GROUP_ID);
    });

    it('should return no group at all when there is no accessory', () => {
      expect(groupAccessories([], [standConfig])).toEqual([]);
    });
  });

  describe('tags', () => {
    it('should sort a product into the configured group when its tag name matches', () => {
      const stand = buildProduct({ name: 'Briefkastenständer Weiß', tags: [{ id: 71, name: 'Briefkastenstaender' }] });

      const groups = groupAccessories([stand], [standConfig]);

      expect(groups).toHaveLength(1);
      expect(groups[0]?.id).toBe(standConfig.id);
      expect(groups[0]?.titleKey).toBe(standConfig.titleKey);
      expect(groups[0]?.mode).toBe(SELECTION_MODE_SINGLE);
      expect(groups[0]?.items).toEqual([stand]);
    });

    it('should match a configured tag id as well as a tag name', () => {
      const mounting = buildProduct({ name: 'Zaunhalterung', tags: [{ id: 62, name: 'Befestigung BK Standard' }] });

      const groups = groupAccessories([mounting], [group('montage', { tags: [62] })]);

      expect(groups[0]?.id).toBe('montage');
      expect(groups[0]?.items).toEqual([mounting]);
    });

    it('should ignore upper and lower case when matching a tag name', () => {
      const stand = buildProduct({
        name: 'Briefkastenständer Schwarz',
        tags: [{ id: 71, name: 'BRIEFKASTENSTAENDER' }],
      });

      const groups = groupAccessories([stand], [standConfig]);

      expect(groups[0]?.items).toEqual([stand]);
    });

    it('should put a product into the first matching group only', () => {
      const stand = buildProduct({
        name: 'Briefkastenständer Weiß',
        tags: [
          { id: 71, name: 'Briefkastenstaender' },
          { id: 62, name: 'Befestigung BK Standard' },
        ],
      });

      const groups = groupAccessories([stand], [standConfig, group('montage', { tags: [62] })]);

      expect(groups).toHaveLength(1);
      expect(groups[0]?.id).toBe(standConfig.id);
    });
  });

  describe('categories', () => {
    it('should match a default category directly even without a category tree', () => {
      const marker = buildProduct({ name: 'CM6-1', sku: 'CM6-1', categories: [{ id: 1550, level: 2 }] });

      const groups = groupAccessories([marker], [group('kreidestifte', { categoryIds: [1550] })]);

      expect(groups[0]?.id).toBe('kreidestifte');
    });

    it('should match through an ancestor category when the tree is given', () => {
      const magnet = buildProduct({ name: '6 Magnete PINGUINE', categories: [{ id: 1549, level: 2 }] });
      const config = [group('zubehoer', { categoryIds: [1521] })];

      expect(groupAccessories([magnet], config, categoryTree)[0]?.id).toBe('zubehoer');
      expect(groupAccessories([magnet], config)[0]?.id).toBe(FALLBACK_GROUP_ID);
    });

    it('should pick up the category slug from the url path when the tree is given', () => {
      // BKZH traegt 2015 nur im urlPath, nicht in defaultCategories
      const config = [group('befestigung', { categoryIds: [2015] })];

      expect(groupAccessories([zaunhalterung], config, categoryTree)[0]?.id).toBe('befestigung');
      expect(groupAccessories([zaunhalterung], config)[0]?.id).toBe(FALLBACK_GROUP_ID);
    });

    it('should prefer the deepest category when two clients assign different ones', () => {
      // HUS1: 1970 "Briefkasten farbig" (Ebene 2) neben 2017 "Warnschild Hund" (Ebene 3)
      const config = [group('farbig', { categoryIds: [1970] }), group('warnschild', { categoryIds: [2017] })];

      expect(groupAccessories([warnschild], config, categoryTree)[0]?.id).toBe('warnschild');
      expect(groupAccessories([warnschild], config)[0]?.id).toBe('warnschild');
    });

    it('should prefer the group naming the category itself over one naming its ancestor', () => {
      const magnet = buildProduct({ name: '6 Magnete PINGUINE', categories: [{ id: 1549, level: 2 }] });
      const config = [group('zubehoer', { categoryIds: [1521] }), group('magnete', { categoryIds: [1549] })];

      expect(groupAccessories([magnet], config, categoryTree)[0]?.id).toBe('magnete');
    });

    it('should catch NDMA6 through its category although tag 43 is missing', () => {
      const neodym = buildProduct({
        name: 'Neodym Magnete stark 15x3mm',
        sku: 'NDMA6',
        categories: [
          { id: 1549, level: 2 },
          { id: 1549, level: 2 },
        ],
        tags: [
          { id: 39, name: 'Zubehör_Neu21' },
          { id: 26, name: 'Zubehör' },
        ],
      });

      const groups = groupAccessories([neodym], [group('magnete', { tags: [43], categoryIds: [1549] })], categoryTree);

      expect(groups[0]?.id).toBe('magnete');
    });
  });

  describe('sku prefixes', () => {
    it('should match the beginning of the variation number', () => {
      const marker = buildProduct({ name: 'Kreidestift 6mm', sku: 'CM6-1' });
      const sign = buildProduct({ name: 'Vorsicht Hund', sku: 'HUS1 10000' });

      const groups = groupAccessories(
        [marker, sign],
        [group('kreidestifte', { skuPrefixes: ['CM'] }), group('warnschild', { skuPrefixes: ['HUS'] })],
      );

      expect(idsOf(groups)).toEqual(['kreidestifte', 'warnschild']);
    });

    it('should ignore upper and lower case of the variation number', () => {
      const marker = buildProduct({ name: 'Kreidestift', sku: 'cm6-1' });

      expect(groupAccessories([marker], [group('kreidestifte', { skuPrefixes: ['Cm'] })])[0]?.id).toBe('kreidestifte');
    });

    it('should still match by sku when the category tree is empty', () => {
      const neodym = buildProduct({ name: 'Neodym Magnete', sku: 'NDMA6', categories: [{ id: 1549, level: 2 }] });

      const groups = groupAccessories([neodym], [group('magnete', { categoryIds: [1521], skuPrefixes: ['NDMA'] })], []);

      expect(groups[0]?.id).toBe('magnete');
    });
  });

  describe('keywords', () => {
    it('should match a keyword anywhere in the product name regardless of case', () => {
      const marker = buildProduct({ name: 'Kreidemarker WEISS 3mm' });

      expect(groupAccessories([marker], [group('kreidestifte', { keywords: ['Marker'] })])[0]?.id).toBe('kreidestifte');
    });

    it('should not match a product without a name by keyword', () => {
      const nameless = buildProduct({});

      expect(groupAccessories([nameless], [group('kreidestifte', { keywords: ['marker'] })])[0]?.id).toBe(
        FALLBACK_GROUP_ID,
      );
    });
  });

  describe('priority of the levels', () => {
    it('should prefer a tag match over a category match', () => {
      const product = buildProduct({
        name: 'Magnetständer',
        tags: [{ id: 43, name: 'Magnet' }],
        categories: [{ id: 2009, level: 3 }],
      });
      const config = [group('briefkastenstaender', { categoryIds: [2009] }), group('magnete', { tags: [43] })];

      expect(groupAccessories([product], config, categoryTree)[0]?.id).toBe('magnete');
    });

    it('should prefer a category match over a sku match', () => {
      const product = buildProduct({ name: 'Neodym', sku: 'NDMA6', categories: [{ id: 1550, level: 2 }] });
      const config = [group('magnete', { skuPrefixes: ['NDMA'] }), group('kreidestifte', { categoryIds: [1550] })];

      expect(groupAccessories([product], config)[0]?.id).toBe('kreidestifte');
    });

    it('should prefer a sku match over a keyword match', () => {
      const product = buildProduct({ name: 'Briefkastenständer mit Magnet', sku: 'SF2' });
      const config = [
        group('magnete', { keywords: ['magnet'] }),
        group('briefkastenstaender', { skuPrefixes: ['SF'] }),
      ];

      expect(groupAccessories([product], config)[0]?.id).toBe('briefkastenstaender');
    });
  });

  describe('output', () => {
    it('should keep the groups in configuration order and the items in input order', () => {
      const config = [
        group('warnschild', { skuPrefixes: ['HUS'] }),
        group('briefkastenstaender', { skuPrefixes: ['SF'] }),
      ];

      const groups = groupAccessories([standBlack, warnschild, standWhite, standSilver], config);

      expect(idsOf(groups)).toEqual(['warnschild', 'briefkastenstaender']);
      expect(groups[1]?.items).toEqual([standBlack, standWhite, standSilver]);
    });

    it('should pass initiallyOpen through and default it to false', () => {
      const config = [
        group('warnschild', { skuPrefixes: ['HUS'], initiallyOpen: true }),
        group('briefkastenstaender', { skuPrefixes: ['SF'] }),
      ];

      const groups = groupAccessories([warnschild, standBlack], config);

      expect(groups[0]?.initiallyOpen).toBe(true);
      expect(groups[1]?.initiallyOpen).toBe(false);
    });
  });

  describe('shipped configuration', () => {
    it('should split the mailbox accessories into mounting, stand and warning sign', () => {
      const products = [zaunhalterung, warnschild, standBlack, standWhite, standSilver];

      const groups = groupAccessories(products, accessoryGroupConfig, categoryTree);

      expect(idsOf(groups)).toEqual(['befestigung', 'briefkastenstaender', 'warnschild']);
      expect(groups[0]?.items).toEqual([zaunhalterung]);
      expect(groups[1]?.items).toEqual([standBlack, standWhite, standSilver]);
      expect(groups[1]?.mode).toBe(SELECTION_MODE_SINGLE);
      expect(groups[2]?.items).toEqual([warnschild]);
    });

    it('should not let tag 52 pull the stands out of their group', () => {
      const groups = groupAccessories([standBlack, zaunhalterung], accessoryGroupConfig, categoryTree);

      expect(itemsOf(groups, 'briefkastenstaender')).toEqual([standBlack]);
      expect(itemsOf(groups, 'befestigung')).toEqual([zaunhalterung]);
    });

    it('should sort untagged chalk markers and neodym magnets without the tree', () => {
      const marker = buildProduct({ name: 'Kreidestift 6mm weiß', sku: 'CM6-1', categories: [{ id: 1550, level: 2 }] });
      const neodym = buildProduct({ name: 'Neodym Magnete stark', sku: 'NDMA6', categories: [{ id: 1549, level: 2 }] });

      const groups = groupAccessories([neodym, marker], accessoryGroupConfig);

      expect(idsOf(groups)).toEqual(['kreidestifte', 'magnete']);
    });
  });
});
