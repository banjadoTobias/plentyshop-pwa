import type { Product } from '@plentymarkets/shop-api';
import type { AccessoryGroup } from '../utils/groupAccessories/types';

export interface BanjadoAccessoriesProps {
  product?: Product;
}

export interface BanjadoAccessoryGroupProps {
  group: AccessoryGroup;
}
