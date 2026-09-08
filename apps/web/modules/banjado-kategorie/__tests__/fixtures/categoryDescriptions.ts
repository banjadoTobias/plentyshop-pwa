/**
 * Fixtures fuer extractJsonLd. Die beiden API-Formen stammen 1:1 aus
 * POST /plentysystems/getFacet (08.09.2026), gekuerzt auf zwei Fragen.
 */

/** Kategorie 1836 Magnettafel: FAQ-Absaetze, dahinter <script2> mit eingerueckter JSON (doppelte Leerzeichen). */
export const MAGNETTAFEL_TAIL =
  '<h3>Welche Magnete passen zu Magnettafeln?</h3><p>Für Magnettafeln eignen sich passende Haftmagnete, mit denen sich Notizen, Fotos oder Karten sicher befestigen lassen. In unserem Sortiment finden Sie eine Auswahl an <a href="https://www.banjado.com/magnettafel/magnettafel-zubehoer/magnete/" title="Magnete für Magnettafeln">Magneten für Magnettafeln</a>, die optimal auf die Nutzung abgestimmt sind.</p>';

export const MAGNETTAFEL_SCRIPT2 =
  '<script2 type="application/ld+json">{  "@context": "https://schema.org",  "@type": "FAQPage",  "mainEntity": [    {      "@type": "Question",      "name": "Wofür eignet sich eine Magnettafel?",      "acceptedAnswer": {        "@type": "Answer",        "text": "Eine Magnettafel eignet sich ideal für Notizen, Termine, Fotos, Einkaufslisten oder Erinnerungen."      }    },    {      "@type": "Question",      "name": "Sind Magnettafeln beschreibbar?",      "acceptedAnswer": {        "@type": "Answer",        "text": "Viele Magnettafeln von banjado sind beschreibbar und abwischbar."      }    }  ]}</script2>';

export const MAGNETTAFEL_DESCRIPTION = `<p><strong>Magnettafeln</strong> von banjado verbinden stilvolles Design mit praktischer Funktion.</p><h2>Häufige Fragen zu Magnettafeln</h2>${MAGNETTAFEL_TAIL}${MAGNETTAFEL_SCRIPT2}`;

/** Kategorie 1957 Wandbriefkasten: kompakte JSON, <script2> folgt direkt auf ein </div>. */
export const WANDBRIEFKASTEN_TAIL =
  '<h3>Was ist der Unterschied zwischen Wandbriefkasten und Zaunbriefkasten?</h3><p>Ein Wandbriefkasten wird direkt an der Hauswand montiert, während ein Zaunbriefkasten am Zaun befestigt wird - ideal, wenn der Zugang von außen erfolgen soll.</p></div>';

export const WANDBRIEFKASTEN_SCRIPT2 =
  '<script2 type="application/ld+json">{"@context": "https://schema.org","@type": "FAQPage","mainEntity": [{"@type": "Question","name": "Welche Größe sollte ein Wandbriefkasten haben?","acceptedAnswer": {"@type": "Answer","text": "Ein guter Wandbriefkasten sollte mindestens DIN C4 Formate aufnehmen können."}},{"@type": "Question","name": "Was ist der Unterschied zwischen Wandbriefkasten und Zaunbriefkasten?","acceptedAnswer": {"@type": "Answer","text": "Ein Wandbriefkasten wird direkt an der Hauswand montiert, während ein Zaunbriefkasten am Zaun befestigt wird - ideal, wenn der Zugang von außen erfolgen soll."}}]}</script2>';

export const WANDBRIEFKASTEN_DESCRIPTION = `<p><strong>Wandbriefkästen</strong> sind die ideale Lösung für alle, die Post sicher empfangen möchten.</p><div>${WANDBRIEFKASTEN_TAIL}${WANDBRIEFKASTEN_SCRIPT2}`;

/** Kleines FAQ-Objekt fuer die synthetischen Varianten. */
export const FAQ_OBJECT = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Sind Magnettafeln beschreibbar?',
      acceptedAnswer: { '@type': 'Answer', text: 'Ja, viele Modelle sind beschreibbar & abwischbar.' },
    },
  ],
};

export const FAQ_JSON = JSON.stringify(FAQ_OBJECT);

/** Dasselbe Objekt so, wie ein Editor es HTML-escapt ablegt. */
export const FAQ_JSON_ESCAPED = FAQ_JSON.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

export const PLAIN_TEXT = '<p>Ein Absatz ohne strukturierte Daten.</p><p>Preis &amp; Leistung {stimmen}.</p>';

/** Ein Skript, das kein JSON-LD ist, muss stehen bleiben. */
export const OTHER_SCRIPT = '<script type="text/javascript">var faq = {"@context": "nein"};</script>';
