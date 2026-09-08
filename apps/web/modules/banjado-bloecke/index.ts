import { addComponent, addComponentsDir, createResolver, defineNuxtModule } from 'nuxt/kit';

/**
 * Modul "banjado-bloecke": die Editor-Bloecke fuer die Startseite nach dem
 * abgenommenen Prototyp v2 (vault-banjado/Outputs/prototypes/
 * 2026-08-17-shop-pwa-look-and-feel.html): Hero, drei Schritte,
 * Kategorie-Kacheln, Motivband und Vertrauensband.
 *
 * Die Bloecke selbst brauchen keine Registrierung - der Block-Loader der PWA
 * sammelt alles unter runtime/components/blocks/** von allein ein
 * (app/utils/blocks/blocks-imports.ts).
 *
 * Seit 08.09.2026 traegt das Modul zusaetzlich:
 * - den Override des Kern-Blocks PriceCard (runtime/components/blocks/PriceCard,
 *   Marker @overrides-core-block) mit dem mobilen Kaufbalken BanjadoStickyBuy;
 * - UiImageTable als Vuetify-freien Ersatz fuer den Editor-Bildwaehler. Der
 *   Kern (app/components/ui/ImageTable/ImageTable.vue) war der einzige
 *   Vuetify-Verbraucher; ohne ihn kann 'vuetify-nuxt-module' aus nuxt.config.ts
 *   heraus und der Shop spart 243 KB roh / 67 KB brotli JS je Seitenaufruf.
 */
export default defineNuxtModule({
  meta: {
    name: 'banjado-bloecke',
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const imageTablePath = resolver.resolve('./runtime/components/UiImageTable.vue');

    // Eigene Komponenten (BanjadoStickyBuy) global registrieren, wie in banjado-zubehoer.
    // Ausgenommen sind:
    // - UiImageTable: geht unten als Austausch mit hoeherer Prioritaet rein, sonst stuende
    //   dieselbe Datei zweimal in der Registry;
    // - blocks/**: Bloecke laedt der Block-Loader der PWA per import.meta.glob
    //   (app/utils/blocks/blocks-imports.ts), dort gewinnt das Modul ueber den Kern. In der
    //   Komponenten-Registry haben App-Komponenten Prioritaet 1 - dieselbe wie hier -, und
    //   die Overrides (PriceCard, Navigation, UtilityBar) wuerden als BlocksPriceCard usw.
    //   mit dem Kern kollidieren: Nuxt warnt bei gleicher Prioritaet und behaelt den Kern.
    //   Ausserdem wuerden defaults.ts und types.ts als Pseudo-Komponenten registriert.
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      priority: 1,
      ignore: ['**/UiImageTable.vue', '**/blocks/**'],
    });

    /**
     * Austausch von UiImageTable nach dem Muster aus modules/banjado-motiv-upload/index.ts:
     * addComponent mit hoeherer Prioritaet statt einer Mutation in components:extend (die
     * wird von einem spaeteren Scan wieder ueberschrieben). Nach dem Build in
     * .nuxt/components.d.ts pruefen, dass UiImageTable auf dieses Modul zeigt.
     */
    addComponent({
      name: 'UiImageTable',
      filePath: imageTablePath,
      priority: 100,
    });

    nuxt.hook('components:extend', (components) => {
      const imageTable = components.find((component) => component.pascalName === 'UiImageTable');
      if (!imageTable?.filePath.includes('banjado-bloecke')) {
        console.warn('[banjado-bloecke] Austausch von UiImageTable hat NICHT gegriffen');
      }
    });
  },
});
