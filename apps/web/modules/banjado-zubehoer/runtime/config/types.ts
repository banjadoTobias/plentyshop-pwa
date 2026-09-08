export type AccessorySelectionMode = 'single' | 'multiple';

/**
 * Eine Gruppe im Zubehoer-Kasten samt den Regeln, nach denen Zubehoer-Artikel hineinfallen.
 * Die Regeln greifen je Artikel in fester Reihenfolge: Tag, Kategorie, SKU-Praefix,
 * Schluesselwort im Namen. Eine Gruppe ohne Regel bleibt leer und erscheint nicht.
 */
export interface AccessoryGroupConfig {
  /** Eindeutig und slug-artig; landet als data-testid accessory-group-{id} im DOM. */
  id: string;
  /** Schluessel in runtime/lang (banjadoAccessories.groups.*), kein Klartext. */
  titleKey: string;
  mode: AccessorySelectionMode;
  /** Tag-IDs oder Tag-Namen des Zubehoer-Artikels; Gross- und Kleinschreibung egal. */
  tags?: (string | number)[];
  /** Kategorie-IDs; Unterkategorien zaehlen mit, sobald der Kategoriebaum vorliegt. */
  categoryIds?: number[];
  /** Anfang der Variantennummer; Gross- und Kleinschreibung egal. */
  skuPrefixes?: string[];
  /** Teilstrings des Artikelnamens; Gross- und Kleinschreibung egal. */
  keywords?: string[];
  /** Beim ersten Anzeigen aufgeklappt; Vorgabe zu. */
  initiallyOpen?: boolean;
}
