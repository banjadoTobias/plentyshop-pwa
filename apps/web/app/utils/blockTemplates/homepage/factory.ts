import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';
import { createBanjadoHero } from '~~/modules/banjado-bloecke/runtime/components/blocks/BanjadoHero/defaults';
import { createBanjadoSteps } from '~~/modules/banjado-bloecke/runtime/components/blocks/BanjadoSteps/defaults';
import { createBanjadoCategoryTiles } from '~~/modules/banjado-bloecke/runtime/components/blocks/BanjadoCategoryTiles/defaults';
import { createBanjadoMotifBand } from '~~/modules/banjado-bloecke/runtime/components/blocks/BanjadoMotifBand/defaults';
import { createBanjadoTrust } from '~~/modules/banjado-bloecke/runtime/components/blocks/BanjadoTrust/defaults';

export const BANNER_BLOCK_NAME = 'Banner';

export const isBannerBlock = (block: Block | null | undefined) => block?.name === BANNER_BLOCK_NAME;

/**
 * banjado-Startseite nach dem abgenommenen Prototyp v2 (17.08.2026):
 * Hero, drei Schritte, Kategorie-Kacheln, Motivband, Bestseller,
 * Vertrauensband, Ueber-uns-Text. Die Texte sind Markeninhalte und stehen
 * deshalb als deutsche Literale in den Block-Vorlagen, nicht in i18n.
 *
 * Dieses Template greift nur, solange im Shop-Editor noch nie gespeichert
 * wurde (meta.hasSnapshot). Danach gilt der Editor-Stand.
 */
export function createHomepage(): Block[] {
  return [
    createBanjadoHero(),
    createBanjadoSteps(),
    createBanjadoCategoryTiles(),
    createBanjadoMotifBand(),
    {
      name: 'ProductRecommendedProducts',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        text: {
          pretitle: 'Beliebt bei unseren Kund:innen',
          title: 'Diese Woche am häufigsten bestellt',
          subtitle: '',
          htmlDescription: '',
        },
        // Kategorie im Editor waehlen (z. B. Bestseller); ohne Kategorie bleibt
        // der Block leer und faellt im Editor sofort auf.
        source: {
          type: 'category',
          itemId: '',
          categoryId: '',
        },
      },
    },
    createBanjadoTrust(),
    {
      name: 'TextCard',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        text: {
          pretitle: 'Über banjado',
          title: 'Wer seine Persönlichkeit einrichten will, findet selten Passendes',
          subtitle: '',
          htmlDescription:
            '<p>Entweder gibt es nichts, was zum eigenen Geschmack passt — oder es ist unsäglich teuer. Genau dort setzen wir an: Wir kaufen hochwertige Rohware ein und veredeln sie in unserer Manufaktur im Herzen Sachsens von Hand mit dem Motiv Ihrer Wahl.</p><p>Die Motivfolie ist UV-beständig, wetterfest und schutzlaminiert, damit Sie lange etwas davon haben. Ob Realaufnahme oder Illustration, ob Natur, Architektur oder Sport — und falls doch nicht die perfekte Aufnahme dabei ist, schicken Sie uns einfach Ihr persönliches Bild.</p>',
          textAlignment: 'left',
          color: '#2A2E25',
        },
        button: {
          label: '',
          link: '',
          variant: 'primary',
        },
      },
    },
  ];
}
