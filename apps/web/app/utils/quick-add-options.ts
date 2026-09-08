import type { QuickAddOption } from '~/components/editor/QuickAdd/types';
import {
  BANJADO_FOOTER_BLOCK_NAME,
  BANJADO_FOOTER_BLOCKS_LIST_KEY,
  BANJADO_FOOTER_TITLE,
} from '~~/modules/banjado-bloecke/runtime/components/blocks/BanjadoFooter/constants';

export const headerQuickAddOptions: QuickAddOption[] = [
  { blockName: 'UtilityBar', label: getBlockDisplayName('UtilityBar'), category: 'header', variationIndex: 2 },
  { blockName: 'Navigation', label: getBlockDisplayName('Navigation'), category: 'header', variationIndex: 1 },
  {
    blockName: 'AnnouncementBar',
    label: getBlockDisplayName('AnnouncementBar'),
    category: 'header',
    variationIndex: 0,
  },
];
const sharedFooterAndMultiGridQuickAddOptions: QuickAddOption[] = [
  { blockName: 'Image', label: getBlockDisplayName('Image'), category: 'image', variationIndex: 0 },
  { blockName: 'TextCard', label: getBlockDisplayName('TextCard'), category: 'text', variationIndex: 0 },
];

const gridRowOption: QuickAddOption = {
  blockName: 'MultiGrid',
  label: 'Grid',
  category: 'row',
  variationIndex: 0,
  type: 'row',
};

/**
 * banjado: Die Fusszeile laesst sich damit auch in einen bereits gespeicherten Footer setzen
 * (ein gespeicherter FooterContainer schlaegt die Factory). "category" ist hier der Schluessel
 * der Block-Bibliothek, denn QuickAdd -> addNewBlock -> getBlockTemplateByLanguage liest
 * blocksLists[category] - nicht das Feld "category" des Eintrags.
 */
const banjadoFooterOption: QuickAddOption = {
  blockName: BANJADO_FOOTER_BLOCK_NAME,
  label: BANJADO_FOOTER_TITLE,
  category: BANJADO_FOOTER_BLOCKS_LIST_KEY,
  variationIndex: 0,
};

export const footerQuickAddOptions: QuickAddOption[] = [
  ...sharedFooterAndMultiGridQuickAddOptions.map((option) => ({ ...option })),
  banjadoFooterOption,
];
export const multiGridQuickAddOptions: QuickAddOption[] = [
  ...sharedFooterAndMultiGridQuickAddOptions.map((option) => ({ ...option })),
  gridRowOption,
];
