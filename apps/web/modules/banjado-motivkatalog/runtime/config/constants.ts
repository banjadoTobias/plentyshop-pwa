import type { MotivFacetKey, MotivItemFacetField } from '../types';

export const MOTIVKATALOG_ROUTE_NAME = 'motivauswahl';
export const MOTIVKATALOG_PATH = '/motivauswahl';
export const MOTIVKATALOG_API_ROUTE = '/api/banjado/motive';
export const MOTIVKATALOG_SEARCH_API_ROUTE = '/api/banjado/motive/suche';

/**
 * Kuratierte Shop-Menge (2.402 Motive, Stand 21.11.2025) mit Cache-Control und JSON-Typ.
 * Die S3-Datei ist die interne Gesamtliste (4.205 Eintraege inkl. Briefkasten-/Magnettafel-
 * Nummernkreise) und dient nur als Ausweichquelle, wenn das CDN nicht antwortet.
 */
export const MOTIV_SOURCE_URL = 'https://cdn02.plentyone.com/99wr15d283p3/frontend/Motivmappe/bilder.json';
export const MOTIV_SOURCE_FALLBACK_URL = 'https://banjado.s3.eu-central-1.amazonaws.com/banjado-Motivmappe/bilder.json';
export const MOTIV_SOURCE_TIMEOUT_MS = 15_000;

export const MOTIF_IMAGE_ORIGIN = 'https://banjado.s3.eu-central-1.amazonaws.com';
export const MOTIF_IMAGE_BASE = `${MOTIF_IMAGE_ORIGIN}/banjado-Motivmappe`;
export const MOTIF_IMAGE_SIZE_THUMB = '200x200px';
export const MOTIF_IMAGE_SIZE_LARGE = '2000x2000px';
export const MOTIF_IMAGE_EXTENSION = 'webp';
export const MOTIF_IMAGE_THUMB_PX = 200;

export const FACET_THEMA: MotivFacetKey = 'thema';
export const FACET_FARBE: MotivFacetKey = 'farbe';
export const FACET_NEU: MotivFacetKey = 'neu';
export const FACET_SAISON: MotivFacetKey = 'saison';
export const FACET_KEYS: readonly MotivFacetKey[] = [FACET_THEMA, FACET_FARBE, FACET_NEU, FACET_SAISON];

/** Welches Feld des schlanken Motivs zu welcher Facette gehoert. */
export const ITEM_FIELD_BY_FACET: Record<MotivFacetKey, MotivItemFacetField> = {
  thema: 'th',
  farbe: 'c',
  neu: 's',
  saison: 'sa',
};

/** Sprachschluessel der Facettenueberschriften (runtime/lang). */
export const FACET_LABEL_KEYS: Record<MotivFacetKey, string> = {
  thema: 'banjadoMotivkatalog.facets.thema',
  farbe: 'banjadoMotivkatalog.facets.farbe',
  neu: 'banjadoMotivkatalog.facets.neu',
  saison: 'banjadoMotivkatalog.facets.saison',
};

export const QUERY_PARAM_SEARCH = 'q';
export const QUERY_VALUE_SEPARATOR = ',';

/** 'NNNNN - Titel' in bilder.json; die Nummer bleibt String, damit die fuehrende Null erhalten bleibt. */
export const NAME_SEPARATOR = ' - ';

export const PAGE_SIZE = 48;
export const EAGER_IMAGE_COUNT = 8;
export const QUICK_CHIP_COUNT = 6;
export const FACET_COLLAPSED_COUNT = 8;
export const SEARCH_MIN_LENGTH = 3;
export const SEARCH_MAX_LENGTH = 80;
export const SEARCH_DEBOUNCE_MS = 300;
export const LOAD_MORE_ROOT_MARGIN = '600px 0px';

/** Saison-Werte mit weniger Treffern sind Datenmuell ('Alle', 'Jede', 'Schule', ...). */
export const MIN_SAISON_COUNT = 3;
/** Neuheiten-Facette: 'NEUE Motive', 'NEUE Rahmen', ... (S3-Fassung: 'NEU'). Standard/Einfarbig fallen weg. */
export const NEW_STYLE_PREFIX = 'NEU';
/** Einzelne Ausreisser in den Themen auf den gaengigen Wert ziehen. */
export const THEME_RENAMES: Record<string, string> = {
  Struktur: 'Oberflächen',
};

export const CACHE_NAME_SOURCE = 'banjado-motive-quelle';
export const CACHE_NAME_CATALOG = 'banjado-motive';
export const CACHE_KEY_VERSION = 'v1';
export const CACHE_MAX_AGE_SECONDS = 6 * 60 * 60;
export const CACHE_STALE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const SEARCH_CACHE_CONTROL = 'public, max-age=3600';

export const ASYNC_DATA_KEY_CATALOG = 'banjado-motive';
export const ASYNC_DATA_KEY_TAGS = 'banjado-motive-tags';
export const HISTORY_STATE_VISIBLE_KEY = 'banjadoMotiveVisible';

/** Aufmacher fuer og:image — Funky Town, das Motiv aus Prototyp und Motivband. */
export const OG_MOTIF_NUMBER = '10864';
export const PAGE_META_ICON = 'page';

/** Farbpunkte neben den Farb-Facetten, Werte aus dem Prototyp v2. Ohne Eintrag gibt es keinen Punkt. */
export const COLOR_SWATCHES: Record<string, string> = {
  Weiß: '#F2F0EA',
  Beige: '#D9C9A8',
  Braun: '#7A5C3E',
  Grün: '#4B7B2E',
  Blau: '#2F5C93',
  Schwarz: '#2B2B2B',
  Grau: '#9A9A96',
  Türkis: '#2E9E9B',
  Orange: '#E8862B',
  Gelb: '#E9C63A',
  Rot: '#B8322B',
  Rosa: '#E9A3B8',
  Pink: '#D63384',
  Lila: '#7A4E9E',
  Violett: '#5B3E96',
  Gold: '#C9A227',
  Bunt: 'linear-gradient(135deg, #E9C63A, #4B7B2E, #2F5C93, #B8322B)',
  'Schwarz-Weiß': 'linear-gradient(90deg, #2B2B2B 50%, #F2F0EA 50%)',
};
