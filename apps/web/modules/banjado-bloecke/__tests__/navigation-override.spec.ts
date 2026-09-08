import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Textpruefung der beiden Core-Block-Overrides im Modul banjado-bloecke.
 * Bewusst ohne Nuxt-Mount: Die Nuxt-Testumgebung ist auf dieser Maschine kaputt, und die
 * Eigenschaften, die hier zaehlen (Marker, Container-Klassen, erhaltene Mechanik), stehen
 * literal im Quelltext. Tailwind erzeugt Klassen ohnehin nur, wenn sie literal vorkommen.
 */

const OVERRIDE_MARKER = '<!-- @overrides-core-block -->';
const CONTENT_WIDTH_CLASSES = ['mx-auto', 'max-w-[1280px]'];
const BLOCKS_DIR = new URL('../runtime/components/blocks/', import.meta.url);

const overridePath = (relativePath: string) => fileURLToPath(new URL(relativePath, BLOCKS_DIR));

const readOverride = (relativePath: string) => readFileSync(overridePath(relativePath), 'utf8');

const firstLineOf = (source: string) => source.split(/\r?\n/, 1)[0];

/** Liefert die erste Zeile, die den Anker enthaelt - so prueft der Test das richtige Element. */
const lineContaining = (source: string, anchor: string) => {
  const line = source.split(/\r?\n/).find((candidate) => candidate.includes(anchor));
  expect(line, `Zeile mit "${anchor}" nicht gefunden`).toBeDefined();
  return line ?? '';
};

const navigation = readOverride('Navigation/Navigation.vue');
const utilityBar = readOverride('UtilityBar/UtilityBar.vue');

describe('banjado-bloecke core block overrides', () => {
  describe('override marker', () => {
    it('should declare the Navigation override in line 1', () => {
      expect(firstLineOf(navigation)).toBe(OVERRIDE_MARKER);
    });

    it('should declare the UtilityBar override in line 1', () => {
      expect(firstLineOf(utilityBar)).toBe(OVERRIDE_MARKER);
    });

    it('should not ship defaults.ts or a Form next to the overrides (would duplicate the block picker entry)', () => {
      const forbidden = [
        'Navigation/defaults.ts',
        'Navigation/NavigationForm.vue',
        'UtilityBar/defaults.ts',
        'UtilityBar/UtilityBarForm.vue',
      ];

      forbidden.forEach((file) => {
        expect(existsSync(overridePath(file)), `${file} darf nicht existieren`).toBe(false);
      });
    });
  });

  describe('Navigation override', () => {
    it('should import its props type from the core block instead of a local types.ts', () => {
      expect(navigation).toContain("from '~/components/blocks/Navigation/types'");
      expect(navigation).not.toContain("from './types'");
    });

    it('should center the mega menu dropdown on the content width while keeping left/right anchors', () => {
      const dropdownLine = lineContaining(navigation, 'left-0 right-0');

      CONTENT_WIDTH_CLASSES.forEach((cssClass) => expect(dropdownLine).toContain(cssClass));
      expect(dropdownLine).toContain('grid-cols-4');
    });

    it('should give the dropdown the brand look instead of the generic shadow', () => {
      expect(navigation).toContain('shadow-brand-lg');
      expect(navigation).toContain('rounded-b-brand');
      expect(navigation).toContain('border-brand-line');
      expect(navigation).not.toContain('shadow-lg ');
    });

    it('should wrap the category list in a centered content-width container with the banjado inset', () => {
      const containerLine = lineContaining(navigation, 'const NAVIGATION_CONTAINER_CLASSES');

      CONTENT_WIDTH_CLASSES.forEach((cssClass) => expect(containerLine).toContain(cssClass));
      expect(containerLine).toContain('w-full');
      expect(containerLine).toContain('px-4 @md:px-6');
    });

    it('should keep the bar background and divider edge-to-edge on the nav carrier', () => {
      expect(navigation).toContain(':class="NAVIGATION_BAR_CLASSES"');
      expect(navigation).toContain(':style="navigationBarStyle"');
      expect(lineContaining(navigation, 'const NAVIGATION_BAR_CLASSES')).toContain('border-b nav-border');
    });

    it('should keep the hover, keyboard, touch and router mechanics of the core block', () => {
      const preservedMechanics = [
        'useDropdown({',
        '@mouseenter="onCategoryMouseEnter(menuNode)"',
        '@mouseleave="onMouseLeave"',
        '@touchstart="onTouchStart"',
        '@keydown.enter="onEnterKey"',
        '@keydown.esc="focusTrigger(index)"',
        'router.afterEach(',
        '<SfDrawer',
      ];

      preservedMechanics.forEach((snippet) => expect(navigation).toContain(snippet));
    });
  });

  describe('UtilityBar override', () => {
    it('should import its props type from the core block instead of a local types.ts', () => {
      expect(utilityBar).toContain("from '~/components/blocks/UtilityBar/types'");
      expect(utilityBar).not.toContain("from './types'");
    });

    it('should center logo, search and actions in a content-width container inside the edge-to-edge bar', () => {
      const containerLine = lineContaining(utilityBar, 'const UTILITY_BAR_CONTAINER_CLASSES');

      CONTENT_WIDTH_CLASSES.forEach((cssClass) => expect(containerLine).toContain(cssClass));
      expect(containerLine).toContain('flex');
      expect(containerLine).toContain('flex-nowrap');
      expect(containerLine).toContain('items-center');
      expect(utilityBar).toContain(':class="UTILITY_BAR_CONTAINER_CLASSES"');
    });

    it('should keep the background on the outer desktop bar that Cypress addresses', () => {
      const outerBarStyle = lineContaining(
        utilityBar,
        'backgroundColor: headerBackgroundColor, ...verticalPaddingStyles',
      );

      expect(outerBarStyle).toContain(':style');
      expect(utilityBar).toContain('data-testid="navbar-top-desktop"');
      expect(utilityBar).toContain('data-testid="navbar-top-mobile"');
    });
  });
});
