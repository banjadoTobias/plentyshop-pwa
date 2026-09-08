import { addComponent, createResolver, defineNuxtModule } from 'nuxt/kit';
import { COMPONENT_OVERRIDES, MODULE_NAME, OVERRIDE_PRIORITY } from './runtime/config/constants';

/**
 * Modul "banjado-kategorie": Anpassungen der Kategorieseite nach den Vorgaben
 * vom 07.09.2026.
 *
 * - Facetten starten eingeklappt; nur eine Facette mit aktiver Auswahl aus der
 *   URL startet offen (CategoryFiltersSortSections fuer die Kategorieseite,
 *   CategoryFiltersFilter fuer die Suchseite). Austausch per addComponent mit
 *   hoeherer Prioritaet, Muster modules/banjado-motiv-upload/index.ts.
 * - FAQ-JSON-LD aus der Kategoriebeschreibung wandert unsichtbar in den <head>.
 *   Das erledigt der Block-Override runtime/components/blocks/CategoryData/
 *   CategoryData.vue, den der Block-Loader (app/utils/blocks/blocks-imports.ts)
 *   von allein einsammelt - dafuer ist hier nichts zu registrieren.
 *
 * Nuxt laedt das Modul per Auto-Scan von modules/, ein Eintrag in nuxt.config.ts
 * ist nicht noetig. Nach dem Build in .nuxt/components.d.ts pruefen, dass
 * CategoryFiltersSortSections und CategoryFiltersFilter auf dieses Modul zeigen.
 */
export default defineNuxtModule({
  meta: {
    name: MODULE_NAME,
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);

    for (const override of COMPONENT_OVERRIDES) {
      addComponent({
        name: override.name,
        filePath: resolver.resolve(override.path),
        priority: OVERRIDE_PRIORITY,
      });
    }

    nuxt.hook('components:extend', (components) => {
      for (const override of COMPONENT_OVERRIDES) {
        const entry = components.find((component) => component.pascalName === override.name);
        if (!entry?.filePath.includes(MODULE_NAME)) {
          console.warn(`[${MODULE_NAME}] Austausch von ${override.name} hat NICHT gegriffen`);
        }
      }
    });
  },
});
