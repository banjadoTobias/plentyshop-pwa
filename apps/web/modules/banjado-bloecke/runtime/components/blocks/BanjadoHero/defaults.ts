import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';
import type { BlocksList } from '~/composables/useBlocksList/types';

/**
 * Inhalt aus dem abgenommenen Prototyp v2 (17.08.2026). Echte Produktbilder aus
 * dem banjado-CDN; die Motivzahl 2.402 stammt aus bilder.json, Stand 17.08.2026.
 */
export const createBanjadoHero = (): Block => ({
  name: 'BanjadoHero',
  type: 'content',
  meta: { uuid: uuid() },
  content: {
    text: {
      eyebrow: 'Manufaktur in Sachsen · seit 2010',
      titleHtml: 'Ihr Zuhause.<br>Ihr <em>Motiv</em>.',
      lead: 'Briefkasten, WC-Sitz, Herdabdeckplatte und mehr — mit einem von 2.402 Motiven oder Ihrem eigenen Bild. Von Hand veredelt, in 1–3 Werktagen versandfertig.',
    },
    buttons: {
      primaryLabel: 'Motivkatalog öffnen',
      primaryLink: '/motivauswahl/',
      secondaryLabel: 'Eigenes Bild hochladen',
      secondaryLink: '/wunschmotiv/',
    },
    proof: [
      { value: '2.402', label: 'Motive' },
      { value: '4,82 ★', label: 'aus 1.649 Bewertungen' },
      { value: '1–3 Tage', label: 'bis zum Versand' },
    ],
    images: [
      {
        url: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112266555/full/BK-10864-32-WT.jpg.avif',
        alt: 'Großer Stahl Briefkasten mit Motiv Funky Town',
      },
      {
        url: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112309335/middle/TDB2-10864-21.jpg',
        alt: 'Design WC-Sitz Bambus mit Motiv Funky Town',
      },
      {
        url: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112340547/middle/HAP2-13593-9.jpg',
        alt: 'Herdabdeckplatte Glas Motiv Blauer Marmor mit Gold',
      },
    ],
  },
});

export const getBlocksList = (): BlocksList =>
  ({
    banjadoHero: {
      category: 'banjado',
      title: 'banjado Hero',
      blockName: 'BanjadoHero',
      accessControl: ['content'],
      variations: [
        {
          title: 'Startseiten-Hero',
          image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112266555/middle/BK-10864-32-WT.jpg.avif',
          template: {
            en: createBanjadoHero(),
            de: createBanjadoHero(),
          },
        },
      ],
    },
  }) as unknown as BlocksList;
