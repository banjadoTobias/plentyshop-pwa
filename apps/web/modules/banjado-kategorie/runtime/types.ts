/** Ein geparstes JSON-LD-Objekt, so wie es in den <head> wandert. */
export type JsonLdObject = Record<string, unknown>;

/** Ergebnis von extractJsonLd: bereinigtes HTML plus die herausgehobenen Objekte. */
export type ExtractJsonLdResult = {
  html: string;
  jsonLd: JsonLdObject[];
};

/** Halboffener Zeichenbereich [start, end) im Beschreibungs-HTML. */
export type TextRange = {
  start: number;
  end: number;
};

/** Ein zu ueberschreibender Auto-Import-Komponentenname samt Modulpfad. */
export type ComponentOverride = {
  name: string;
  path: string;
};
