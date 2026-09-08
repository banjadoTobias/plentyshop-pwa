import type { Product } from '@plentymarkets/shop-api';
import type { AccessorySelectionMode } from '../../config/types';

export interface AccessoryGroup {
  id: string;
  /** Sprachschluessel des Titels; die Komponente uebersetzt. */
  titleKey: string;
  mode: AccessorySelectionMode;
  initiallyOpen: boolean;
  items: Product[];
}

/** Eine Kategorie des Zubehoer-Artikels samt Tiefe im Baum (1 = Wurzel). */
export interface CategoryCandidate {
  id: number;
  depth: number;
}
