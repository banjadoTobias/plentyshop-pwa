import { describe, expect, it } from 'vitest';
import { countFacets } from '../countFacets';
import { createEmptyFilterState } from '../urlState';
import { items } from './fixtures';

describe('countFacets', () => {
  it('should count every value without filters', () => {
    const counts = countFacets(items, createEmptyFilterState());

    expect(counts.thema.Natur).toBe(2);
    expect(counts.farbe.Braun).toBe(2);
    expect(counts.neu['NEUE Motive']).toBe(1);
    expect(counts.saison.Sommer).toBe(3);
  });

  it('should ignore the own group so that further OR values show their real gain', () => {
    const state = { ...createEmptyFilterState(), thema: ['Tiere'] };
    const counts = countFacets(items, state);

    expect(counts.thema.Natur).toBe(2);
    expect(counts.thema.Tiere).toBe(1);
  });

  it('should apply the other groups with AND', () => {
    const state = { ...createEmptyFilterState(), farbe: ['Braun'] };
    const counts = countFacets(items, state);

    expect(counts.thema.Natur).toBeUndefined();
    expect(counts.thema.Oberflächen).toBe(1);
    expect(counts.saison.Sommer).toBe(1);
  });

  it('should apply the search to every group', () => {
    const state = { ...createEmptyFilterState(), q: 'holz' };
    const counts = countFacets(items, state, new Set(['10003']));

    expect(counts.thema.Oberflächen).toBe(2);
    expect(counts.thema.Tiere).toBeUndefined();
  });
});
