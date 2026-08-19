import type { MotivFormat, RequiredPixels, ResolutionLevel, ResolutionVerdict } from '../types';

/** Druckaufloesung der Manufaktur. Darunter wird die Folie sichtbar weich. */
export const PRINT_DPI = 150;

const CM_PER_INCH = 2.54;

/** Ab hier reicht das Bild ohne Abstriche. */
const RATIO_OK = 1;

/**
 * Darunter wird der Druck sichtbar unscharf. Die Ampel warnt dann rot, nimmt die
 * Datei aber trotzdem an (Entscheidung Tobias, 18.08.2026: nur warnen, nicht
 * blockieren) - die Manufaktur sieht jede Datei vor dem Druck.
 */
const RATIO_WARN = 0.6;

const toPixels = (centimeters: number): number => Math.round((centimeters / CM_PER_INCH) * PRINT_DPI);

const formatCentimeters = (centimeters: number): string => String(centimeters).replace('.', ',');

const isMeasurable = (value: number): boolean => Number.isFinite(value) && value > 0;

export const requiredPixels = (format: MotivFormat): RequiredPixels => ({
  width: toPixels(format.widthCm),
  height: toPixels(format.heightCm),
});

const levelFor = (ratio: number): ResolutionLevel => {
  if (ratio >= RATIO_OK) return 'ok';
  if (ratio >= RATIO_WARN) return 'warn';
  return 'bad';
};

/**
 * Rechnet die Bildabmessungen gegen die bedruckbare Flaeche und liefert die
 * Ampel samt Klartext. Bewusst ohne Vue und ohne Browser-APIs, damit die
 * Rechnung testbar bleibt — das Messen der Pixel macht die Komponente.
 */
export const checkResolution = (widthPx: number, heightPx: number, format: MotivFormat): ResolutionVerdict => {
  const required = requiredPixels(format);
  const measurable = isMeasurable(widthPx) && isMeasurable(heightPx);

  const ratio = measurable ? Math.min(widthPx / required.width, heightPx / required.height) : 0;
  const dpi = measurable
    ? Math.round(Math.min(widthPx / (format.widthCm / CM_PER_INCH), heightPx / (format.heightCm / CM_PER_INCH)))
    : 0;

  const level = levelFor(ratio);
  const size = `${widthPx} × ${heightPx} px`;
  const flaeche = `${formatCentimeters(format.widthCm)} × ${formatCentimeters(format.heightCm)} cm`;
  const empfehlung = `${required.width} × ${required.height} px (${PRINT_DPI} dpi)`;

  const verdict = {
    ratio,
    dpi,
    requiredWidthPx: required.width,
    requiredHeightPx: required.height,
  };

  if (level === 'ok') {
    return {
      ...verdict,
      level,
      title: 'Auflösung reicht aus',
      text: `${size} ergeben ${dpi} dpi auf ${flaeche}. Wir drucken das ohne Qualitätsverlust.`,
    };
  }

  if (level === 'warn') {
    return {
      ...verdict,
      level,
      title: 'Grenzwertig — geht, wird aber weicher',
      text: `${size} ergeben ${dpi} dpi auf ${flaeche}. Empfohlen sind ${empfehlung}. Feine Details können unscharf werden.`,
    };
  }

  return {
    ...verdict,
    level,
    title: 'Auflösung zu niedrig — der Druck wird unscharf',
    text: measurable
      ? `${size} ergeben nur ${dpi} dpi auf ${flaeche}. Empfohlen sind ${empfehlung}. Besser: Schicken Sie das Original statt einer verkleinerten Kopie. Wir haben die Datei angenommen und melden uns vor dem Druck, falls sie nicht reicht.`
      : `Wir konnten die Bildgröße nicht auslesen. Empfohlen sind ${empfehlung} für ${flaeche}. Wir prüfen die Datei vor dem Druck von Hand.`,
  };
};
