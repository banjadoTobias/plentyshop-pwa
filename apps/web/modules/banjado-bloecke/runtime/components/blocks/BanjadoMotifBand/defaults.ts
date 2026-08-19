import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';
import type { BlocksList } from '~/composables/useBlocksList/types';

const MOTIF_CDN = 'https://banjado.s3.eu-central-1.amazonaws.com/banjado-Motivmappe/200x200px';

/** Echte Motivnummern und Namen aus bilder.json, Stand 17.08.2026 (wie im Prototyp v2). */
const WALL_MOTIFS: Array<[string, string]> = [
  ['10864', 'Funky Town'],
  ['0010', 'Sonnengelb'],
  ['0011', 'Orange'],
  ['0012', 'Feuerrot'],
  ['0013', 'Burgund'],
  ['10003', 'Bambus'],
  ['10004', 'Bulldogge'],
  ['10005', 'Chihuahua'],
  ['10007', 'Dresden'],
  ['10009', 'Gardasee'],
  ['10012', 'Gummibärchen'],
  ['10015', 'Kätzchen'],
  ['10539', 'Kirschblüten'],
  ['10756', 'Rosetten'],
  ['10787', 'Trockenes Holz'],
  ['10917', 'Blaues Ornament'],
  ['11375', 'Grüne Fliesen'],
  ['11997', 'Jahresringe'],
  ['12061', 'Schwarze Steine'],
  ['12294', 'Kamille und Mohn'],
  ['13281', 'Dünen am Meer'],
  ['13593', 'Blauer Marmor Gold'],
  ['13625', 'Holz mit Rinde'],
  ['13632', 'Holzkreis mit Rissen'],
];

/** Themen samt Trefferzahl aus bilder.json, Stand 17.08.2026. */
const THEME_CHIPS: Array<[string, string]> = [
  ['Natur', '775'],
  ['Abstrakt', '578'],
  ['Muster', '527'],
  ['Tiere', '460'],
  ['Blumen & Blüten', '320'],
  ['Oberflächen', '232'],
  ['Lustig', '179'],
  ['Kinderwelt', '175'],
];

export const createBanjadoMotifBand = (): Block => ({
  name: 'BanjadoMotifBand',
  type: 'content',
  meta: { uuid: uuid() },
  content: {
    text: {
      eyebrow: 'Motivkatalog',
      titleHtml: '2.402 Motive.<br>Jedes auf jedem Produkt.',
      description:
        'Filtern nach Thema, Farbe, Stil und Saison. Jedes Motiv hat eine eigene Seite mit allen Produkten, auf denen es zu haben ist — auffindbar über Google, nicht nur über unsere Suche.',
    },
    chips: THEME_CHIPS.map(([label, count]) => ({ label, count, link: '/motivauswahl/' })),
    wall: WALL_MOTIFS.map(([nr, name]) => ({
      image: `${MOTIF_CDN}/${nr}.webp`,
      alt: `Motiv ${name} · Nr. ${nr}`,
      link: '/motivauswahl/',
    })),
    button: {
      label: 'Katalog durchsuchen',
      link: '/motivauswahl/',
    },
  },
});

export const getBlocksList = (): BlocksList =>
  ({
    banjadoMotifBand: {
      category: 'banjado',
      title: 'banjado Motivband',
      blockName: 'BanjadoMotifBand',
      accessControl: ['content'],
      variations: [
        {
          title: 'Motivband',
          image: `${MOTIF_CDN}/10864.webp`,
          template: {
            en: createBanjadoMotifBand(),
            de: createBanjadoMotifBand(),
          },
        },
      ],
    },
  }) as unknown as BlocksList;
