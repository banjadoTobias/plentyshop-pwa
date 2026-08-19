import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';
import type { BlocksList } from '~/composables/useBlocksList/types';

/** Inhalt aus dem abgenommenen Prototyp v2 (17.08.2026). */
export const createBanjadoSteps = (): Block => ({
  name: 'BanjadoSteps',
  type: 'content',
  meta: { uuid: uuid() },
  content: {
    text: {
      eyebrow: 'In drei Schritten zu Ihrem Stück',
    },
    steps: [
      {
        title: 'Produkt wählen',
        text: 'Briefkasten, WC-Sitz, Magnettafel, Herdabdeckplatte, Küchenrückwand — über 30 Rohwaren stehen bereit.',
      },
      {
        title: 'Motiv wählen oder hochladen',
        text: '2.402 Motive im Katalog, filterbar nach Thema und Farbe. Oder Sie schicken uns Ihr eigenes Bild — wir prüfen die Auflösung sofort.',
      },
      {
        title: 'Wunschtext ergänzen',
        text: 'Name, Spruch oder Hausnummer — bei allen Artikeln, die einen Wunschtext tragen können.',
      },
    ],
  },
});

export const getBlocksList = (): BlocksList =>
  ({
    banjadoSteps: {
      category: 'banjado',
      title: 'banjado Schritte',
      blockName: 'BanjadoSteps',
      accessControl: ['content'],
      variations: [
        {
          title: 'Drei Schritte',
          image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112266555/middle/BK-10864-32-WT.jpg.avif',
          template: {
            en: createBanjadoSteps(),
            de: createBanjadoSteps(),
          },
        },
      ],
    },
  }) as unknown as BlocksList;
