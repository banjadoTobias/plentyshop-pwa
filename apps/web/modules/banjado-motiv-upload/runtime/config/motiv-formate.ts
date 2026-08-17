import type { MotivFormat } from '../types';

/**
 * Bedruckbare Flaeche je Produktfamilie. Gegen diese Masse rechnet die
 * Aufloesungs-Ampel, deshalb gehoert hier nur herein, was in der Fertigung
 * nachgemessen ist — eine geratene Zahl erzeugt eine gruene Ampel fuer ein
 * Bild, das spaeter unscharf aus der Maschine kommt.
 *
 * Stand 17.08.2026: nachgemessen ist der Briefkasten mit 38 x 46 cm.
 * Weitere Formate kommen hier dazu, sobald ihre Masse bestaetigt sind.
 */
export const MOTIV_FORMATE: Record<string, MotivFormat> = {
  briefkasten: { label: 'Briefkasten', widthCm: 38, heightCm: 46 },
};

/**
 * Solange ein Produkt kein eigenes Format hat, rechnen wir gegen den
 * Briefkasten. Das ist die groesste bestaetigte Flaeche und damit die
 * strengste Anforderung: Wer sie erfuellt, hat auf jedem kleineren Produkt
 * ebenfalls genug Pixel. Ein zu strenger Standard kostet hoechstens eine
 * gelbe Ampel, ein zu lascher kostet eine Reklamation.
 */
export const DEFAULT_MOTIV_FORMAT: MotivFormat = MOTIV_FORMATE.briefkasten as MotivFormat;

export const resolveMotivFormat = (key?: string | null): MotivFormat => {
  if (!key) return DEFAULT_MOTIV_FORMAT;
  return MOTIV_FORMATE[key.trim().toLowerCase()] ?? DEFAULT_MOTIV_FORMAT;
};
