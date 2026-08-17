import type { Product } from '@plentymarkets/shop-api';

export interface AccessorySelectionState {
  products: Product[];
  selectedVariationIds: number[];
  variationId: number;
  loading: boolean;
  adding: boolean;
}
