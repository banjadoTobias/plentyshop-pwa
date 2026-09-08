/** Rohzeile aus bilder.json (CDN- oder S3-Fassung). Alle Facetten kommen als Arrays. */
export interface MotivSourceEntry {
  src: string;
  name: string;
  tags?: string[];
  color?: string[];
  theme?: string[];
  style?: string[];
  saison?: string[];
  zielgruppe?: string[];
}

/** Facettengruppen des Katalogs; die Schluessel sind zugleich die URL-Parameter. */
export type MotivFacetKey = 'thema' | 'farbe' | 'neu' | 'saison';

/** Feldnamen der Facetten am schlanken Motiv. */
export type MotivItemFacetField = 'th' | 'c' | 's' | 'sa';

/**
 * Schlankes Motiv fuer den Client. Kurze Schluessel, weil die Liste mit 2.400 Eintraegen
 * bei jedem Seitenaufruf ueber die Leitung geht: n Nummer (mit fuehrender Null), t Titel,
 * th Themen, c Farben, s Neuheiten-Stil, sa Saison.
 */
export interface MotivItem {
  n: string;
  t: string;
  th: string[];
  c: string[];
  s: string[];
  sa: string[];
}

export interface MotivFacetValue {
  wert: string;
  anzahl: number;
}

export type MotivFacets = Record<MotivFacetKey, MotivFacetValue[]>;

/** Antwort von /api/banjado/motive. */
export interface MotivCatalog {
  generatedAt: string;
  facets: MotivFacets;
  items: MotivItem[];
}

/** Serverseitiger Stand: zusaetzlich der kleingeschriebene Suchtext (Tags) je Nummer. */
export interface MotivCatalogWithSearch extends MotivCatalog {
  search: Record<string, string>;
}

/** Antwort von /api/banjado/motive/suche: Nummern, deren Tags den Begriff enthalten. */
export interface MotivSearchResponse {
  q: string;
  n: string[];
}

export type MotivFacetSelection = Record<MotivFacetKey, string[]>;

/** Filterzustand, wie er in route.query steht. */
export interface MotivFilterState extends MotivFacetSelection {
  q: string;
}

/** Trefferzahl je Facettenwert unter dem aktuellen Filterstand. */
export type MotivFacetCounts = Record<MotivFacetKey, Record<string, number>>;

export interface MotivActiveFilter {
  key: MotivFacetKey;
  value: string;
}

export interface MotivNameParts {
  number: string;
  title: string;
}

/** route.query von vue-router, ohne Abhaengigkeit auf dessen Typen in den reinen Funktionen. */
export type MotivRouteQuery = Record<string, string | null | undefined | Array<string | null>>;
