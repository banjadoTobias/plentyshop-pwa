import { describe, expect, it } from 'vitest';
import { decodeHtmlEntities, extractJsonLd, jsonLdHeadKey, serializeJsonLd } from '../runtime/utils/extractJsonLd';
import { JSON_LD_HEAD_KEY_PREFIX } from '../runtime/config/constants';
import {
  FAQ_JSON,
  FAQ_JSON_ESCAPED,
  FAQ_OBJECT,
  MAGNETTAFEL_DESCRIPTION,
  MAGNETTAFEL_SCRIPT2,
  MAGNETTAFEL_TAIL,
  OTHER_SCRIPT,
  PLAIN_TEXT,
  WANDBRIEFKASTEN_DESCRIPTION,
  WANDBRIEFKASTEN_SCRIPT2,
  WANDBRIEFKASTEN_TAIL,
} from './fixtures/categoryDescriptions';

describe('extractJsonLd - echte API-Form', () => {
  it('should lift the script2 block of category 1836 (Magnettafel) out of the visible html', () => {
    const { html, jsonLd } = extractJsonLd(MAGNETTAFEL_DESCRIPTION);

    expect(html).toBe(MAGNETTAFEL_DESCRIPTION.replace(MAGNETTAFEL_SCRIPT2, ''));
    expect(html.endsWith(MAGNETTAFEL_TAIL)).toBe(true);
    expect(html).not.toContain('@context');
    expect(jsonLd).toHaveLength(1);
    expect(jsonLd[0]?.['@type']).toBe('FAQPage');
    expect(jsonLd[0]?.['@context']).toBe('https://schema.org');
    expect(Array.isArray(jsonLd[0]?.mainEntity)).toBe(true);
    expect((jsonLd[0]?.mainEntity as unknown[]).length).toBe(2);
  });

  it('should lift the compact script2 block of category 1957 (Wandbriefkasten) that follows a closing div', () => {
    const { html, jsonLd } = extractJsonLd(WANDBRIEFKASTEN_DESCRIPTION);

    expect(html).toBe(WANDBRIEFKASTEN_DESCRIPTION.replace(WANDBRIEFKASTEN_SCRIPT2, ''));
    expect(html.endsWith(WANDBRIEFKASTEN_TAIL)).toBe(true);
    expect(jsonLd).toHaveLength(1);
    expect(jsonLd[0]?.['@type']).toBe('FAQPage');
  });

  it('should keep umlauts intact in the lifted object', () => {
    const { jsonLd } = extractJsonLd(WANDBRIEFKASTEN_DESCRIPTION);
    const questions = jsonLd[0]?.mainEntity as Array<{ name: string }>;

    expect(questions[0]?.name).toBe('Welche Größe sollte ein Wandbriefkasten haben?');
  });
});

