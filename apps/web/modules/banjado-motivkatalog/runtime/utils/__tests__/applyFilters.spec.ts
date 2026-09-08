import { describe, expect, it } from 'vitest';
import { applyFilters, matchesNumber, matchesSearch, normalizeSearchTerm, searchTags } from '../applyFilters';
import { createEmptyFilterState } from '../urlState';
import { item, items } from './fixtures';

const numbers = (list: { n: string }[]) => list.map((entry) => entry.n);

describe('normalizeSearchTerm', () => {
  it('should trim, lowercase and collapse whitespace', () => {
    expect(normalizeSearchTerm('  Trockenes   HOLZ ')).toBe('trockenes holz');
  });

  it('should cap very long input', () => {
    expect(normalizeSearchTerm('a'.repeat(200))).toHaveLength(80);
  });
});

describe('matchesNumber', () => {
  it('should match with and without the leading zero', () => {
    expect(matchesNumber('0010', '10')).toBe(true);
    expect(matchesNumber('0010', '0010')).toBe(true);
    expect(matchesNumber('10003', '10')).toBe(true);
    expect(matchesNumber('10003', '0010')).toBe(false);
  });
});

describe('matchesSearch', () => {
  it('should match everything with an empty term', () => {
    expect(matchesSearch(item('0010', 'Sonnengelb'), '')).toBe(true);
  });

  it('should search the title case-insensitively', () => {
    expect(matchesSearch(item('10787', 'Trockenes Holz'), 'holz')).toBe(true);
    expect(matchesSearch(item('10003', 'Bambus'), 'holz')).toBe(false);
  });

  it('should treat digits as a number prefix search', () => {
    expect(matchesSearch(item('10787', 'Trockenes Holz'), '107')).toBe(true);
    expect(matchesSearch(item('10787', 'Trockenes Holz'), '108')).toBe(false);
  });

  it('should accept tag hits from the server', () => {
    expect(matchesSearch(item('10003', 'Bambus'), 'holz', new Set(['10003']))).toBe(true);
  });
});

describe('applyFilters', () => {
  it('should return everything without filters', () => {
    expect(applyFilters(items, createEmptyFilterState())).toHaveLength(items.length);
  });

  it('should combine values inside a group with OR', () => {
    const state = { ...createEmptyFilterState(), thema: ['Tiere', 'Abstrakt'] };

    expect(numbers(applyFilters(items, state))).toEqual(['0010', '10004']);
  });

  it('should combine groups with AND', () => {
    const state = { ...createEmptyFilterState(), thema: ['Natur'], farbe: ['Schwarz'] };

    expect(numbers(applyFilters(items, state))).toEqual(['12061']);
  });

  it('should apply the search on top of the facets', () => {
    const state = { ...createEmptyFilterState(), saison: ['Sommer'], q: 'Stein' };

    expect(numbers(applyFilters(items, state))).toEqual(['12061']);
  });

  it('should find by number prefix', () => {
    const state = { ...createEmptyFilterState(), q: '100' };

    expect(numbers(applyFilters(items, state))).toEqual(['10003', '10004']);
  });

  it('should mix in tag hits from the server', () => {
    const state = { ...createEmptyFilterState(), q: 'welpe' };

    expect(numbers(applyFilters(items, state, new Set(['10004'])))).toEqual(['10004']);
  });
});

describe('searchTags', () => {
  const search = { '10003': '10003 | bambus | holz | pflanze', '10004': '10004 | bulldogge | hund | welpe' };

  it('should return the numbers whose tags contain the term', () => {
    expect(searchTags(search, 'Holz')).toEqual(['10003']);
  });

  it('should return nothing for an empty term', () => {
    expect(searchTags(search, '   ')).toEqual([]);
  });
});
