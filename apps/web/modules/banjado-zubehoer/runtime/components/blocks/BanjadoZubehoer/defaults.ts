import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';
import type { BlocksList } from '~/composables/useBlocksList/types';

// content darf nie leer sein: useBlocksVisibility blendet Bloecke ohne content aus.
export const createBanjadoZubehoer = (): Block => ({
  name: 'BanjadoZubehoer',
  type: 'content',
  meta: { uuid: uuid() },
  content: {
    text: {
      title: 'Passendes Zubehör',
      hint: 'optional dazubestellen',
    },
  },
});

export const getBlocksList = (): BlocksList =>
  ({
    banjadoZubehoer: {
      category: 'banjado',
      title: 'banjado Zubehör',
      blockName: 'BanjadoZubehoer',
      accessControl: ['product'],
      variations: [
        {
          title: 'Passendes Zubehör',
          image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112266555/middle/BK-10864-32-WT.jpg.avif',
          template: {
            en: createBanjadoZubehoer(),
            de: createBanjadoZubehoer(),
          },
        },
      ],
    },
  }) as unknown as BlocksList;
