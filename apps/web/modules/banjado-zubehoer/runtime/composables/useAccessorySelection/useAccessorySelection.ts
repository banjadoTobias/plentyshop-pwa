import { productGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';
import { CROSS_SELLING_RELATION_ACCESSORY, CROSS_SELLING_TYPE, DEFAULT_CATEGORY_ID } from '../../config/constants';
import { applySelection } from '../../utils/applySelection';
import { getEffectivePrice } from '../../utils/getEffectivePrice';
import type { AccessoryGroup } from '../../utils/groupAccessories/types';
import type { AccessorySelectionState } from './types';

const STATE_KEY = 'banjadoAccessorySelection';

/**
 * @description Haelt das Zubehoer des Artikels, der gerade auf dem Bildschirm steht, und die Haken darauf.
 * Der Zustand liegt bewusst global: die Komponente setzt die Haken, das Plugin liest sie beim
 * Warenkorb-Ereignis wieder aus.
 * @returns UseAccessorySelectionReturn
 * @example
 * ``` ts
 * const { fetchAccessories, toggle, isSelected, addSelectedToCart } = useAccessorySelection();
 * ```
 */
export const useAccessorySelection = () => {
  const state = useState<AccessorySelectionState>(STATE_KEY, () => ({
    products: [],
    selectedVariationIds: [],
    variationId: 0,
    loading: false,
    adding: false,
  }));

  const { fetchProductRecommended } = useProductRecommended(STATE_KEY);
  const { addItemsToCart } = useCart();

  /**
   * @description Holt das gepflegte Cross-Selling vom Typ "Zubehoer" - ein Aufruf, keine Schleife.
   * @param product Der Artikel der Produktseite.
   * @return Promise<Product[]>
   * @example
   * ``` ts
   * await fetchAccessories(currentProduct);
   * ```
   */
  const fetchAccessories = async (product: Product) => {
    const itemId = productGetters.getItemId(product);

    if (!itemId) {
      return state.value.products;
    }

    state.value.loading = true;
    state.value.products = [];
    state.value.selectedVariationIds = [];
    state.value.variationId = productGetters.getVariationId(product);

    try {
      state.value.products = await fetchProductRecommended({
        type: CROSS_SELLING_TYPE,
        crossSellingRelation: CROSS_SELLING_RELATION_ACCESSORY,
        itemId,
        categoryId: (productGetters.getCategoryIds(product)[0] ?? DEFAULT_CATEGORY_ID).toString(),
      });
    } finally {
      state.value.loading = false;
    }

    return state.value.products;
  };

  const isSelected = (product: Product) =>
    state.value.selectedVariationIds.includes(productGetters.getVariationId(product));

  /**
   * @description Setzt oder nimmt den Haken. In Gruppen mit Einfachauswahl faellt der Haken
   * der Geschwister dabei weg, ein zweiter Klick auf denselben Artikel nimmt ihn zurueck.
   * @param group Die Gruppe, in der der Artikel steht.
   * @param product Der angeklickte Zubehoer-Artikel.
   * @example
   * ``` ts
   * toggle(group, accessory);
   * ```
   */
  const toggle = (group: AccessoryGroup, product: Product) => {
    state.value.selectedVariationIds = applySelection(state.value.selectedVariationIds, group, product);
  };

  const isMainProduct = (variationId: number) => state.value.variationId > 0 && state.value.variationId === variationId;

  const selectedProducts = computed(() => state.value.products.filter((product) => isSelected(product)));

  const accessoriesTotal = computed(() =>
    selectedProducts.value.reduce((total, product) => total + getEffectivePrice(product), 0),
  );

  /**
   * @description Legt jedes angehakte Zubehoer als eigene Position mit seiner eigenen
   * Varianten-ID in den Warenkorb - ueber addItemsToCart, damit ein einziger Aufruf reicht
   * und die Ereignisse der PWA wie gewohnt feuern.
   * @return Promise<boolean>
   * @example
   * ``` ts
   * await addSelectedToCart();
   * ```
   */
  const addSelectedToCart = async () => {
    if (state.value.adding || selectedProducts.value.length === 0) {
      return false;
    }

    state.value.adding = true;

    try {
      const added = await addItemsToCart(
        selectedProducts.value.map((product) => ({
          productId: productGetters.getVariationId(product),
          quantity: 1,
        })),
      );

      if (added) {
        state.value.selectedVariationIds = [];
      }

      return added;
    } finally {
      state.value.adding = false;
    }
  };

  return {
    fetchAccessories,
    isSelected,
    toggle,
    isMainProduct,
    addSelectedToCart,
    selectedProducts,
    accessoriesTotal,
    ...toRefs(state.value),
  };
};
