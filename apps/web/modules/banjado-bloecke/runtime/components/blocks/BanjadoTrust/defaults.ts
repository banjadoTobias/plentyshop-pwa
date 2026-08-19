import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';
import type { BlocksList } from '~/composables/useBlocksList/types';

/** Inhalt aus dem abgenommenen Prototyp v2 (17.08.2026). */
export const createBanjadoTrust = (): Block => ({
  name: 'BanjadoTrust',
  type: 'content',
  meta: { uuid: uuid() },
  content: {
    items: [
      {
        icon: 'shield',
        title: 'Handarbeit aus Sachsen',
        text: 'Von Hand veredelt, lösungsmittelfreie Folie, schutzlaminiert',
      },
      {
        icon: 'truck',
        title: 'Versandkostenfrei in DE',
        text: 'Gewöhnlich versandfertig in 1–3 Werktagen',
      },
      {
        icon: 'return',
        title: '30 Tage Rückgaberecht',
        text: 'Auch bei personalisierten Artikeln kulant geprüft',
      },
      {
        icon: 'star',
        title: '4,82 aus 1.649 Bewertungen',
        text: 'Echte Käufer:innen, verifiziert am Auftrag',
      },
    ],
  },
});

export const getBlocksList = (): BlocksList =>
  ({
    banjadoTrust: {
      category: 'banjado',
      title: 'banjado Vertrauensband',
      blockName: 'BanjadoTrust',
      accessControl: ['content', 'productCategory', 'product'],
      variations: [
        {
          title: 'Vertrauensband',
          image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112266555/middle/BK-10864-32-WT.jpg.avif',
          template: {
            en: createBanjadoTrust(),
            de: createBanjadoTrust(),
          },
        },
      ],
    },
  }) as unknown as BlocksList;
