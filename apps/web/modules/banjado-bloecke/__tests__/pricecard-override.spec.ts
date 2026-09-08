import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import banjadoBloeckeModule from '../index';

/**
 * Text-Pruefungen fuer den PriceCard-Override und den mobilen Kaufbalken. Die Komponenten
 * selbst haengen an Nuxt-Auto-Imports (useProducts, useCart, ...) und werden hier nicht
 * gemountet - die Nuxt-Testumgebung laeuft auf dieser Maschine nicht. Geprueft wird, was
 * den Build oder die Editor-Vorschau kaputt machen wuerde: Marker, Referenzen, Varianten.
 */

const readSource = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');

const priceCardOverride = readSource('../runtime/components/blocks/PriceCard/PriceCard.vue');
const stickyBuy = readSource('../runtime/components/BanjadoStickyBuy.vue');
const imageTable = readSource('../runtime/components/UiImageTable.vue');
const nuxtConfig = readSource('../../../nuxt.config.ts');

/** Viewport-Varianten ohne @: sm:, md:, lg:, xl:, 2xl:, max-md: usw. am Anfang eines Klassennamens. */
const BARE_RESPONSIVE_VARIANT = /(^|[\s"'`])(max-|min-)?(2?xs|sm|md|lg|xl|2xl|3xl|4xl):/m;

const pageViewComponents = {
  'BanjadoHero.vue': readSource('../runtime/components/blocks/BanjadoHero/BanjadoHero.vue'),
  'BanjadoSteps.vue': readSource('../runtime/components/blocks/BanjadoSteps/BanjadoSteps.vue'),
  'BanjadoCategoryTiles.vue': readSource('../runtime/components/blocks/BanjadoCategoryTiles/BanjadoCategoryTiles.vue'),
  'BanjadoMotifBand.vue': readSource('../runtime/components/blocks/BanjadoMotifBand/BanjadoMotifBand.vue'),
  'BanjadoTrust.vue': readSource('../runtime/components/blocks/BanjadoTrust/BanjadoTrust.vue'),
  'PriceCard.vue': priceCardOverride,
  'BanjadoStickyBuy.vue': stickyBuy,
};

describe('PriceCard override', () => {
  it('should declare the core-block override marker in line 1', () => {
    const firstLine = priceCardOverride.split('\n')[0];

    expect(firstLine).toBe('<!-- @overrides-core-block -->');
  });

  it('should keep the core purchase card and add the sticky buy bar', () => {
    expect(priceCardOverride).toContain('<UiPurchaseCard :product="currentProduct" :configuration="content" />');
    expect(priceCardOverride).toContain('<BanjadoStickyBuy');
    expect(priceCardOverride).toContain(':anchor="cardRef"');
  });

  it('should import the block props from the core types, not a module copy', () => {
    expect(priceCardOverride).toContain("from '~/components/blocks/PriceCard/types'");
  });
});

describe('BanjadoStickyBuy', () => {
  it('should submit the purchase-card form via requestSubmit so validation and plugins run', () => {
    expect(stickyBuy).toContain('form[data-testid="purchase-card"]');
    expect(stickyBuy).toContain('requestSubmit()');
    expect(stickyBuy).not.toMatch(/\.submit\(\)/);
  });

  it('should stay hidden in the editor and above tablet width', () => {
    expect(stickyBuy).toContain('useEditorState()');
    expect(stickyBuy).toContain('@md:hidden');
  });

  it('should use the semantic z-index token and brand tokens', () => {
    expect(stickyBuy).toContain('z-sticky');
    expect(stickyBuy).toContain('border-brand-line');
    expect(stickyBuy).toContain('shadow-brand-lg');
    expect(stickyBuy).not.toMatch(/z-\d+|z-\[/);
  });

  it('should use UiButton instead of SfButton', () => {
    expect(stickyBuy).toContain('<UiButton');
    expect(stickyBuy).not.toContain('SfButton');
  });
});

describe('page-view components', () => {
  it.each(Object.entries(pageViewComponents))('should use container-query variants only in %s', (_name, source) => {
    expect(source).not.toMatch(BARE_RESPONSIVE_VARIANT);
  });

  it('should not carry sizes attributes that do nothing with image.provider none', () => {
    expect(pageViewComponents['BanjadoHero.vue']).not.toContain('sizes=');
    expect(pageViewComponents['BanjadoCategoryTiles.vue']).not.toContain('sizes=');
  });
});

describe('UiImageTable replacement', () => {
  it('should not import or render anything from vuetify', () => {
    // Der Kommentar darf Vuetify nennen (Begruendung fuer den Ersatz); Code und Template nicht.
    expect(imageTable).not.toMatch(/from ['"]vuetify/);
    expect(imageTable).not.toMatch(/<(VCard|VDataTable|VTextField|v-card|v-data-table|v-text-field)\b/);
  });

  it('should keep the props and emits of the core ImageTable', () => {
    expect(imageTable).toContain('selectedKey: string | null;');
    expect(imageTable).toContain("(e: 'update:selectedKey', value: string | null): void;");
    expect(imageTable).toContain("(e: 'select', item: { name: string; image: string }): void;");
    expect(imageTable).toContain("(e: 'unselect'): void;");
  });

  it('should offer sorting per column and a show-more step instead of VDataTable paging', () => {
    expect(imageTable).toContain('@click="toggleSort(header.key)"');
    expect(imageTable).toContain('data-testid="image-table-show-more"');
  });

  it('should keep the data-testids the editor Cypress suites click on', () => {
    expect(imageTable).toContain('data-testid="image-table-file-name"');
    expect(imageTable).toContain('data-testid="image-table-thumbnail"');
  });
});

describe('nuxt.config.ts', () => {
  it('should not load the vuetify module or chunk any more', () => {
    expect(nuxtConfig).not.toContain("'vuetify-nuxt-module',");
    expect(nuxtConfig).not.toContain("vuetify: ['vuetify/'");
    expect(nuxtConfig).not.toMatch(/^\s*vuetify: \{/m);
  });

  it('should precache only the app icons', () => {
    expect(nuxtConfig).toContain("globPatterns: ['_nuxt-plenty/icons/*']");
    expect(nuxtConfig).not.toContain('**/*.{js,json,css');
  });

  it('should register banjado-motivkatalog before @nuxtjs/i18n', () => {
    const motivkatalog = nuxtConfig.indexOf("'~~/modules/banjado-motivkatalog'");
    const i18n = nuxtConfig.indexOf("'@nuxtjs/i18n'");

    expect(motivkatalog).toBeGreaterThan(-1);
    expect(motivkatalog).toBeLessThan(i18n);
  });
});

vi.mock('nuxt/kit', () => ({
  addComponent: vi.fn(),
  addComponentsDir: vi.fn(),
  createResolver: () => ({
    resolve: (path: string) => path,
  }),
  defineNuxtModule: (moduleDefinition: unknown) => moduleDefinition,
}));

type ComponentEntry = {
  pascalName: string;
  filePath: string;
};

type ComponentsExtendHook = (components: ComponentEntry[]) => void;

type NuxtMock = {
  hook: (name: string, handler: ComponentsExtendHook) => void;
};

const setupModule = async () => {
  const kit = await import('nuxt/kit');
  const hooks: { 'components:extend'?: ComponentsExtendHook } = {};

  const nuxt: NuxtMock = {
    hook: vi.fn((name: string, handler: ComponentsExtendHook) => {
      if (name === 'components:extend') {
        hooks['components:extend'] = handler;
      }
    }),
  };

  (banjadoBloeckeModule as unknown as { setup: (options: object, moduleNuxt: NuxtMock) => void }).setup({}, nuxt);

  return { hooks, kit };
};

describe('banjado-bloecke module registration', () => {
  it('should replace UiImageTable with priority 100 and register the components dir without it and without blocks', async () => {
    const { kit } = await setupModule();

    expect(kit.addComponent).toHaveBeenCalledWith({
      name: 'UiImageTable',
      filePath: './runtime/components/UiImageTable.vue',
      priority: 100,
    });
    expect(kit.addComponentsDir).toHaveBeenCalledWith(
      expect.objectContaining({
        path: './runtime/components',
        priority: 1,
        ignore: ['**/UiImageTable.vue', '**/blocks/**'],
      }),
    );
  });

  it('should warn when the UiImageTable replacement did not take effect', async () => {
    const { hooks } = await setupModule();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    hooks['components:extend']?.([
      { pascalName: 'UiImageTable', filePath: 'app/components/ui/ImageTable/ImageTable.vue' },
    ]);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('UiImageTable'));
    warn.mockRestore();
  });

  it('should stay quiet when the replacement points at this module', async () => {
    const { hooks } = await setupModule();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    hooks['components:extend']?.([
      { pascalName: 'UiImageTable', filePath: 'modules/banjado-bloecke/runtime/components/UiImageTable.vue' },
    ]);

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
