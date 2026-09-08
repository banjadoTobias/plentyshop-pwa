import type { Product } from '@plentymarkets/shop-api';
import { applyQuantity, applySelection } from '../applySelection';
import { SELECTION_MODE_MULTIPLE, SELECTION_MODE_SINGLE } from '../../../config/constants';
import type { AccessorySelection } from '../../../composables/useAccessorySelection/types';
import type { AccessoryGroup } from '../../groupAccessories/types';

const buildProduct = (variationId: number) => ({ variation: { id: variationId } }) as Product;

const standWhite = buildProduct(1001);
const standBlack = buildProduct(1002);
const warningSign = buildProduct(2001);

const buildGroup = (mode: AccessoryGroup['mode'], items: Product[]): AccessoryGroup => ({
  id: 'group',
  titleKey: 'banjadoAccessories.groups.group',
  mode,
  initiallyOpen: false,
  items,
});

const pick = (variationId: number, quantity = 1): AccessorySelection => ({ variationId, quantity });

const singleGroup = buildGroup(SELECTION_MODE_SINGLE, [standWhite, standBlack]);
const multipleGroup = buildGroup(SELECTION_MODE_MULTIPLE, [warningSign]);

describe('applySelection', () => {
  it('should add the variation with quantity 1 when nothing is selected yet', () => {
    expect(applySelection([], multipleGroup, warningSign)).toEqual([pick(2001)]);
  });

  it('should remove the variation when it is already selected', () => {
    expect(applySelection([pick(2001)], multipleGroup, warningSign)).toEqual([]);
  });

  it('should remove the variation regardless of its quantity', () => {
    expect(applySelection([pick(2001, 5)], multipleGroup, warningSign)).toEqual([]);
  });

  it('should keep other selections when a multiple choice group is used', () => {
    expect(applySelection([pick(1001)], multipleGroup, warningSign)).toEqual([pick(1001), pick(2001)]);
  });

  it('should keep the quantity of untouched selections', () => {
    expect(applySelection([pick(1001, 3)], multipleGroup, warningSign)).toEqual([pick(1001, 3), pick(2001)]);
  });

  it('should replace the sibling when a single choice group is used', () => {
    expect(applySelection([pick(1001)], singleGroup, standBlack)).toEqual([pick(1002)]);
  });

  it('should leave selections of other groups untouched in a single choice group', () => {
    expect(applySelection([pick(2001), pick(1001)], singleGroup, standBlack)).toEqual([pick(2001), pick(1002)]);
  });

  it('should deselect the current choice when it is clicked again in a single choice group', () => {
    expect(applySelection([pick(1001)], singleGroup, standWhite)).toEqual([]);
  });
});

describe('applyQuantity', () => {
  it('should set the quantity of the matching selection', () => {
    expect(applyQuantity([pick(1001)], 1001, 5)).toEqual([pick(1001, 5)]);
  });

  it('should leave other selections untouched', () => {
    expect(applyQuantity([pick(1001), pick(2001, 2)], 1001, 3)).toEqual([pick(1001, 3), pick(2001, 2)]);
  });

  it('should not go below one - deselecting happens via the checkbox, not the quantity', () => {
    expect(applyQuantity([pick(1001, 2)], 1001, 0)).toEqual([pick(1001)]);
    expect(applyQuantity([pick(1001, 2)], 1001, -3)).toEqual([pick(1001)]);
  });

  it('should round fractional input and fall back to one for garbage', () => {
    expect(applyQuantity([pick(1001)], 1001, 2.6)).toEqual([pick(1001, 3)]);
    expect(applyQuantity([pick(1001, 4)], 1001, Number.NaN)).toEqual([pick(1001)]);
  });

  it('should change nothing when the variation is not selected', () => {
    expect(applyQuantity([pick(1001)], 9999, 5)).toEqual([pick(1001)]);
  });
});
