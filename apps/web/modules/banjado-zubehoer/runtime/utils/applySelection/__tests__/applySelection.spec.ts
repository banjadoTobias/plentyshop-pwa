import type { Product } from '@plentymarkets/shop-api';
import { applySelection } from '../applySelection';
import { SELECTION_MODE_MULTIPLE, SELECTION_MODE_SINGLE } from '../../../config/constants';
import type { AccessoryGroup } from '../../groupAccessories/types';

const buildProduct = (variationId: number) => ({ variation: { id: variationId } }) as Product;

const standWhite = buildProduct(1001);
const standBlack = buildProduct(1002);
const warningSign = buildProduct(2001);

const buildGroup = (mode: AccessoryGroup['mode'], items: Product[]): AccessoryGroup => ({
  id: 'group',
  title: 'Gruppe',
  mode,
  items,
});

const singleGroup = buildGroup(SELECTION_MODE_SINGLE, [standWhite, standBlack]);
const multipleGroup = buildGroup(SELECTION_MODE_MULTIPLE, [warningSign]);

describe('applySelection', () => {
  it('should add the variation id when nothing is selected yet', () => {
    expect(applySelection([], multipleGroup, warningSign)).toEqual([2001]);
  });

  it('should remove the variation id when it is already selected', () => {
    expect(applySelection([2001], multipleGroup, warningSign)).toEqual([]);
  });

  it('should keep other selections when a multiple choice group is used', () => {
    expect(applySelection([1001], multipleGroup, warningSign)).toEqual([1001, 2001]);
  });

  it('should replace the sibling when a single choice group is used', () => {
    expect(applySelection([1001], singleGroup, standBlack)).toEqual([1002]);
  });

  it('should leave selections of other groups untouched in a single choice group', () => {
    expect(applySelection([2001, 1001], singleGroup, standBlack)).toEqual([2001, 1002]);
  });

  it('should deselect the current choice when it is clicked again in a single choice group', () => {
    expect(applySelection([1001], singleGroup, standWhite)).toEqual([]);
  });
});
