import {
  FACET_KEYS,
  ITEM_FIELD_BY_FACET,
  MIN_SAISON_COUNT,
  NAME_SEPARATOR,
  NEW_STYLE_PREFIX,
  THEME_RENAMES,
} from '../../config/constants';
import type {
  MotivCatalogWithSearch,
  MotivFacets,
  MotivFacetValue,
  MotivItem,
  MotivItemFacetField,
  MotivNameParts,
  MotivSourceEntry,
} from '../../types';

const BYTE_ORDER_MARK = '﻿';
const DIGITS_ONLY = /^\d+$/;
const NUMBER_IN_SRC = /(\d+)\.\w+$/;

/** Die S3-Fassung von bilder.json beginnt mit einem UTF-8-BOM, an dem JSON.parse scheitert. */
export const stripBom = (text: string): string => (text.startsWith(BYTE_ORDER_MARK) ? text.slice(1) : text);

/**
 * @description Liest bilder.json als Liste. Zeilen ohne Namen fallen weg.
 * @param text Rohtext der Datei, BOM erlaubt.
 * @example
 * ``` ts
 * const entries = parseMotivSource(await $fetch(url, { responseType: 'text' }));
 * ```
 */
export const parseMotivSource = (text: string): MotivSourceEntry[] => {
  const parsed: unknown = JSON.parse(stripBom(text));

  if (!Array.isArray(parsed)) {
    throw new Error('bilder.json: Liste erwartet');
  }

  return parsed.filter(
    (entry): entry is MotivSourceEntry =>
      typeof entry === 'object' && entry !== null && typeof (entry as MotivSourceEntry).name === 'string',
  );
};

/**
 * @description Trennt 'NNNNN - Titel' in Nummer und Titel. Die Nummer bleibt String, damit
 * die fuehrende Null ('0010') erhalten bleibt; fehlt sie im Namen, kommt sie aus dem Bildpfad.
 * @param name Der name-Wert der Zeile.
 * @param src Der Bildpfad der Zeile (Ausweichquelle fuer die Nummer).
 * @example
 * ``` ts
 * splitMotivName('0010 - Sonnengelb', '.../0010.webp'); // { number: '0010', title: 'Sonnengelb' }
 * ```
 */
export const splitMotivName = (name: string, src = ''): MotivNameParts => {
  const separatorIndex = name.indexOf(NAME_SEPARATOR);
  const numberFromName = separatorIndex > 0 ? name.slice(0, separatorIndex).trim() : '';
  const title = separatorIndex > 0 ? name.slice(separatorIndex + NAME_SEPARATOR.length).trim() : name.trim();

  if (DIGITS_ONLY.test(numberFromName)) {
    return { number: numberFromName, title };
  }

  const numberFromSrc = NUMBER_IN_SRC.exec(src)?.[1] ?? '';

  return { number: numberFromSrc, title };
};

const cleanList = (values: string[] | undefined): string[] => {
  const cleaned = (values ?? [])
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return [...new Set(cleaned)];
};

const renameThemes = (themes: string[]): string[] => [...new Set(themes.map((theme) => THEME_RENAMES[theme] ?? theme))];

const keepNewStyles = (styles: string[]): string[] => styles.filter((style) => style.startsWith(NEW_STYLE_PREFIX));

const countValues = (items: MotivItem[], field: MotivItemFacetField): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const item of items) {
    for (const value of item[field]) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return counts;
};

const toFacetValues = (counts: Map<string, number>): MotivFacetValue[] =>
  [...counts]
    .map(([wert, anzahl]) => ({ wert, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl || a.wert.localeCompare(b.wert, 'de'));

export const createEmptyFacets = (): MotivFacets => ({ thema: [], farbe: [], neu: [], saison: [] });

/**
 * @description Macht aus den Rohzeilen den schlanken Katalog: Dubletten (gleiche Nummer) fallen weg,
 * Themen werden vereinheitlicht, vom Stil bleiben nur die Neuheiten, seltene Saison-Werte
 * verschwinden, und die Facetten werden nach Haeufigkeit sortiert. Die Tags landen nicht im
 * Katalog, sondern kleingeschrieben in der Suchkarte fuer den Server.
 * @param entries Rohzeilen aus bilder.json.
 * @param generatedAt Zeitstempel des Standes.
 * @example
 * ``` ts
 * const catalog = normalizeMotive(parseMotivSource(text));
 * ```
 */
export const normalizeMotive = (
  entries: MotivSourceEntry[],
  generatedAt = new Date().toISOString(),
): MotivCatalogWithSearch => {
  const seen = new Set<string>();
  const items: MotivItem[] = [];
  const search: Record<string, string> = {};

  for (const entry of entries) {
    const { number, title } = splitMotivName(entry.name, entry.src);

    if (number.length === 0 || seen.has(number)) {
      continue;
    }

    seen.add(number);
    items.push({
      n: number,
      t: title,
      th: renameThemes(cleanList(entry.theme)),
      c: cleanList(entry.color),
      s: keepNewStyles(cleanList(entry.style)),
      sa: cleanList(entry.saison),
    });
    search[number] = cleanList(entry.tags).join(' | ').toLowerCase();
  }

  const saisonCounts = countValues(items, ITEM_FIELD_BY_FACET.saison);

  for (const item of items) {
    item.sa = item.sa.filter((value) => (saisonCounts.get(value) ?? 0) >= MIN_SAISON_COUNT);
  }

  const facets = createEmptyFacets();

  for (const key of FACET_KEYS) {
    facets[key] = toFacetValues(countValues(items, ITEM_FIELD_BY_FACET[key]));
  }

  return { generatedAt, facets, items, search };
};
