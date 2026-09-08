import { afterEach, describe, expect, it, vi } from 'vitest';
import kategorieModule from '../index';
import { COMPONENT_OVERRIDES, MODULE_NAME, OVERRIDE_PRIORITY } from '../runtime/config/constants';

const addComponent = vi.fn();

vi.mock('nuxt/kit', () => ({
  addComponent: (options: unknown) => addComponent(options),
  createResolver: () => ({
    resolve: (path: string) => `modules/${MODULE_NAME}/${path.replace('./', '')}`,
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

const setupModule = () => {
  const hooks: { 'components:extend'?: ComponentsExtendHook } = {};

  const nuxt: NuxtMock = {
    hook: vi.fn((name: string, handler: ComponentsExtendHook) => {
      if (name === 'components:extend') {
        hooks['components:extend'] = handler;
      }
    }),
  };

  (kategorieModule as unknown as { setup: (options: object, moduleNuxt: NuxtMock) => void }).setup({}, nuxt);

  return hooks;
};

describe('banjado-kategorie module', () => {
  afterEach(() => {
    addComponent.mockClear();
  });

  it('should register both filter components with a priority above the core scan', () => {
    setupModule();

    expect(addComponent).toHaveBeenCalledTimes(COMPONENT_OVERRIDES.length);
    expect(addComponent).toHaveBeenCalledWith({
      name: 'CategoryFiltersSortSections',
      filePath: `modules/${MODULE_NAME}/runtime/components/CategoryFilters/SortSections.vue`,
      priority: OVERRIDE_PRIORITY,
    });
    expect(addComponent).toHaveBeenCalledWith({
      name: 'CategoryFiltersFilter',
      filePath: `modules/${MODULE_NAME}/runtime/components/CategoryFilters/Filter.vue`,
      priority: OVERRIDE_PRIORITY,
    });
  });

  it('should warn when a core component still points at the core file', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const hooks = setupModule();

    hooks['components:extend']?.([
      { pascalName: 'CategoryFiltersSortSections', filePath: 'app/components/CategoryFilters/SortSections.vue' },
      {
        pascalName: 'CategoryFiltersFilter',
        filePath: `modules/${MODULE_NAME}/runtime/components/CategoryFilters/Filter.vue`,
      },
    ]);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('CategoryFiltersSortSections');
    warn.mockRestore();
  });

  it('should stay quiet when both overrides took effect', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const hooks = setupModule();

    hooks['components:extend']?.(
      COMPONENT_OVERRIDES.map((override) => ({
        pascalName: override.name,
        filePath: `modules/${MODULE_NAME}/${override.path.replace('./', '')}`,
      })),
    );

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
