import type { Product } from '@plentymarkets/shop-api';

/** Ein Haken samt Menge. Beispiel: 5 Pinguinmagnete zu einer Magnettafel (W2, 18.08.2026). */
export interface AccessorySelection {
  variationId: number;
  quantity: number;
}

export interface AccessorySelectionState {
  products: Product[];
  selections: AccessorySelection[];
  variationId: number;
  loading: boolean;
  adding: boolean;
}
