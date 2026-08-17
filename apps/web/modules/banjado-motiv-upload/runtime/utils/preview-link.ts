import type { PreviewAssignment } from '../types';

/** Kein Zuordnungsschluessel ist so lang, alles darueber ist ein Tippfehler. */
const MAX_LENGTH = 32;

const firstValue = (raw: unknown): string => {
  if (Array.isArray(raw)) return firstValue(raw[0]);
  return typeof raw === 'string' ? raw : '';
};

const clean = (raw: unknown): string =>
  firstValue(raw)
    .replaceAll(/[^\w -]/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LENGTH);

/**
 * Bringt die WM-Nummer auf die Schreibweise aus der Vorschau-Mail. Der Kunde
 * tippt "12345", "wm12345" oder "WM 12345" — im Auftrag steht danach immer
 * dieselbe Form, sonst laesst sich Mailverkehr und Auftrag nicht paaren.
 */
export const normalizeWunschmotivNumber = (raw: unknown): string => {
  const value = clean(raw).toUpperCase();
  if (!value) return '';

  const digitsOnly = /^(?:WM[\s-]*)?(\d+)$/.exec(value);
  return digitsOnly ? `WM ${digitsOnly[1]}` : value;
};

export const normalizePreviewVersion = (raw: unknown): string => clean(raw).replaceAll(' ', '');

/**
 * Liest den Link aus der Vorschau-Mail (?wm=...&v=...). Ohne WM-Nummer gibt es
 * nichts zuzuordnen, dann bleibt das Panel zu und der Upload steht offen.
 */
export const readPreviewLink = (query: Record<string, unknown> | null | undefined): PreviewAssignment | null => {
  if (!query) return null;

  const wunschmotivNumber = normalizeWunschmotivNumber(query.wm);
  if (!wunschmotivNumber) return null;

  return { wunschmotivNumber, previewVersion: normalizePreviewVersion(query.v) };
};

export const previewConfirmationText = (assignment: PreviewAssignment): string =>
  assignment.previewVersion
    ? `Ihre Vorschau ist eingetragen: ${assignment.wunschmotivNumber}, Version ${assignment.previewVersion}.`
    : `Ihre Vorschau ist eingetragen: ${assignment.wunschmotivNumber}.`;
