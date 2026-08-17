/**
 * Haengt das angehakte Zubehoer an die Warenkorb-Kette der PWA: sobald der Hauptartikel
 * gelegt wurde, gehen die Haken als eigene Positionen hinterher. Das Ereignis ist der
 * hausuebliche Weg zwischen Modul und Shop, deshalb braucht die Produktseite keine Zeile
 * fuer dieses Modul.
 */
export default defineNuxtPlugin({
  name: 'banjado-accessories-to-cart',
  parallel: true,
  setup() {
    const nuxtApp = useNuxtApp();
    const { on: onPlentyEvent } = usePlentyEvent();
    const { send } = useNotification();
    const { isMainProduct, addSelectedToCart, selectedProducts } = useAccessorySelection();

    onPlentyEvent('frontend:addToCart', async (data) => {
      if (!isMainProduct(Number(data.addItemParams.productId))) {
        return;
      }

      const count = selectedProducts.value.length;

      if (await addSelectedToCart()) {
        send({ message: nuxtApp.$i18n.t('banjadoAccessories.added', { count }), type: 'positive' });
      }
    });
  },
});
