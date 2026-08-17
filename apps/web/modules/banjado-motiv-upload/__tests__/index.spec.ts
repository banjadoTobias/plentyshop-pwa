import { describe, expect, it, vi } from 'vitest';
import motivUploadModule from '../index';

vi.mock('nuxt/kit', () => ({
  createResolver: () => ({
    resolve: (path: string) => path,
  }),
  defineNuxtModule: (moduleDefinition: unknown) => moduleDefinition,
}));

type ComponentEntry = {
  pascalName: string;
  filePath: string;
  shortPath: string;
};

type ComponentsExtendHook = (components: ComponentEntry[]) => void;

type NuxtMock = {
  hook: (name: string, handler: ComponentsExtendHook) => void;
};

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

const coreComponent = (pascalName: string): ComponentEntry => ({
  pascalName,
  filePath: `app/components/${pascalName}/${pascalName}.vue`,
  shortPath: `app/components/${pascalName}/${pascalName}.vue`,
});

describe('banjado-motiv-upload module', () => {
  it('should point OrderProperties at the module copy', () => {
    const hooks = setupMotivUploadModule();
    const orderProperties = coreComponent('OrderProperties');

    hooks['components:extend']?.([orderProperties]);

    expect(orderProperties.filePath).toBe('./runtime/components/OrderProperties.vue');
    expect(orderProperties.shortPath).toBe('./runtime/components/OrderProperties.vue');
  });

  it('should leave every other component untouched', () => {
    const hooks = setupMotivUploadModule();
    const fileUpload = coreComponent('OrderPropertyFileUpload');
    const purchaseCard = coreComponent('PurchaseCard');

    hooks['components:extend']?.([fileUpload, purchaseCard]);

    expect(fileUpload.filePath).toBe('app/components/OrderPropertyFileUpload/OrderPropertyFileUpload.vue');
    expect(purchaseCard.filePath).toBe('app/components/PurchaseCard/PurchaseCard.vue');
  });

  it('should not break the build if the core component is ever renamed', () => {
    const hooks = setupMotivUploadModule();

    expect(() => hooks['components:extend']?.([coreComponent('PurchaseCard')])).not.toThrow();
  });
});
