/**
 * @description Zahl mit Tausenderpunkt in der Sprache des Shops ('2.402'). Faellt bei einer
 * unbekannten Locale auf die nackte Zahl zurueck.
 * @param value Die Zahl.
 * @param locale Sprachcode, z. B. 'de'.
 * @example
 * ``` ts
 * formatCount(2402, 'de'); // '2.402'
 * ```
 */
export const formatCount = (value: number, locale: string): string => {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return String(value);
  }
};
