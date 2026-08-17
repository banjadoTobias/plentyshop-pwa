import type { Product } from '@plentymarkets/shop-api';
import type { AccessorySelectionMode } from '../../config/types';

export interface AccessoryGroup {
  id: string;
  title: string;
  mode: AccessorySelectionMode;
  items: Product[];
}
