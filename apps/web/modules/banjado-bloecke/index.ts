import { defineNuxtModule } from 'nuxt/kit';

/**
 * Modul "banjado-bloecke": die Editor-Bloecke fuer die Startseite nach dem
 * abgenommenen Prototyp v2 (vault-banjado/Outputs/prototypes/
 * 2026-08-17-shop-pwa-look-and-feel.html): Hero, drei Schritte,
 * Kategorie-Kacheln, Motivband und Vertrauensband.
 *
 * Die Bloecke selbst brauchen keine Registrierung - der Block-Loader der PWA
 * sammelt alles unter runtime/components/blocks/** von allein ein
 * (app/utils/blocks/blocks-imports.ts). Das Modul existiert, damit der Ordner
 * ein ordentliches Nuxt-Modul ist und spaeter Plugins oder Sprachdateien
 * aufnehmen kann.
 */
export default defineNuxtModule({
  meta: {
    name: 'banjado-bloecke',
  },
  setup() {
    // bewusst leer - siehe Kommentar oben
  },
});
