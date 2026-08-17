import type { Product } from '@plentymarkets/shop-api';
import { groupAccessories } from '../groupAccessories';
import { FALLBACK_GROUP_ID, SELECTION_MODE_MULTIPLE, SELECTION_MODE_SINGLE } from '../../../config/constants';
import type { AccessoryGroupConfig } from '../../../config/types';

const FALLBACK_TITLE = 'Passendes Zubehör';

const buildProduct = (name: string, tags: { id: number; name: string }[] = []) =>
  ({
    texts: { name1: name },
    tags: tags.map((tag) => ({ id: tag.id, names: { name: tag.name, lang: 'de' } })),
  }) as Product;

const standConfig: AccessoryGroupConfig = {
  tag: 'Briefkastenstaender',
  title: 'Passenden Standfuß wählen',
  mode: SELECTION_MODE_SINGLE,
};

describe('groupAccessories', () => {
  it('should put everything into one fallback group when no group is configured', () => {
    const products = [buildProduct('Zaunhalterung'), buildProduct('Warnschild Hund')];

    const groups = groupAccessories(products, FALLBACK_TITLE, []);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.id).toBe(FALLBACK_GROUP_ID);
    expect(groups[0]?.title).toBe(FALLBACK_TITLE);
    expect(groups[0]?.mode).toBe(SELECTION_MODE_MULTIPLE);
    expect(groups[0]?.items).toHaveLength(2);
  });

  it('should sort a product into the configured group when its tag name matches', () => {
    const stand = buildProduct('Briefkastenständer Weiß', [{ id: 71, name: 'Briefkastenstaender' }]);

    const groups = groupAccessories([stand], FALLBACK_TITLE, [standConfig]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.title).toBe(standConfig.title);
    expect(groups[0]?.mode).toBe(SELECTION_MODE_SINGLE);
    expect(groups[0]?.items).toEqual([stand]);
  });

  it('should match a configured tag id as well as a tag name', () => {
    const mounting = buildProduct('Zaunhalterung', [{ id: 62, name: 'Befestigung BK Standard' }]);

    const groups = groupAccessories([mounting], FALLBACK_TITLE, [
      { tag: 62, title: 'Montage', mode: SELECTION_MODE_MULTIPLE },
    ]);

    expect(groups[0]?.title).toBe('Montage');
    expect(groups[0]?.items).toEqual([mounting]);
  });

  it('should ignore upper and lower case when matching a tag name', () => {
    const stand = buildProduct('Briefkastenständer Schwarz', [{ id: 71, name: 'BRIEFKASTENSTAENDER' }]);

    const groups = groupAccessories([stand], FALLBACK_TITLE, [standConfig]);

    expect(groups[0]?.items).toEqual([stand]);
  });

  it('should keep untagged products in the fallback group behind the configured groups', () => {
    const stand = buildProduct('Briefkastenständer Silber', [{ id: 71, name: 'Briefkastenstaender' }]);
    const sign = buildProduct('Warnschild Hund');

    const groups = groupAccessories([stand, sign], FALLBACK_TITLE, [standConfig]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.items).toEqual([stand]);
    expect(groups[1]?.id).toBe(FALLBACK_GROUP_ID);
    expect(groups[1]?.items).toEqual([sign]);
  });

  it('should put a product into the first matching group only', () => {
    const stand = buildProduct('Briefkastenständer Weiß', [
      { id: 71, name: 'Briefkastenstaender' },
      { id: 62, name: 'Befestigung BK Standard' },
    ]);

    const groups = groupAccessories([stand], FALLBACK_TITLE, [
      standConfig,
      { tag: 62, title: 'Montage', mode: SELECTION_MODE_MULTIPLE },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.title).toBe(standConfig.title);
  });

  it('should drop configured groups that stay empty', () => {
    const sign = buildProduct('Warnschild Hund');

    const groups = groupAccessories([sign], FALLBACK_TITLE, [standConfig]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.id).toBe(FALLBACK_GROUP_ID);
  });

  it('should return no group at all when there is no accessory', () => {
    expect(groupAccessories([], FALLBACK_TITLE, [standConfig])).toEqual([]);
  });
});
