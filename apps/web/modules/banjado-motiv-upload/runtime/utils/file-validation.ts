import type { FileCheckResult, FileFacts } from '../types';

/**
 * Was die Fertigung verarbeiten kann. Der Standardcode nimmt daneben Word,
 * Postscript und 3D-Formate an — davon laesst sich kein Motiv drucken.
 */
export const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];

/** Wert fuer das accept-Attribut des Datei-Feldes. */
export const ACCEPT_ATTRIBUTE = ACCEPTED_MIME_TYPES.join(',');

/** 20 MB. Der Standardcode schreibt 10 MB an die Dropzone und prueft nichts. */
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const MEGABYTE = 1024 * 1024;

export const formatFileSize = (bytes: number): string => {
  const megabytes = bytes / MEGABYTE;
  const rounded = megabytes >= 10 ? Math.round(megabytes) : Math.round(megabytes * 10) / 10;
  return `${String(rounded).replace('.', ',')} MB`;
};

const extensionOf = (name: string): string => {
  const parts = name.toLowerCase().split('.');
  return parts.length > 1 ? (parts.at(-1) ?? '') : '';
};

/**
 * Browser liefern beim Ziehen und Ablegen gelegentlich einen leeren MIME-Typ.
 * Dann entscheidet die Endung, sonst waere jede abgelegte Datei abgelehnt.
 */
export const isAcceptedFileType = (facts: FileFacts): boolean => {
  if (facts.type) return ACCEPTED_MIME_TYPES.includes(facts.type.toLowerCase());
  return ACCEPTED_EXTENSIONS.includes(extensionOf(facts.name));
};

export const isPdf = (facts: FileFacts): boolean =>
  facts.type.toLowerCase() === 'application/pdf' || extensionOf(facts.name) === 'pdf';

/**
 * Harte Annahmepruefung vor dem Upload. Der Standardcode meldet den falschen
 * Typ zwar, laedt die Datei aber trotzdem hoch — hier bricht die Kette ab.
 */
export const checkFile = (facts: FileFacts): FileCheckResult => {
  if (facts.size <= 0) {
    return {
      accepted: false,
      reason: 'empty',
      message: 'Die Datei ist leer. Bitte wählen Sie das Bild noch einmal aus.',
    };
  }

  if (!isAcceptedFileType(facts)) {
    return {
      accepted: false,
      reason: 'type',
      message: 'Dieses Dateiformat können wir nicht drucken. Bitte laden Sie ein JPG, PNG oder PDF hoch.',
    };
  }

  if (facts.size > MAX_FILE_SIZE_BYTES) {
    return {
      accepted: false,
      reason: 'size',
      message: `Die Datei ist ${formatFileSize(facts.size)} groß. Mehr als ${formatFileSize(MAX_FILE_SIZE_BYTES)} können wir nicht annehmen — bitte speichern Sie das Bild etwas kleiner.`,
    };
  }

  return { accepted: true, reason: 'ok', message: '' };
};
