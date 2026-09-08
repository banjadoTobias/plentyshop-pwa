import { SELECTION_MODE_MULTIPLE, SELECTION_MODE_SINGLE } from './constants';
import type { AccessoryGroupConfig } from './types';

/**
 * Die Gruppen des Zubehoer-Kastens in Anzeige-Reihenfolge; jede ist einzeln aufklappbar,
 * leere erscheinen nicht. Was keine Regel einsammelt, steht in der Auffang-Gruppe
 * "Passendes Zubehoer" am Ende.
 *
 * Ein Zubehoer-Artikel landet in der ersten Gruppe, deren Regel auf der hoechsten greifenden
 * Ebene trifft: Tag vor Kategorie vor SKU-Praefix vor Schluesselwort im Namen. Auf der
 * Kategorie-Ebene gewinnt die tiefste Kategorie des Artikels, weil Artikel ueber zwei
 * Mandanten oft eine flache und eine tiefe Kategorie tragen (HUS1: 1970 "Briefkasten farbig"
 * neben 2017 "Warnschild Hund"). Details in utils/groupAccessories.
 *
 * Kategorie-IDs und SKU-Praefixe stammen aus den Live-Daten der Middleware (getFacet,
 * 07./08.09.2026). Die Tag-Ebene bleibt frei fuer dedizierte Gruppen-Tags aus Plenty; die
 * heutigen Tags sind unvollstaendig (Kreidestifte tragen keine, NDMA6/NDMB6 fehlt Tag 43)
 * und mehrdeutig: Tag 52 "Befestigung" klebt auch auf den Briefkastenstaendern SF2-4 und
 * steht deshalb hier NICHT - bei Tag-Vorrang zoege er die Staender aus ihrer Gruppe.
 *
 * Kategoriebaum (Auszug): 1521 Zubehoer > 1549 Magnete kaufen, 1550 Kreidestifte,
 * 1592 Befestigung | 1836 Magnettafel > 1847 Zubehoer > 1947 Stifte, 1948 Magnete,
 * 1952 Befestigung | 1956 Briefkasten > 2008 Zubehoer > 2009 Staender, 2011 Schild,
 * 2015 Befestigung, 2017 Warnschild Hund.
 */
export const accessoryGroupConfig: AccessoryGroupConfig[] = [
  {
    id: 'kreidestifte',
    titleKey: 'banjadoAccessories.groups.kreidestifte',
    mode: SELECTION_MODE_MULTIPLE,
    categoryIds: [1550, 1947],
    skuPrefixes: ['CM'],
    keywords: ['kreidestift', 'marker'],
  },
  {
    id: 'magnete',
    titleKey: 'banjadoAccessories.groups.magnete',
    mode: SELECTION_MODE_MULTIPLE,
    tags: [43],
    categoryIds: [1549, 1948],
    skuPrefixes: ['NDMA', 'NDMB', 'FA', 'MM', 'TF', 'FW', 'CA'],
    keywords: ['magnet'],
  },
  {
    id: 'befestigung',
    titleKey: 'banjadoAccessories.groups.befestigung',
    mode: SELECTION_MODE_MULTIPLE,
    categoryIds: [1592, 1952, 2015],
    skuPrefixes: ['AH', 'BKZH'],
    keywords: ['befestigung', 'halterung', 'spiegelklammer'],
  },
  {
    // Nur ein Standfuss je Briefkasten sinnvoll
    id: 'briefkastenstaender',
    titleKey: 'banjadoAccessories.groups.briefkastenstaender',
    mode: SELECTION_MODE_SINGLE,
    categoryIds: [2009],
    skuPrefixes: ['SF'],
    keywords: ['ständer', 'staender', 'standfuß', 'standfuss'],
  },
  {
    id: 'warnschild',
    titleKey: 'banjadoAccessories.groups.warnschild',
    mode: SELECTION_MODE_MULTIPLE,
    categoryIds: [2017],
    skuPrefixes: ['HUS'],
    keywords: ['warnschild'],
  },
  {
    id: 'namensschild',
    titleKey: 'banjadoAccessories.groups.namensschild',
    mode: SELECTION_MODE_MULTIPLE,
    categoryIds: [2011],
    keywords: ['namensschild', 'hausnummer'],
  },
];
