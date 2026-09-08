import { COPYRIGHT_YEAR_PLACEHOLDER, EXTERNAL_HREF_PATTERN, PRIVACY_POLICY_PLACEHOLDER } from './constants';
import type { BanjadoConsentTextParts } from './types';

/**
 * Erkennt absolute Ziele (https:, mailto:, tel:), die als normales <a> gerendert
 * werden; alles andere ist ein Shop-Pfad und laeuft durch localePath.
 */
export const isExternalHref = (href: string): boolean => EXTERNAL_HREF_PATTERN.test(href.trim());

/**
 * Setzt das Jahr in den Copyright-Text ein. Das passiert zur Renderzeit, weil
 * getFooterTemplate in PROD pro Locale cached und ein fest eingebranntes Jahr
 * sonst am 1. Januar veraltet waere.
 */
export const renderCopyright = (template: string, year: number): string =>
  template.replaceAll(COPYRIGHT_YEAR_PLACEHOLDER, String(year));

/**
 * Zerlegt den Einwilligungstext am Platzhalter {privacyPolicy}, damit die
 * Datenschutzerklaerung als Link mitten im Satz stehen kann. Ohne Platzhalter
 * bleibt der Text unveraendert und es gibt keinen Link.
 */
export const splitConsentText = (text: string): BanjadoConsentTextParts => {
  const index = text.indexOf(PRIVACY_POLICY_PLACEHOLDER);

  if (index === -1) {
    return { before: text, after: '', hasLink: false };
  }

  return {
    before: text.slice(0, index),
    after: text.slice(index + PRIVACY_POLICY_PLACEHOLDER.length),
    hasLink: true,
  };
};
