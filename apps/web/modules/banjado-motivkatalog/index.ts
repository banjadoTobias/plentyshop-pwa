import {
  addComponentsDir,
  addImportsDir,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
} from 'nuxt/kit';
import {
  MOTIVKATALOG_API_ROUTE,
  MOTIVKATALOG_PATH,
  MOTIVKATALOG_ROUTE_NAME,
  MOTIVKATALOG_SEARCH_API_ROUTE,
} from './runtime/config/constants';

/**
 * Modul "Motivkatalog": die Seite /motivauswahl mit allen banjado Motiven aus bilder.json,
 * filterbar nach Thema, Farbe, Neuheiten und Saison. Die Quelle (1,4 MB, ohne Kompression)
 * laeuft nie in den Browser: eine Nitro-Route laedt sie serverseitig, haelt sie im Cache
 * und liefert ein schlankes Format ohne Tags. Die Tag-Suche fragt eine zweite Route erst
 * bei Eingabe an.
 *
 * Das Modul muss in nuxt.config.ts VOR '@nuxtjs/i18n' stehen, sonst greift die
 * Registrierung der eigenen Sprachdateien nicht (Auto-Scan von modules/* laeuft zu spaet).
 */
export default defineNuxtModule({
  meta: {
    name: 'banjado-motivkatalog',
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Name ohne Locale-Suffix: @nuxtjs/i18n haengt ___de/___en in pages:resolved selbst an
    // und liest defineI18nRoute aus der Seitendatei, auch ausserhalb von app/pages.
    extendPages((pages) => {
      pages.push({
        name: MOTIVKATALOG_ROUTE_NAME,
        path: MOTIVKATALOG_PATH,
        file: resolver.resolve('./runtime/pages/motivauswahl.vue'),
      });
    });

    // Die Suchroute zuerst: sie liegt unterhalb der Katalogroute, und so bleibt die
    // Reihenfolge auch dann eindeutig, wenn Nitro einmal nach Praefix statt exakt matcht.
    addServerHandler({
      route: MOTIVKATALOG_SEARCH_API_ROUTE,
      method: 'get',
      handler: resolver.resolve('./runtime/server/suche.get'),
    });

    addServerHandler({
      route: MOTIVKATALOG_API_ROUTE,
      method: 'get',
      handler: resolver.resolve('./runtime/server/motive.get'),
    });

    // Nur .vue: ohne Muster wuerde Nuxt auch components/types.ts als Komponente "Types"
    // registrieren und mit der gleichnamigen Datei aus banjado-zubehoer kollidieren (NUXT_B3011).
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pattern: '**/*.vue',
      priority: 1,
    });

    addImportsDir(resolver.resolve('./runtime/composables/**'));

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
