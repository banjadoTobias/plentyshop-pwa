import { addComponent, createResolver, defineNuxtModule } from 'nuxt/kit';

export default defineNuxtModule({
  meta: {
    name: 'banjado-motiv-upload',
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const overridePath = resolver.resolve('./runtime/components/OrderProperties.vue');

    /**
     * Ausgetauscht wird OrderProperties, nicht OrderPropertyFileUpload.
     * OrderProperties.vue im Kern importiert die Upload-Komponente statisch und
     * benutzt die Import-Bindung im Mapper — der Vite-Resolver fragt die
     * Auto-Import-Registry dort gar nicht erst. Ein Eintrag auf
     * OrderPropertyFileUpload bliebe also gruen und wirkungslos.
     * OrderProperties selbst wird in PurchaseCard.vue per Auto-Import
     * eingebunden, hier zieht der Austausch.
     */
    /**
     * Der Austausch laeuft ueber addComponent mit hoeherer Prioritaet, nicht
     * ueber eine Mutation in components:extend. Gemessen am 17.08.2026: die
     * Mutation von filePath wird von einem spaeteren Scan wieder ueberschrieben,
     * der Eintrag zeigt danach weiter auf den Kern. addComponent ist der Weg,
     * den auch modules/paypal geht.
     */
    addComponent({
      name: 'OrderProperties',
      filePath: overridePath,
      priority: 100,
    });

    nuxt.hook('components:extend', (components) => {
      const orderProperties = components.find((component) => component.pascalName === 'OrderProperties');
      if (!orderProperties?.filePath.includes('banjado-motiv-upload')) {
        console.warn('[banjado-motiv-upload] Austausch von OrderProperties hat NICHT gegriffen');
      }
    });
  },
});
