import { describe, expect, it } from 'vitest';
import {
  normalizePreviewVersion,
  normalizeWunschmotivNumber,
  previewConfirmationText,
  readPreviewLink,
} from '../runtime/utils/preview-link';

describe('Zuordnung zur Vorschau', () => {
  it('should bring every spelling of the number into the form used in the mail', () => {
    expect(normalizeWunschmotivNumber('12345')).toBe('WM 12345');
    expect(normalizeWunschmotivNumber('wm12345')).toBe('WM 12345');
    expect(normalizeWunschmotivNumber('WM-12345')).toBe('WM 12345');
    expect(normalizeWunschmotivNumber('  WM 12345 ')).toBe('WM 12345');
  });

  it('should keep a number it does not recognise instead of dropping it', () => {
    expect(normalizeWunschmotivNumber('WM 12345 B')).toBe('WM 12345 B');
  });

  it('should return nothing for input that carries no number', () => {
    expect(normalizeWunschmotivNumber('')).toBe('');
    expect(normalizeWunschmotivNumber(undefined)).toBe('');
    expect(normalizeWunschmotivNumber(42)).toBe('');
  });

  it('should strip characters that have no place in an order property', () => {
    expect(normalizeWunschmotivNumber('<script>12345</script>')).toBe('SCRIPT12345SCRIPT');
  });

  it('should cap what a manipulated link can write into the order', () => {
    expect(normalizeWunschmotivNumber('1'.repeat(64))).toBe(`WM ${'1'.repeat(32)}`);
    expect(normalizePreviewVersion('2'.repeat(64))).toHaveLength(32);
  });

  it('should read the link from the preview mail', () => {
    expect(readPreviewLink({ wm: '12345', v: '2' })).toEqual({
      wunschmotivNumber: 'WM 12345',
      previewVersion: '2',
    });
  });

  it('should take the first value when the query carries a parameter twice', () => {
    expect(readPreviewLink({ wm: ['12345', '99999'], v: ['2'] })).toEqual({
      wunschmotivNumber: 'WM 12345',
      previewVersion: '2',
    });
  });

  it('should accept a link without a version, because the mail may omit it', () => {
    expect(readPreviewLink({ wm: '12345' })).toEqual({
      wunschmotivNumber: 'WM 12345',
      previewVersion: '',
    });
  });

  it('should not open the panel without a number', () => {
    expect(readPreviewLink({ v: '2' })).toBeNull();
    expect(readPreviewLink({})).toBeNull();
    expect(readPreviewLink(null)).toBeNull();
  });

  it('should confirm what was filled in, and mention the version only when there is one', () => {
    expect(previewConfirmationText({ wunschmotivNumber: 'WM 12345', previewVersion: '2' })).toBe(
      'Ihre Vorschau ist eingetragen: WM 12345, Version 2.',
    );
    expect(previewConfirmationText({ wunschmotivNumber: 'WM 12345', previewVersion: '' })).toBe(
      'Ihre Vorschau ist eingetragen: WM 12345.',
    );
  });

  it('should keep the version free of stray whitespace', () => {
    expect(normalizePreviewVersion(' 2 ')).toBe('2');
    expect(normalizePreviewVersion('v 2')).toBe('v2');
  });
});
