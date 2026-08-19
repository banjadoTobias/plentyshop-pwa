import type { Product } from '@plentymarkets/shop-api';
import type { AccessoryGroup } from '../utils/groupAccessories/types';

export interface BanjadoAccessoriesProps {
  product?: Product;
  /** Ueberschrift des Kastens; ohne Angabe greift die Sprachdatei. */
  title?: string;
  /** Hinweis rechts in der Kopfzeile; ohne Angabe greift die Sprachdatei. */
  hint?: string;
}

export interface BanjadoAccessoryGroupProps {
  group: AccessoryGroup;
}
