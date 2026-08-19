import { productGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';
import { CROSS_SELLING_RELATION_ACCESSORY, CROSS_SELLING_TYPE, DEFAULT_CATEGORY_ID } from '../../config/constants';
import { applyQuantity, applySelection } from '../../utils/applySelection';
import { getEffectivePrice } from '../../utils/getEffectivePrice';
import type { AccessoryGroup } from '../../utils/groupAccessories/types';
import type { AccessorySelectionState } from './types';

const STATE_KEY = 'banjadoAccessorySelection';

/**
 * @description Haelt das Zubehoer des Artikels, der gerade auf dem Bildschirm steht, und die Haken darauf
 * samt Menge je Position (W2: eigener Mengenwaehler, weder fest 1 noch die Menge des Hauptartikels).
 * Der Zustand liegt bewusst global: die Komponente setzt die Haken, das Plugin liest sie beim
 * Warenkorb-Ereignis wieder aus.
 * @returns UseAccessorySelectionReturn
 * @example
 * ``` ts
 * const { fetchAccessories, toggle, setQuantity, isSelected, addSelectedToCart } = useAccessorySelection();
 * ```
 */
export const useAccessorySelection = () => {
  const state = useState<AccessorySelectionState>(STATE_KEY, () => ({
    products: [],
    selections: [],
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
    state.value.selections = [];
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
    state.value.selections.some((selection) => selection.variationId === productGetters.getVariationId(product));

  /**
   * @description Setzt oder nimmt den Haken. In Gruppen mit Einfachauswahl faellt der Haken
   * der Geschwister dabei weg, ein zweiter Klick auf denselben Artikel nimmt ihn zurueck.
   * Jeder neue Haken startet mit Menge 1.
   * @param group Die Gruppe, in der der Artikel steht.
   * @param product Der angeklickte Zubehoer-Artikel.
   * @example
   * ``` ts
   * toggle(group, accessory);
   * ```
   */
  const toggle = (group: AccessoryGroup, product: Product) => {
    state.value.selections = applySelection(state.value.selections, group, product);
  };

  /**
   * @description Menge einer angehakten Position, sonst 0.
   * @param product Der Zubehoer-Artikel.
   * @example
   * ``` ts
   * quantityOf(accessory); // 5
   * ```
   */
  const quantityOf = (product: Product) =>
    state.value.selections.find((selection) => selection.variationId === productGetters.getVariationId(product))
      ?.quantity ?? 0;

  /**
   * @description Stellt die Menge einer bereits angehakten Position ein. Unter 1 faellt
   * nichts - abgewaehlt wird ueber den Haken, nicht ueber die Menge.
   * @param product Der Zubehoer-Artikel.
   * @param quantity Die gewuenschte Menge.
   * @example
   * ``` ts
   * setQuantity(accessory, 5);
   * ```
   */
  const setQuantity = (product: Product, quantity: number) => {
    state.value.selections = applyQuantity(state.value.selections, productGetters.getVariationId(product), quantity);
  };

  const isMainProduct = (variationId: number) => state.value.variationId > 0 && state.value.variationId === variationId;

  const selectedProducts = computed(() =>
    state.value.products.filter((product) => isSelected(product)),
  );

  const accessoriesTotal = computed(() =>
    selectedProducts.value.reduce((total, product) => total + getEffectivePrice(product) * quantityOf(product), 0),
  );

  /**
   * @description Legt jedes angehakte Zubehoer als eigene Position mit seiner eigenen
   * Varianten-ID und der eingestellten Menge in den Warenkorb - ueber addItemsToCart,
   * damit ein einziger Aufruf reicht und die Ereignisse der PWA wie gewohnt feuern.
   * @return Promise<boolean>
   * @example
   * ``` ts
   * await addSelectedToCart();
   * ```
   */
  const addSelectedToCart = async () => {
    if (state.value.adding || state.value.selections.length === 0) {
      return false;
    }

    state.value.adding = true;

    try {
      const added = await addItemsToCart(
        state.value.selections.map((selection) => ({
          productId: selection.variationId,
          quantity: selection.quantity,
        })),
      );

      if (added) {
        state.value.selections = [];
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
    quantityOf,
    setQuantity,
    isMainProduct,
    addSelectedToCart,
    selectedProducts,
    accessoriesTotal,
    ...toRefs(state.value),
  };
};
