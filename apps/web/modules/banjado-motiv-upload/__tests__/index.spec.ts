import { beforeEach, describe, expect, it, vi } from 'vitest';
import motivUploadModule from '../index';

const addComponent = vi.fn();

vi.mock('nuxt/kit', () => ({
  addComponent: (...args: unknown[]) => addComponent(...args),
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

const MODULE_COPY = './runtime/components/OrderProperties.vue';

const setupMotivUploadModule = () => {
  const hooks: { 'components:extend'?: ComponentsExtendHook } = {};

  const nuxt: NuxtMock = {
    hook: vi.fn((name: string, handler: ComponentsExtendHook) => {
      if (name === 'components:extend') hooks['components:extend'] = handler;
    }),
  };

  (motivUploadModule as unknown as { setup: (options: object, moduleNuxt: NuxtMock) => void }).setup({}, nuxt);

  return hooks;
};

describe('banjado-motiv-upload module', () => {
  beforeEach(() => {
    addComponent.mockClear();
  });

  it('should register the module copy of OrderProperties with a priority above the core scan', () => {
    setupMotivUploadModule();

    expect(addComponent).toHaveBeenCalledTimes(1);
    expect(addComponent).toHaveBeenCalledWith({
      name: 'OrderProperties',
      filePath: MODULE_COPY,
      priority: 100,
    });
  });

  it('should warn when the registry still points OrderProperties at the core', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const hooks = setupMotivUploadModule();

    hooks['components:extend']?.([
      { pascalName: 'OrderProperties', filePath: 'app/components/OrderProperties/OrderProperties.vue' },
    ]);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('NICHT gegriffen'));
    warn.mockRestore();
  });

  it('should stay quiet when the registry points at the module copy', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const hooks = setupMotivUploadModule();

    hooks['components:extend']?.([
      {
        pascalName: 'OrderProperties',
        filePath: 'modules/banjado-motiv-upload/runtime/components/OrderProperties.vue',
      },
    ]);

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('should not break the build if the core component is ever renamed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const hooks = setupMotivUploadModule();

    expect(() =>
      hooks['components:extend']?.([{ pascalName: 'PurchaseCard', filePath: 'app/components/PurchaseCard.vue' }]),
    ).not.toThrow();
    warn.mockRestore();
  });
});