describe('extractJsonLd - weitere Formen', () => {
  it('should handle a real script tag with ld+json type', () => {
    const input = `<p>Text davor.</p><script type="application/ld+json">${FAQ_JSON}</script><p>Text danach.</p>`;

    const { html, jsonLd } = extractJsonLd(input);

    expect(html).toBe('<p>Text davor.</p><p>Text danach.</p>');
    expect(jsonLd).toEqual([FAQ_OBJECT]);
  });

  it('should handle a script2 tag with single quotes, extra attributes and whitespace', () => {
    const input = `<p>Text.</p><script2 id="faq" type='application/ld+json' data-x="1">\n  ${FAQ_JSON}\n</script2 >`;

    const { html, jsonLd } = extractJsonLd(input);

    expect(html).toBe('<p>Text.</p>');
    expect(jsonLd).toEqual([FAQ_OBJECT]);
  });

  it('should handle escaped json inside a hidden div', () => {
    const input = `<p>Letzter Absatz.</p><div style="display:none;">${FAQ_JSON_ESCAPED}</div>`;

    const { html, jsonLd } = extractJsonLd(input);

    expect(html).toBe('<p>Letzter Absatz.</p>');
    expect(jsonLd).toEqual([FAQ_OBJECT]);
  });

  it('should handle naked escaped json as a text node and remove the paragraph it emptied', () => {
    const input = `<p>Letzter Absatz.</p><p>${FAQ_JSON_ESCAPED}</p>`;

    const { html, jsonLd } = extractJsonLd(input);

    expect(html).toBe('<p>Letzter Absatz.</p>');
    expect(jsonLd).toEqual([FAQ_OBJECT]);
  });

  it('should handle naked raw json at the end of a paragraph', () => {
    const input = `<p>Letzter Absatz. ${FAQ_JSON}</p>`;

    const { html, jsonLd } = extractJsonLd(input);

    expect(html).toBe('<p>Letzter Absatz. </p>');
    expect(jsonLd).toEqual([FAQ_OBJECT]);
  });

  it('should collect several fragments in document order', () => {
    const second = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [] };
    const input = `<script2 type="application/ld+json">${FAQ_JSON}</script2><p>Mitte</p><script type="application/ld+json">${JSON.stringify(second)}</script>`;

    const { html, jsonLd } = extractJsonLd(input);

    expect(html).toBe('<p>Mitte</p>');
    expect(jsonLd).toEqual([FAQ_OBJECT, second]);
  });

  it('should accept an array of json-ld objects inside one script', () => {
    const input = `<script type="application/ld+json">[${FAQ_JSON},${FAQ_JSON}]</script>`;

    const { jsonLd } = extractJsonLd(input);

    expect(jsonLd).toHaveLength(2);
  });
});

describe('extractJsonLd - nichts verschlucken', () => {
  it('should leave broken json exactly where it is', () => {
    const broken =
      '<script2 type="application/ld+json">{"@context": "https://schema.org", "@type": "FAQPage", </script2>';
    const input = `<p>Text.</p>${broken}`;

    const { html, jsonLd } = extractJsonLd(input);

    expect(html).toBe(input);
    expect(jsonLd).toEqual([]);
  });

  it('should leave naked text that starts like json-ld but never closes', () => {
    const input = '<p>{"@context": "https://schema.org", "@type": "FAQPage"</p>';

    const { html, jsonLd } = extractJsonLd(input);

    expect(html).toBe(input);
    expect(jsonLd).toEqual([]);
  });

  it('should return text without json-ld unchanged', () => {
    const { html, jsonLd } = extractJsonLd(PLAIN_TEXT);

    expect(html).toBe(PLAIN_TEXT);
    expect(jsonLd).toEqual([]);
  });

  it('should not touch scripts of another type', () => {
    const input = `<p>Text.</p>${OTHER_SCRIPT}`;

    const { html, jsonLd } = extractJsonLd(input);

    expect(html).toBe(input);
    expect(jsonLd).toEqual([]);
  });

  it('should ignore a json object without @context', () => {
    const input = '<script type="application/ld+json">{"foo": "bar"}</script>';

    const { html, jsonLd } = extractJsonLd(input);

    expect(html).toBe(input);
    expect(jsonLd).toEqual([]);
  });

  it('should return an empty result for an empty string', () => {
    expect(extractJsonLd('')).toEqual({ html: '', jsonLd: [] });
  });
});

describe('Hilfsfunktionen', () => {
  it('should decode the entities that occur in escaped json exactly one level', () => {
    expect(decodeHtmlEntities('&quot;a&quot; &amp; &lt;b&gt; &#39;c&#39;&nbsp;d')).toBe('"a" & <b> \'c\' d');
    expect(decodeHtmlEntities('&amp;quot;')).toBe('&quot;');
  });

  it('should escape < so a closing script tag inside the text cannot break out of the head', () => {
    const serialized = serializeJsonLd({ '@context': 'https://schema.org', text: '</script><b>' });

    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual({ '@context': 'https://schema.org', text: '</script><b>' });
  });

  it('should derive a stable head key from the content', () => {
    const key = jsonLdHeadKey(FAQ_JSON);

    expect(key.startsWith(JSON_LD_HEAD_KEY_PREFIX)).toBe(true);
    expect(jsonLdHeadKey(FAQ_JSON)).toBe(key);
    expect(jsonLdHeadKey(`${FAQ_JSON} `)).not.toBe(key);
  });
});
