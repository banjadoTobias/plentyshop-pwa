import {
  MOTIV_UPLOAD_PROPERTY_ID,
  PREVIEW_NUMBER_PROPERTY_ID,
  PREVIEW_VERSION_PROPERTY_ID,
} from '../config/order-properties';
import type { MotivUploadPlan } from '../types';

/**
 * Entscheidet, welche Bestelleigenschaften das Upload-Modul selbst rendert.
 *
 * Liegt 189 an der Variante, uebernimmt das Modul auch WM-Nummer und
 * Vorschau-Version und blendet sie aus der gewoehnlichen Liste aus — sonst
 * stuenden sie doppelt auf der Seite, einmal im Panel und einmal lose
 * darunter. Fehlt 189, bleiben beide unangetastet stehen, damit die Zuordnung
 * auch ohne den Upload weiter beim Auftrag ankommt.
 */
const PREVIEW_PROPERTY_IDS = [PREVIEW_NUMBER_PROPERTY_ID, PREVIEW_VERSION_PROPERTY_ID];

export const planMotivUpload = (orderPropertyIds: number[]): MotivUploadPlan => {
  const rendersMotivUpload = orderPropertyIds.includes(MOTIV_UPLOAD_PROPERTY_ID);

  // Beide Felder oder keines: das Panel bietet die Zuordnung nur an, wenn WM-
  // Nummer und Version am Auftrag ankommen. Wuerden wir hier ein einzelnes Feld
  // ausblenden, verschwaende es spurlos von der Seite.
  const assignsPreview = rendersMotivUpload && PREVIEW_PROPERTY_IDS.every((id) => orderPropertyIds.includes(id));

  return { rendersMotivUpload, hiddenPropertyIds: assignsPreview ? [...PREVIEW_PROPERTY_IDS] : [] };
};
