import type { Product } from '@plentymarkets/shop-api';

/**
 * Props des mobilen Kaufbalkens BanjadoStickyBuy, den der PriceCard-Override einbindet.
 * Die Block-Props selbst (PriceCardProps) kommen weiter aus dem Kern,
 * app/components/blocks/PriceCard/types.ts.
 */
export interface BanjadoStickyBuyProps {
  product: Product;
  /**
   * Wurzelelement der Kauf-Box. Darin sucht der Balken den Kaufknopf (Sichtbarkeit)
   * und das Formular (requestSubmit). null, solange die Kauf-Box nicht gerendert ist.
   */
  anchor: HTMLElement | null;
}
