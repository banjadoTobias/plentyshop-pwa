import { describe, expect, it, vi } from 'vitest';
import motivkatalogModule from '../index';
import {
  MOTIVKATALOG_API_ROUTE,
  MOTIVKATALOG_PATH,
  MOTIVKATALOG_ROUTE_NAME,
  MOTIVKATALOG_SEARCH_API_ROUTE,
} from '../runtime/config/constants';

const { extendPages, addServerHandler, addComponentsDir, addImportsDir } = vi.hoisted(() => ({
  extendPages: vi.fn(),
  addServerHandler: vi.fn(),
  addComponentsDir: vi.fn(),
  addImportsDir: vi.fn(),
}));

vi.mock('nuxt/kit', () => ({
  createResolver: () => ({
    resolve: (path: string) => path,
  }),
  defineNuxtModule: (moduleDefinition: unknown) => moduleDefinition,
  extendPages,
  addServerHandler,
  addComponentsDir,
  addImportsDir,
}));

type PageEntry = {
  name: string;
  path: string;
  file: string;
};

type LocaleEntry = {
  code: string;
  file: string;
};

type RegisterModuleOptions = {
  langDir: string;
  locales: LocaleEntry[];
};

type NuxtMock = {
  hook: (name: string, handler: (register: (options: RegisterModuleOptions) => void) => void) => void;
};

const setupModule = () => {
  const hooks: Record<string, (register: (options: RegisterModuleOptions) => void) => void> = {};

  const nuxt: NuxtMock = {
    hook: vi.fn((name, handler) => {
      hooks[name] = handler;
    }),
  };

  (motivkatalogModule as unknown as { setup: (options: object, moduleNuxt: NuxtMock) => void }).setup({}, nuxt);

  return hooks;
};

describe('banjado-motivkatalog module', () => {
  it('should register the /motivauswahl page from the module runtime', () => {
    setupModule();

    const pages: PageEntry[] = [];
    const extend = extendPages.mock.calls[0]?.[0] as (pages: PageEntry[]) => void;
    extend(pages);

    expect(pages).toEqual([
      {
        name: MOTIVKATALOG_ROUTE_NAME,
        path: MOTIVKATALOG_PATH,
        file: './runtime/pages/motivauswahl.vue',
      },
    ]);
  });

  it('should attach the catalog and the search route as GET handlers', () => {
    setupModule();

    const routes = addServerHandler.mock.calls.map((call) => call[0]);

    expect(routes).toEqual(
      expect.arrayContaining([
        { route: MOTIVKATALOG_API_ROUTE, method: 'get', handler: './runtime/server/motive.get' },
        { route: MOTIVKATALOG_SEARCH_API_ROUTE, method: 'get', handler: './runtime/server/suche.get' },
      ]),
    );
  });

  it('should expose components and composables from the runtime folder', () => {
    setupModule();

    expect(addComponentsDir).toHaveBeenCalledWith({ path: './runtime/components', pattern: '**/*.vue', priority: 1 });
    expect(addImportsDir).toHaveBeenCalledWith('./runtime/composables/**');
  });

  it('should register the german and english language files', () => {
    const hooks = setupModule();
    const register = vi.fn();

    hooks['i18n:registerModule']?.(register);

    expect(register).toHaveBeenCalledWith({
      langDir: './runtime/lang',
      locales: [
        { code: 'de', file: 'de.json' },
        { code: 'en', file: 'en.json' },
      ],
    });
  });
});
