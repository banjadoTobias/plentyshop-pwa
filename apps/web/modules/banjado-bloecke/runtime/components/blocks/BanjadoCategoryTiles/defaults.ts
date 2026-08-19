import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';
import type { BlocksList } from '~/composables/useBlocksList/types';

/**
 * Inhalt aus dem abgenommenen Prototyp v2 (17.08.2026). Die Links zeigen auf die
 * Kategorie-Pfade des Shops und gehoeren beim Einrichten gegen die echten
 * Kategorie-URLs geprueft (Editor-Formular oder kurzer Zuruf an den Agenten).
 */
export const createBanjadoCategoryTiles = (): Block => ({
  name: 'BanjadoCategoryTiles',
  type: 'content',
  meta: { uuid: uuid() },
  content: {
    text: {
      eyebrow: 'Sortiment',
      title: 'Wählen Sie Ihre Rohware',
    },
    linkAll: {
      label: 'Alle Kategorien',
      link: '/',
    },
    tiles: [
      {
        image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112266555/middle/BK-10864-32-WT.jpg.avif',
        label: 'Briefkasten',
        link: '/briefkasten',
      },
      {
        image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112309310/middle/TDB2-10787-21.jpg',
        label: 'WC-Sitz',
        link: '/wc-sitz',
      },
      {
        image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/210310787/middle/HAP2-10787-9.jpg',
        label: 'Herdabdeckplatte',
        link: '/herdabdeckplatte',
      },
      {
        image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112340235/middle/HAP1-13281-9.jpg',
        label: 'Küchenrückwand',
        link: '/kuechenrueckwand',
      },
      {
        image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112309487/middle/TDB2-11375-21.jpg',
        label: 'Magnettafel',
        link: '/magnettafel',
      },
      {
        image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112340589/middle/HAP1-13635-9.jpg',
        label: 'Schlüsselkasten',
        link: '/schluesselkasten',
      },
    ],
  },
});

export const getBlocksList = (): BlocksList =>
  ({
    banjadoCategoryTiles: {
      category: 'banjado',
      title: 'banjado Kategorien',
      blockName: 'BanjadoCategoryTiles',
      accessControl: ['content'],
      variations: [
        {
          title: 'Kategorie-Kacheln',
          image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112309310/middle/TDB2-10787-21.jpg',
          template: {
            en: createBanjadoCategoryTiles(),
            de: createBanjadoCategoryTiles(),
          },
        },
      ],
    },
  }) as unknown as BlocksList;
