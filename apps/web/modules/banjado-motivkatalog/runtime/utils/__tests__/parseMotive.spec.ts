import { describe, expect, it } from 'vitest';
import { normalizeMotive, parseMotivSource, splitMotivName, stripBom } from '../parseMotive';
import { sourceEntries, sourceEntry } from './fixtures';

const BOM = '﻿';

describe('stripBom', () => {
  it('should remove a leading byte order mark', () => {
    expect(stripBom(`${BOM}[]`)).toBe('[]');
  });

  it('should leave text without byte order mark untouched', () => {
    expect(stripBom('[]')).toBe('[]');
  });
});

describe('parseMotivSource', () => {
  it('should parse the S3 file that starts with a byte order mark', () => {
    const text = `${BOM}${JSON.stringify(sourceEntries)}`;

    expect(parseMotivSource(text)).toHaveLength(sourceEntries.length);
  });

  it('should drop rows without a name', () => {
    const text = JSON.stringify([{ src: 'x.webp' }, sourceEntry('0010', 'Sonnengelb'), null, 'text']);

    expect(parseMotivSource(text)).toHaveLength(1);
  });

  it('should throw when the file is not a list', () => {
    expect(() => parseMotivSource('{"a":1}')).toThrow();
  });
});

describe('splitMotivName', () => {
  it('should keep the leading zero of the number', () => {
    expect(splitMotivName('0010 - Sonnengelb')).toEqual({ number: '0010', title: 'Sonnengelb' });
  });

  it('should keep a dash inside the title', () => {
    expect(splitMotivName('13593 - Blauer Marmor - Gold')).toEqual({ number: '13593', title: 'Blauer Marmor - Gold' });
  });

  it('should take the number from the image path when the name has none', () => {
    expect(splitMotivName('Sonnengelb', 'https://cdn/200x200px/0010.webp')).toEqual({
      number: '0010',
      title: 'Sonnengelb',
    });
  });

  it('should return an empty number when neither name nor path carries one', () => {
    expect(splitMotivName('Sonnengelb', '')).toEqual({ number: '', title: 'Sonnengelb' });
  });
});

describe('normalizeMotive', () => {
  const catalog = normalizeMotive(sourceEntries, '2026-09-08T00:00:00.000Z');

  it('should keep the first row of a duplicated number', () => {
    const duplicates = catalog.items.filter((entry) => entry.n === '20000');

    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]?.t).toBe('Blumen');
    expect(catalog.items).toHaveLength(sourceEntries.length - 1);
  });

  it('should rename the outlier theme Struktur to Oberflächen', () => {
    expect(catalog.items.find((entry) => entry.n === '10003')?.th).toEqual(['Natur', 'Oberflächen']);
    expect(catalog.facets.thema.some((facet) => facet.wert === 'Struktur')).toBe(false);
  });

  it('should keep only the NEUE styles and drop Standard and Einfarbig', () => {
    expect(catalog.items.find((entry) => entry.n === '10004')?.s).toEqual(['NEUE Motive']);
    expect(catalog.items.find((entry) => entry.n === '0010')?.s).toEqual([]);
    expect(catalog.facets.neu).toEqual([{ wert: 'NEUE Motive', anzahl: 1 }]);
  });

  it('should drop season values that occur fewer than three times', () => {
    expect(catalog.items.find((entry) => entry.n === '10004')?.sa).toEqual(['Sommer']);
    expect(catalog.facets.saison.map((facet) => facet.wert)).toEqual(['Sommer']);
  });

  it('should sort facets by count and then alphabetically', () => {
    expect(catalog.facets.farbe.slice(0, 2)).toEqual([
      { wert: 'Braun', anzahl: 2 },
      { wert: 'Beige', anzahl: 1 },
    ]);
  });

  it('should keep the tags out of the items and put them lowercased into the search map', () => {
    const bulldog = catalog.items.find((entry) => entry.n === '10004');

    expect(bulldog).not.toHaveProperty('tags');
    expect(catalog.search['10004']).toContain('welpe');
  });

  it('should carry the given timestamp', () => {
    expect(catalog.generatedAt).toBe('2026-09-08T00:00:00.000Z');
  });
});
