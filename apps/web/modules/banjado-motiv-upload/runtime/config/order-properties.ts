/**
 * Die drei Bestelleigenschaften, aus denen das Wunschmotiv besteht.
 *
 * 189 ist im Backend angelegt, aber noch nicht an den Varianten verknuepft und
 * kommt deshalb heute nicht aus der API. Das Modul darf das nicht als Fehler
 * behandeln: fehlt 189, bleiben 153 und 154 als gewoehnliche Textfelder stehen,
 * damit der Zuordnungsschluessel zwischen Vorschau-Mail und Auftrag weiter
 * beim Auftrag ankommt.
 */
export const MOTIV_UPLOAD_PROPERTY_ID = 189;

/** WM-Nummer aus der Vorschau-Mail. */
export const PREVIEW_NUMBER_PROPERTY_ID = 153;

/** Version der freigegebenen Vorschau. */
export const PREVIEW_VERSION_PROPERTY_ID = 154;
