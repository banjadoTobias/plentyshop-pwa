import { addComponentsDir, addImportsDir, addPlugin, createResolver, defineNuxtModule } from 'nuxt/kit';

/**
 * Modul "Passendes Zubehoer": holt das in Plenty gepflegte Cross-Selling vom Typ Zubehoer,
 * stellt es in aufklappbaren Gruppen unter den Konfigurator und legt das Angehakte als
 * eigene Positionen mit eigener Varianten-ID in den Warenkorb.
 *
 * Das Modul muss in nuxt.config.ts VOR '@nuxtjs/i18n' stehen, sonst greift die
 * Registrierung der eigenen Sprachdateien nicht.
 */
export default defineNuxtModule({
  meta: {
    name: 'banjado-zubehoer',
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);

    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      priority: 1,
    });

    addImportsDir(resolver.resolve('./runtime/composables/**'));

    addPlugin({
      src: resolver.resolve('./runtime/plugins/addAccessoriesOnAddToCart'),
      mode: 'client',
    });

    nuxt.hook('i18n:registerModule', (register) => {
      register({
        langDir: resolver.resolve('./runtime/lang'),
        locales: [
          {
            code: 'de',
            file: 'de.json',
          },
          {
            code: 'en',
            file: 'en.json',
          },
        ],
      });
    });
  },
});
