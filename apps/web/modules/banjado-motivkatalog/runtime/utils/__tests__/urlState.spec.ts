import { describe, expect, it } from 'vitest';
import {
  countActiveFacets,
  createEmptyFilterState,
  getActiveFilters,
  hasActiveFilters,
  parseFilterQuery,
  removeFacetValue,
  serializeFilterQuery,
  toQueryString,
  toggleFacetValue,
} from '../urlState';

describe('parseFilterQuery', () => {
  it('should read comma separated values and the search term', () => {
    expect(parseFilterQuery({ thema: 'Natur,Tiere', farbe: 'Blau', q: ' holz ' })).toEqual({
      thema: ['Natur', 'Tiere'],
      farbe: ['Blau'],
      neu: [],
      saison: [],
      q: 'holz',
    });
  });

  it('should keep umlauts and ampersands the way vue-router decodes them', () => {
    expect(parseFilterQuery({ thema: 'Blumen & Blüten', saison: 'Frühling' })).toEqual({
      ...createEmptyFilterState(),
      thema: ['Blumen & Blüten'],
      saison: ['Frühling'],
    });
  });

  it('should merge repeated parameters and drop duplicates and blanks', () => {
    expect(parseFilterQuery({ farbe: ['Blau', 'Rot,Blau', '', null] }).farbe).toEqual(['Blau', 'Rot']);
  });

  it('should ignore unknown parameters', () => {
    expect(parseFilterQuery({ page: '2', sort: 'x' })).toEqual(createEmptyFilterState());
  });

  it('should cap an overlong search term', () => {
    expect(parseFilterQuery({ q: 'a'.repeat(200) }).q).toHaveLength(80);
  });
});

describe('serializeFilterQuery', () => {
  it('should omit empty groups so the bare URL stays bare', () => {
    expect(serializeFilterQuery(createEmptyFilterState())).toEqual({});
  });

  it('should join values with commas and trim the term', () => {
    expect(serializeFilterQuery({ ...createEmptyFilterState(), thema: ['Natur', 'Tiere'], q: ' holz ' })).toEqual({
      thema: 'Natur,Tiere',
      q: 'holz',
    });
  });

  it('should survive a round trip with special characters', () => {
    const state = {
      ...createEmptyFilterState(),
      thema: ['Blumen & Blüten', 'Wolken & Himmel'],
      farbe: ['Schwarz-Weiß'],
    };

    expect(parseFilterQuery(serializeFilterQuery(state))).toEqual(state);
  });
});

describe('toQueryString', () => {
  it('should percent-encode umlauts and ampersands but keep the comma readable', () => {
    const state = { ...createEmptyFilterState(), thema: ['Blumen & Blüten', 'Natur'], q: 'Grün & Blau' };

    expect(toQueryString(state)).toBe('thema=Blumen%20%26%20Bl%C3%BCten,Natur&q=Gr%C3%BCn%20%26%20Blau');
  });

  it('should decode back to the same state through URLSearchParams', () => {
    const state = { ...createEmptyFilterState(), thema: ['Blumen & Blüten'], saison: ['Frühling'], q: 'Grün' };
    const query = Object.fromEntries(new URLSearchParams(toQueryString(state)));

    expect(parseFilterQuery(query)).toEqual(state);
  });

  it('should return an empty string without filters', () => {
    expect(toQueryString(createEmptyFilterState())).toBe('');
  });
});

describe('toggleFacetValue / removeFacetValue', () => {
  it('should add a value that is not selected yet', () => {
    expect(toggleFacetValue(createEmptyFilterState(), 'farbe', 'Blau').farbe).toEqual(['Blau']);
  });

  it('should remove a value that is selected', () => {
    const state = { ...createEmptyFilterState(), farbe: ['Blau', 'Rot'] };

    expect(toggleFacetValue(state, 'farbe', 'Blau').farbe).toEqual(['Rot']);
    expect(removeFacetValue(state, 'farbe', 'Rot').farbe).toEqual(['Blau']);
  });

  it('should not touch the other groups', () => {
    const state = { ...createEmptyFilterState(), thema: ['Natur'], q: 'holz' };

    expect(toggleFacetValue(state, 'farbe', 'Blau')).toEqual({ ...state, farbe: ['Blau'] });
  });
});

describe('hasActiveFilters / countActiveFacets / getActiveFilters', () => {
  it('should report no filters on the empty state', () => {
    expect(hasActiveFilters(createEmptyFilterState())).toBe(false);
    expect(countActiveFacets(createEmptyFilterState())).toBe(0);
    expect(getActiveFilters(createEmptyFilterState())).toEqual([]);
  });

  it('should count facets but not the search term', () => {
    const state = { ...createEmptyFilterState(), thema: ['Natur', 'Tiere'], saison: ['Sommer'], q: 'holz' };

    expect(hasActiveFilters(state)).toBe(true);
    expect(countActiveFacets(state)).toBe(3);
    expect(getActiveFilters(state)).toEqual([
      { key: 'thema', value: 'Natur' },
      { key: 'thema', value: 'Tiere' },
      { key: 'saison', value: 'Sommer' },
    ]);
  });

  it('should treat a search term alone as active', () => {
    expect(hasActiveFilters({ ...createEmptyFilterState(), q: 'holz' })).toBe(true);
  });
});
