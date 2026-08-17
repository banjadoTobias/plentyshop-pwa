import { describe, expect, it } from 'vitest';
import { checkResolution, requiredPixels, PRINT_DPI } from '../runtime/utils/resolution-check';
import { DEFAULT_MOTIV_FORMAT, resolveMotivFormat } from '../runtime/config/motiv-formate';

const briefkasten = DEFAULT_MOTIV_FORMAT;

describe('Aufloesungs-Ampel', () => {
  it('should require 2244 x 2717 px for the letterbox at 150 dpi', () => {
    expect(PRINT_DPI).toBe(150);
    expect(requiredPixels(briefkasten)).toEqual({ width: 2244, height: 2717 });
  });

  it('should show green once the image covers the printable area', () => {
    const verdict = checkResolution(3200, 3800, briefkasten);

    expect(verdict.level).toBe('ok');
    expect(verdict.dpi).toBe(210);
    expect(verdict.text).toContain('3200 × 3800 px');
    expect(verdict.text).toContain('38 × 46 cm');
  });

  it('should still be green when the image exactly matches the requirement', () => {
    expect(checkResolution(2244, 2717, briefkasten).level).toBe('ok');
  });

  it('should show amber between 60 and 100 percent and name the recommendation', () => {
    const verdict = checkResolution(1800, 2100, briefkasten);

    expect(verdict.level).toBe('warn');
    expect(verdict.dpi).toBe(116);
    expect(verdict.text).toContain('2244 × 2717 px (150 dpi)');
  });

  it('should treat the amber boundary as still printable', () => {
    expect(checkResolution(1347, 1631, briefkasten).level).toBe('warn');
    expect(checkResolution(1346, 1630, briefkasten).level).toBe('bad');
  });

  it('should show red for a phone screenshot and name the measured numbers', () => {
    const verdict = checkResolution(900, 1600, briefkasten);

    expect(verdict.level).toBe('bad');
    expect(verdict.text).toContain('900 × 1600 px');
    expect(verdict.text).toContain('60 dpi');
  });

  it('should judge by the tighter of the two axes', () => {
    // Breit genug, aber viel zu flach: die Hoehe entscheidet.
    expect(checkResolution(4000, 900, briefkasten).level).toBe('bad');
  });

  it('should not claim a resolution when the dimensions are unusable', () => {
    const verdict = checkResolution(0, Number.NaN, briefkasten);

    expect(verdict.level).toBe('bad');
    expect(verdict.dpi).toBe(0);
    expect(verdict.text).toContain('nicht auslesen');
  });

  it('should fall back to the letterbox format for unknown products', () => {
    expect(resolveMotivFormat(null)).toEqual(briefkasten);
    expect(resolveMotivFormat('gibt-es-nicht')).toEqual(briefkasten);
    expect(resolveMotivFormat(' Briefkasten ')).toEqual(briefkasten);
  });
});
