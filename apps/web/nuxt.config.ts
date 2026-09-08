// https://nuxt.com/docs/api/configuration/nuxt-config
import { validateApiUrl } from './app/utils/pathHelper';
import { nuxtI18nOptions } from './app/configuration/i18n.config';
import { appConfiguration } from './app/configuration/app.config';
import cookieConfig from './app/configuration/cookie.config';
import { paths } from './app/utils/paths';
import settingsConfig from './app/configuration/settings.config';
import featureFlagsConfig from './app/configuration/feature-flags.config';
import { FailOnLargeChunksPlugin, FailOnForbiddenDataInPublicFolderPlugin } from './app/configuration/vite.config';
import { FailOnUnmarkedBlockOverridesPlugin } from './app/configuration/vite.block-overrides';
import { thirdPartyDeps, localPackageDeps } from './app/configuration/optimize-deps.config';

export default defineNuxtConfig({
  srcDir: 'app/',
  telemetry: false,
  devtools: { enabled: true },
  css: ['~/assets/richtext.css'],
  typescript: {
    typeCheck: false, // type checking runs via `npm run typecheck`, on build, and in CI (fitness-code-quality)
  },
  app: appConfiguration,
  experimental: {
    asyncContext: true,
  },
  appConfig: {
    titleSuffix: process.env.NAME || 'PlentyONE Shop',
    fallbackCurrency: 'GBP',
  },
  imports: {
    dirs: ['~/composables', '~/composables/**', '~/utils/**'],
  },
  vite: {
    server: {
      fs: {
        allow: ['../../..'], // relative to the current nuxt.config.ts
      },
    },
    plugins: [FailOnLargeChunksPlugin, FailOnForbiddenDataInPublicFolderPlugin, FailOnUnmarkedBlockOverridesPlugin],
    resolve: {
      // cookiejs (via nuxt-viewport) ships a UMD `browser` entry without a default export.
      // Vite 8 resolves to it and breaks the client bundle; force the ESM build instead.
      alias: {
        cookiejs: 'cookiejs/dist/cookie.esm.js',
      },
    },
    optimizeDeps: {
      include: [...thirdPartyDeps, ...localPackageDeps],
    },
    build: {
      modulePreload: { polyfill: false },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('utils/blocks/blocks-imports')) return 'block-registry';
            if (/[/\\]blocks[/\\].+[/\\]defaults\.ts$/.test(id)) return 'block-registry';

            const vendorChunks: Record<string, string[]> = {
              tiptapExtensions: [
                '@tiptap/extension-color',
                '@tiptap/extension-emoji',
                '@tiptap/extension-highlight',
                '@tiptap/extension-placeholder',
                '@tiptap/extension-text-align',
                '@tiptap/extension-text-style',
              ],
              tiptap: ['@tiptap/'],
            };

            for (const [chunk, packages] of Object.entries(vendorChunks)) {
              if (packages.some((pkg) => id.includes(pkg))) return chunk;
            }
          },
        },
      },
    },
  },
  nitro: {
    prerender: {
      crawlLinks: false,
    },
    compressPublicAssets: true,
  },
  routeRules: {
    // Keine /_ipx-Regel: image.provider ist 'none', ipx laeuft nicht, die Route existiert nicht.
    '/_nuxt-plenty/icons/**': { headers: { 'cache-control': `public, max-age=31536000, immutable` } },
    '/_nuxt-plenty/favicon.ico': { headers: { 'cache-control': `public, max-age=86400` } },
    '/_nuxt-plenty/images/**': { headers: { 'cache-control': `max-age=604800` } },
    '/favicon.ico': { redirect: { to: '/_nuxt-plenty/favicon.ico', statusCode: 301 } },
  },
  image: {
    provider: 'none',
  },
  pages: true,
  runtimeConfig: {
    public: {
      domain: validateApiUrl(process.env.API_URL) ?? process.env.API_ENDPOINT,
      apiEndpoint: process.env.API_ENDPOINT,
      activeLanguages: process.env.LANGUAGELIST || 'en,de',
      disabledEditorSettings: process.env?.ENABLE_ALL_EDITOR_SETTINGS === '1' ? [] : [],
      cookieGroups: cookieConfig,
      turnstileSiteKey: process.env?.CLOUDFLARETURNSTILEAPISITEKEY ?? '',
      noCache: process.env.NO_CACHE || '',
      configId: process.env.CONFIG_ID || '',
      ...settingsConfig,
      ...featureFlagsConfig,
    },
  },
  modules: [
    '@plentymarkets/shop-core',
    '@plentymarkets/shop-module-mollie',
    '@plentymarkets/shop-module-gtag',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/test-utils/module',
    // vor @nuxtjs/i18n, sonst ist der Hook i18n:registerModule schon gelaufen
    // und im Zubehoer-Kasten stuenden die rohen Uebersetzungsschluessel
    '~~/modules/banjado-zubehoer',
    // Motivkatalog bringt eigene Sprachdateien mit, deshalb ebenfalls vor @nuxtjs/i18n.
    // Nuxt wuerde modules/* auch von allein einsammeln - dann aber erst NACH den
    // hier gelisteten Modulen, also zu spaet fuer i18n:registerModule.
    '~~/modules/banjado-motivkatalog',
    '@nuxtjs/i18n',
    '~~/modules/locale-routes',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/turnstile',
    'nuxt-lazy-hydrate',
    'nuxt-viewport',
    '@vee-validate/nuxt',
    '@vite-pwa/nuxt',
    // 'vuetify-nuxt-module' bewusst NICHT geladen (Stand 08.09.2026): das Modul haengt
    // createVuetify() als Client-Plugin an jede Seite (243 KB roh / 67 KB brotli JS je
    // Aufruf), genutzt wurde Vuetify aber nur vom Editor-Bildwaehler UiImageTable.
    // Den ersetzt modules/banjado-bloecke/runtime/components/UiImageTable.vue ohne Vuetify.
    // Die Pakete vuetify-nuxt-module und @mdi/js bleiben in package.json installiert
    // (ungenutzt), damit ein Upstream-Merge nicht an der Abhaengigkeit scheitert.
    'nuxt-color-picker',
  ],
  plentySitemap: {
    locales: (process.env.LANGUAGELIST || 'en,de').split(','),
    defaultLocale: nuxtI18nOptions.defaultLocale,
    exclude: [
      '/search',
      '/offline',
      '/my-account**',
      '/readonly-checkout',
      '/set-new-password',
      '/reset-password-success',
      '/cart',
      '/checkout',
      '/confirmation',
      '/wishlist',
      '/login',
      '/register',
      '/reset-password',
      '/favicon.ico',
    ],
  },
  shopCore: {
    apiUrl: validateApiUrl(process.env.API_URL) ?? 'http://localhost:8181',
    apiEndpoint: process.env.API_ENDPOINT,
    configId: Number(process.env.CONFIG_ID) || 1,
    middlewareSSRUrl: 'http://localhost:8181',
  },
  shopModuleMollie: {
    checkoutUrl: paths.checkout,
    liveMode: !process.env.MOLLIE_TEST_MODE,
    confirmationUrl: paths.confirmation,
  },
  fonts: {
    // Vuetify brachte font-family:var(--v-font-body,"Roboto",sans-serif) ins CSS;
    // @nuxt/fonts fand das und lud Roboto von Google nach. Vuetify ist inzwischen raus,
    // der Eintrag bleibt als Sicherung: taucht "Roboto" ueber ein anderes Paket wieder
    // im CSS auf, laedt trotzdem nichts. Zusammen mit dem System-Stapel in
    // tailwind.config.ts laedt der Shop keine einzige Schriftdatei.
    families: [{ name: 'Roboto', provider: 'none' }],
    defaults: {
      weights: [300, 400, 500, 700],
      preload: true,
    },
    assets: {
      prefix: '/_nuxt-plenty/fonts/',
    },
  },
  i18n: nuxtI18nOptions,
  tailwindcss: {
    configPath: '~/configuration/tailwind.config.ts',
    exposeConfig: true,
  },
  viewport: {
    breakpoints: {
      xs: 380,
      sm: 640,
      md: 768,
      lg: 1024,
      '4xl': 1920,
    },
    defaultBreakpoints: {
      mobile: 'sm',
      tablet: 'md',
      desktop: 'lg',
      wideScreen: '4xl',
    },
    fallbackBreakpoint: 'lg',
    cookie: {
      expires: 365,
      name: 'plenty-viewport',
      path: '/',
      sameSite: 'Strict',
      secure: true,
    },
  },
  veeValidate: {
    autoImports: false,
    componentNames: {
      Form: 'VeeForm',
      Field: 'VeeField',
      FieldArray: 'VeeFieldArray',
      ErrorMessage: 'VeeErrorMessage',
    },
  },
  pwa: {
    registerType: 'prompt',
    workbox: {
      navigateFallback: null,
      // Nur die App-Icons vorab cachen. Mit '**/*.{js,css,...}' lud der Service Worker
      // jedem Erstbesucher den kompletten Build (531 JS-Chunks, 5,6 MB, inkl. Editor)
      // im Hintergrund nach - mobil Datenvolumen und Akku ohne Nutzen. Die JS-Chunks
      // haengen ohnehin am HTTP-Cache mit immutable-Headern. Die Offline-Seite kommt
      // weiterhin ueber additionalManifestEntries in den Precache, Bilder ueber den
      // Runtime-Cache unten.
      globPatterns: ['_nuxt-plenty/icons/*'],
      globIgnores: ['manifest**.webmanifest'],
      additionalManifestEntries: [
        {
          url: '/offline',
          revision: Math.random().toString(32),
        },
      ],
      navigationPreload: true,
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            precacheFallback: {
              fallbackURL: '/offline',
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'plenty-image-cache',
            expiration: {
              maxEntries: 300,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
      cleanupOutdatedCaches: true,
    },
    manifest: {
      name: process.env.NUXT_PUBLIC_OG_TITLE || process.env.OG_TITLE || 'PlentyONE Shop',
      short_name: process.env.NUXT_PUBLIC_OG_TITLE || process.env.OG_TITLE || 'PlentyONE Shop',
      description: process.env.NUXT_PUBLIC_META_DESCRIPTION || process.env.METADESC || 'PlentyONE Shop',
      theme_color: process.env.NUXT_PUBLIC_PRIMARY_COLOR || '#062633',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/_nuxt-plenty/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/_nuxt-plenty/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/_nuxt-plenty/icons/icon-512x512.maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    registerWebManifestInRouteRules: true,
  },
});
