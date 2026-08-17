import type { AccessoryGroupConfig } from './types';

/**
 * Zuordnung Tag -> Gruppe im Zubehoer-Kasten.
 *
 * `tag` trifft die Tags des ZUBEHOER-Artikels, nicht die des Hauptartikels, und wird
 * sowohl gegen die Tag-ID als auch gegen den Tag-Namen geprueft; Gross- und Kleinschreibung
 * spielt keine Rolle. `mode` legt fest, ob die Gruppe einen Haken oder mehrere zulaesst.
 * Ein Artikel landet in der ersten Gruppe, deren Tag trifft.
 *
 * Solange diese Liste leer ist oder kein Tag trifft, steht alles Zubehoer in einer einzigen
 * Gruppe "Passendes Zubehoer". Die Gruppen-Tags sind im Plenty-Backend (Stand 17.08.2026)
 * noch nicht gepflegt - sobald sie es sind, wird hier eingetragen, sonst nirgends.
 *
 * @example
 * ``` ts
 * import { SELECTION_MODE_MULTIPLE, SELECTION_MODE_SINGLE } from './constants';
 *
 * export const accessoryGroupConfig: AccessoryGroupConfig[] = [
 *   { tag: 'Briefkastenstaender', title: 'Passenden Standfuss waehlen', mode: SELECTION_MODE_SINGLE },
 *   { tag: 62, title: 'Montage und Schutz', mode: SELECTION_MODE_MULTIPLE },
 * ];
 * ```
 */
export const accessoryGroupConfig: AccessoryGroupConfig[] = [];
