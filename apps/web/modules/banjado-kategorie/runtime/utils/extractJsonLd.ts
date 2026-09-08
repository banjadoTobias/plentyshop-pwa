import type { ExtractJsonLdResult, JsonLdObject, TextRange } from '../types';
import { JSON_LD_HEAD_KEY_PREFIX } from '../config/constants';

/**
 * Skript-Block mit JSON-LD. Ceres benennt Skripte aus Code-Widgets in <script2>
 * um, und genau so kommt der FAQ-Block bei der PWA an: category.details[].description
 * endet auf `<script2 type="application/ld+json">{...}</script2>` (Befund 08.09.2026,
 * Kategorien 1836 Magnettafel und 1957 Wandbriefkasten). Der Browser kennt <script2>
 * nicht und zeigt den Inhalt als Fliesstext. Andere Skripttypen bleiben unangetastet.
 */
const SCRIPT_PATTERN = /<script2?\b[^>]*\btype\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script2?\s*>/gi;

/** Versteckter Container, in den Ceres HTML-escaptes JSON legt (Live-Seite banjado.com/magnettafel/). */
const HIDDEN_DIV_PATTERN =
  /<div\b[^>]*\bstyle\s*=\s*["'][^"']*display\s*:\s*none[^"']*["'][^>]*>([\s\S]*?)<\/div\s*>/gi;

/** Beginn eines nackten JSON-LD-Objekts im Text, roh oder HTML-escapt. */
const NAKED_START_PATTERN = /\{\s*(?:"|&quot;)@context(?:"|&quot;)\s*:/g;

/** Jedes Skript-Element, gleich welchen Typs - nur zum Ausnehmen beim nackten Scan. */
const ANY_SCRIPT_PATTERN = /<script2?\b[^>]*>[\s\S]*?<\/script2?\s*>/gi;

/** Absatz, der nach dem Herausschneiden leer zurueckbliebe. */
const EMPTY_PARAGRAPH_BEFORE = /<p\b[^>]*>\s*$/i;
const EMPTY_PARAGRAPH_AFTER = /^\s*<\/p\s*>/i;

const QUOTE_ENTITY = '&quot;';

const ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&#34;': '"',
  '&#x22;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#x27;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
  '&amp;': '&',
};

const ENTITY_PATTERN = /&(?:quot|apos|lt|gt|nbsp|amp|#34|#39|#x22|#x27);/gi;

/**
 * Loest die HTML-Entities auf, die im escapten JSON vorkommen. Ein Durchlauf,
 * damit `&amp;quot;` nur eine Stufe verliert und nicht doppelt dekodiert wird.
 */
export const decodeHtmlEntities = (text: string): string =>
  text.replace(ENTITY_PATTERN, (entity) => ENTITIES[entity.toLowerCase()] ?? entity);

/** Strukturierte Daten tragen immer @context und dazu @type (oder @graph). Alles andere ist irgendein JSON. */
const isJsonLdObject = (value: unknown): value is JsonLdObject =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  '@context' in value &&
  ('@type' in value || '@graph' in value);

/**
 * Parst ein Fragment. Liefert null, wenn es kein sauberes JSON-LD ist - dann
 * bleibt das Fragment im sichtbaren HTML stehen, statt still Inhalt zu verschlucken.
 */
const parseJsonLd = (fragment: string): JsonLdObject[] | null => {
  try {
    const parsed: unknown = JSON.parse(decodeHtmlEntities(fragment).trim());
    const list = Array.isArray(parsed) ? parsed : [parsed];

    if (list.length === 0 || !list.every(isJsonLdObject)) {
      return null;
    }

    return list;
  } catch {
    return null;
  }
};

/**
 * Sucht ab `start` (zeigt auf '{') die passende schliessende Klammer und
 * ueberspringt dabei Zeichenketten in roher wie escapter Schreibweise.
 * @returns Index hinter der schliessenden Klammer oder -1.
 */
const findObjectEnd = (text: string, start: number): number => {
  let depth = 0;
  let inString = false;
  let index = start;

  while (index < text.length) {
    const char = text[index];
    const atQuoteEntity = text.startsWith(QUOTE_ENTITY, index);

    if (inString) {
      if (char === '\\') {
        index += 2;
        continue;
      }
      if (char === '"' || atQuoteEntity) {
        inString = false;
      }
      index += atQuoteEntity ? QUOTE_ENTITY.length : 1;
      continue;
    }

    if (char === '"' || atQuoteEntity) {
      inString = true;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return index + 1;
      }
    }
    index += atQuoteEntity ? QUOTE_ENTITY.length : 1;
  }

  return -1;
};

/** Schneidet [start, end) heraus und nimmt einen dadurch leer gewordenen Absatz gleich mit. */
const cutRange = (html: string, start: number, end: number): string => {
  let before = html.slice(0, start);
  let after = html.slice(end);
  const openTag = before.match(EMPTY_PARAGRAPH_BEFORE);
  const closeTag = after.match(EMPTY_PARAGRAPH_AFTER);

  if (openTag && closeTag) {
    before = before.slice(0, before.length - openTag[0].length);
    after = after.slice(closeTag[0].length);
  }

  return before + after;
};

/** Wendet die Schnitte von hinten nach vorn an, damit fruehere Positionen gueltig bleiben. */
const applyCuts = (html: string, cuts: TextRange[]): string => {
  let result = html;
  for (const cut of [...cuts].reverse()) {
    result = cutRange(result, cut.start, cut.end);
  }
  return result;
};

const collectWrapped = (html: string, pattern: RegExp, sink: JsonLdObject[]): TextRange[] => {
  const cuts: TextRange[] = [];

  for (const match of html.matchAll(pattern)) {
    const start = match.index ?? -1;
    const parsed = parseJsonLd(match[1] ?? '');

    if (start < 0 || parsed === null) {
      continue;
    }

    sink.push(...parsed);
    cuts.push({ start, end: start + match[0].length });
  }

  return cuts;
};

/** Bereiche beliebiger Skripte: was dort steht, sieht der Kunde ohnehin nicht - Finger weg. */
const scriptRegions = (html: string): TextRange[] =>
  [...html.matchAll(ANY_SCRIPT_PATTERN)].map((match) => {
    const start = match.index ?? 0;
    return { start, end: start + match[0].length };
  });

const insideAny = (regions: TextRange[], position: number): boolean =>
  regions.some((region) => position >= region.start && position < region.end);

const collectNaked = (html: string, sink: JsonLdObject[]): TextRange[] => {
  const cuts: TextRange[] = [];
  const skip = scriptRegions(html);
  let lastEnd = 0;

  for (const match of html.matchAll(NAKED_START_PATTERN)) {
    const start = match.index ?? -1;

    if (start < lastEnd || insideAny(skip, start)) {
      continue;
    }

    const end = findObjectEnd(html, start);
    const parsed = end < 0 ? null : parseJsonLd(html.slice(start, end));

    if (parsed === null) {
      continue;
    }

    sink.push(...parsed);
    cuts.push({ start, end });
    lastEnd = end;
  }

  return cuts;
};

/**
 * Hebt JSON-LD aus einem Beschreibungs-HTML heraus: erst umschlossene Fragmente
 * (<script>/<script2> mit ld+json, versteckte <div>), dann nackten JSON-Text.
 * Reine Zeichenkettenarbeit ohne DOM, damit Server und Client dasselbe HTML
 * rendern (kein Hydration-Unterschied). Was nicht sauber parst, bleibt stehen.
 * @param html Beschreibungstext aus category.details[].description(2)/shortDescription.
 * @returns Bereinigtes HTML und die gefundenen Objekte in Dokumentreihenfolge.
 * @example const { html, jsonLd } = extractJsonLd(details.description);
 */
export const extractJsonLd = (html: string): ExtractJsonLdResult => {
  const jsonLd: JsonLdObject[] = [];

  if (!html) {
    return { html: '', jsonLd };
  }

  let result = html;

  for (const pattern of [SCRIPT_PATTERN, HIDDEN_DIV_PATTERN]) {
    result = applyCuts(result, collectWrapped(result, pattern, jsonLd));
  }

  result = applyCuts(result, collectNaked(result, jsonLd));

  return { html: result, jsonLd };
};

/** JSON-Escape fuer '<'; als Verkettung geschrieben, damit kein Werkzeug die Sequenz vorzeitig aufloest. */
const ESCAPED_LESS_THAN = '\\' + 'u003C';

/** Wie safeSerializeJsonLd in useStructuredData: '<' maskieren, damit kein '</script>' im Text den Kopf sprengt. */
export const serializeJsonLd = (value: JsonLdObject): string =>
  JSON.stringify(value).replaceAll('<', ESCAPED_LESS_THAN);

/**
 * Stabiler useHead-Schluessel aus dem Inhalt (djb2). Zwei CategoryData-Bloecke,
 * die dieselbe Beschreibung zeigen, erzeugen so nur einen Eintrag im <head>.
 */
export const jsonLdHeadKey = (serialized: string): string => {
  let hash = 5381;
  for (let index = 0; index < serialized.length; index += 1) {
    hash = ((hash << 5) + hash + serialized.charCodeAt(index)) | 0;
  }
  return `${JSON_LD_HEAD_KEY_PREFIX}${(hash >>> 0).toString(36)}`;
};
