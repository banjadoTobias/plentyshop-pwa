import { describe, expect, it } from 'vitest';
import { formatCount } from '../formatCount';
import { getMotifImageUrl } from '../motifImage';

describe('getMotifImageUrl', () => {
  it('should build the thumbnail url with the leading zero kept', () => {
    expect(getMotifImageUrl('0010')).toBe(
      'https://banjado.s3.eu-central-1.amazonaws.com/banjado-Motivmappe/200x200px/0010.webp',
    );
  });

  it('should use the requested size folder', () => {
    expect(getMotifImageUrl('10864', '2000x2000px')).toBe(
      'https://banjado.s3.eu-central-1.amazonaws.com/banjado-Motivmappe/2000x2000px/10864.webp',
    );
  });
});

describe('formatCount', () => {
  it('should use the german thousands separator', () => {
    expect(formatCount(2402, 'de')).toBe('2.402');
  });

  it('should fall back to the bare number on an unknown locale', () => {
    expect(formatCount(2402, 'not-a-locale-at-all!')).toBe('2402');
  });
});
