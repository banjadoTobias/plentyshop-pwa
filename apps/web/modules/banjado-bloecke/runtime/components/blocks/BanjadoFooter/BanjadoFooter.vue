<template>
  <section
    class="-mt-10 border-t border-brand-line bg-brand-sand text-sm text-brand-ink-2"
    data-testid="banjado-footer"
  >
    <!--
      Der FooterContainer (Kern) rendert ueber jedem Kind ein festes pt-10 (40px) in
      derselben Sandfarbe (configuration.colors aus footer/factory.ts). -mt-10 zieht den
      Block unter diesen Rand, damit die Trennlinie (border-t, Prototyp v2) an der
      Oberkante des Footers sitzt und nicht 40px tiefer in der Sandflaeche. Aendert sich
      das pt-10 im Kern, wandert die Linie nur um die Differenz - nichts bricht.
      Container: 1280px wie im Prototyp (max-w-screen-xl = screens.xl in tailwind.config.ts).
    -->
    <div class="mx-auto max-w-screen-xl px-4 pb-6 pt-12 @md:px-6">
      <!-- Reihe 1: Marke mit Kontakt, dann die Link-Spalten -->
      <div class="grid grid-cols-1 gap-8 @sm:grid-cols-2 @lg:grid-cols-11 @lg:gap-9">
        <div class="@sm:col-span-2 @lg:col-span-3" data-testid="banjado-footer-brand">
          <NuxtLink
            :to="localePath(paths.home)"
            class="inline-block text-2xl font-bold tracking-tight text-brand-ink"
            :aria-label="`${brand.logoText} Startseite`"
          >
            <NuxtImg
              v-if="brand.logoImage"
              :src="brand.logoImage"
              :alt="brand.logoText"
              class="h-8 w-auto"
              loading="lazy"
            />
            <template v-else>{{ brand.logoText }}<sup class="text-xs font-normal">®</sup></template>
          </NuxtLink>
          <p v-if="brand.claim" class="mt-3 max-w-xs">{{ brand.claim }}</p>

          <div class="mt-5" data-testid="banjado-footer-contact">
            <p v-if="contact.lead" class="text-xs font-semibold uppercase tracking-widest text-brand-ink-3">
              {{ contact.lead }}
            </p>
            <a
              v-if="contact.phone"
              :href="contact.phoneHref || undefined"
              class="mt-1 inline-block text-lg font-bold tracking-tight text-brand-ink transition-colors hover:text-brand-green-ink"
              data-testid="banjado-footer-phone"
            >
              {{ contact.phone }}
            </a>
            <p v-if="contact.hours || contact.email" class="mt-1">
              <span v-if="contact.hours">{{ contact.hours }}</span>
              <span v-if="contact.hours && contact.email"> · </span>
              <a
                v-if="contact.email"
                :href="`mailto:${contact.email}`"
                class="transition-colors hover:text-brand-green-ink hover:underline"
                data-testid="banjado-footer-email"
              >
                {{ contact.email }}
              </a>
            </p>
          </div>
        </div>

        <nav
          v-for="(column, columnIndex) in columns"
          :key="columnIndex"
          class="@lg:col-span-2"
          :aria-label="column.title"
          data-testid="banjado-footer-column"
        >
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-ink">{{ column.title }}</h3>
          <ul class="grid gap-2">
            <li v-for="(link, linkIndex) in column.links" :key="linkIndex">
              <NuxtLink
                :to="link.to"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener' : undefined"
                class="transition-colors hover:text-brand-green-ink hover:underline"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Reihe 2: Newsletter (mobil zuerst) und Community -->
      <div
        v-if="newsletter.enabled || social.items.length"
        class="mt-10 grid grid-cols-1 gap-8 border-t border-brand-line pt-8 @lg:grid-cols-2 @lg:gap-9"
      >
        <form
          v-if="newsletter.enabled"
          class="@lg:order-2"
          data-testid="banjado-footer-newsletter"
          @submit.prevent="subscribeNewsletter"
        >
          <h3 v-if="newsletter.title" class="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-ink">
            {{ newsletter.title }}
          </h3>
          <div class="flex flex-col gap-2 @sm:flex-row">
            <label :for="emailInputId" class="sr-only">{{ t('newsletter.email') }}</label>
            <input
              :id="emailInputId"
              v-model.trim="email"
              type="email"
              name="email"
              autocomplete="email"
              required
              :placeholder="newsletter.emailPlaceholder"
              class="h-11 min-w-0 flex-1 rounded-brand border border-brand-line bg-white px-3 text-brand-ink placeholder:text-brand-ink-3 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green-tint"
              data-testid="banjado-footer-newsletter-email"
            />
            <UiButton type="submit" :disabled="loading" data-testid="banjado-footer-newsletter-submit">
              <SfLoaderCircular v-if="loading" size="sm" />
              <template v-else>{{ newsletter.buttonLabel }}</template>
            </UiButton>
          </div>
          <label class="mt-3 flex items-start gap-2 text-xs leading-5">
            <input
              v-model="consent"
              type="checkbox"
              name="privacyPolicy"
              required
              class="mt-0.5 h-4 w-4 flex-none accent-brand-green"
              data-testid="banjado-footer-newsletter-consent"
            />
            <span>
              {{ consentParts.before }}
              <NuxtLink
                v-if="consentParts.hasLink"
                :to="localePath(paths.privacyPolicy)"
                target="_blank"
                class="underline transition-colors hover:text-brand-green-ink"
              >
                {{ newsletter.privacyPolicyLabel }}
              </NuxtLink>
              {{ consentParts.after }}
            </span>
          </label>
          <NuxtTurnstile
            v-if="turnstileSiteKey.length > 0 && turnstileLoad"
            ref="turnstileElement"
            v-model="turnstile"
            :site-key="turnstileSiteKey"
            :options="{ theme: 'light' }"
            class="mt-3"
          />
          <p v-if="newsletter.hint" class="mt-2 text-2xs text-brand-ink-3">{{ newsletter.hint }}</p>
        </form>

        <div v-if="social.items.length" class="@lg:order-1" data-testid="banjado-footer-social">
          <h3 v-if="social.title" class="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-ink">
            {{ social.title }}
          </h3>
          <ul class="flex flex-wrap gap-3">
            <li v-for="(item, itemIndex) in social.items" :key="itemIndex">
              <a
                :href="item.href"
                target="_blank"
                rel="noopener"
                :aria-label="item.label"
                :title="item.label"
                class="flex h-11 w-11 items-center justify-center rounded-brand border border-brand-line bg-white text-brand-ink-2 transition-colors hover:border-brand-green hover:text-brand-green-ink"
              >
                <!-- Monochrome Strichzeichnungen wie im Vertrauensband (BanjadoTrust), keine bunten Netzwerk-Logos. -->
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <template v-if="item.network === 'facebook'">
                    <path
                      d="M14.2 21v-7.3h2.5l.4-2.9h-2.9V8.9c0-.9.3-1.5 1.6-1.5h1.5V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4v2.1H8.3v2.9h2.6V21"
                    />
                  </template>
                  <template v-else-if="item.network === 'instagram'">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                    <circle cx="12" cy="12" r="3.8" />
                    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
                  </template>
                  <template v-else-if="item.network === 'pinterest'">
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M9.6 19.5 11.9 10" />
                    <path
                      d="M10.5 12.6c.5.9 1.4 1.4 2.4 1.4 1.9 0 3.2-1.6 3.2-3.6 0-2.1-1.7-3.6-4-3.6-2.6 0-4.4 1.8-4.4 4.1 0 .9.3 1.7.9 2.3"
                    />
                  </template>
                  <template v-else>
                    <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
                    <path d="M10 9.3v5.4l4.6-2.7z" fill="currentColor" stroke="none" />
                  </template>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Reihe 3: Fussleiste -->
      <div
        class="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-brand-line pt-4 text-xs text-brand-ink-3"
        data-testid="banjado-footer-bar"
      >
        <span v-if="bar.priceNote">{{ bar.priceNote }}</span>
        <span v-if="copyright" class="ml-auto" data-testid="banjado-footer-copyright">{{ copyright }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SfLoaderCircular } from '@storefront-ui/vue';
import type {
  BanjadoFooterBar,
  BanjadoFooterBrand,
  BanjadoFooterContact,
  BanjadoFooterLink,
  BanjadoFooterNewsletter,
  BanjadoFooterProps,
  BanjadoFooterResolvedColumn,
  BanjadoFooterResolvedLink,
  BanjadoFooterSocial,
} from './types';
import {
  DEFAULT_EMAIL_FOLDER_ID,
  EMPTY_BAR,
  EMPTY_BRAND,
  EMPTY_CONTACT,
  EMPTY_NEWSLETTER,
  EMPTY_SOCIAL,
} from './constants';
import { isExternalHref, renderCopyright, splitConsentText } from './utils';

const props = defineProps<BanjadoFooterProps>();

const localePath = useLocalizedPath();
const { subscribe, loading } = useNewsletter();
const { send } = useNotification();
const { getSetting } = useSiteSettings('cloudflareTurnstileApiSiteKey');
const turnstileSiteKey = getSetting() ?? '';

const brand = computed<BanjadoFooterBrand>(() => ({ ...EMPTY_BRAND, ...props.content?.brand }));
const contact = computed<BanjadoFooterContact>(() => ({ ...EMPTY_CONTACT, ...props.content?.contact }));
const social = computed<BanjadoFooterSocial>(() => ({ ...EMPTY_SOCIAL, ...props.content?.social }));
const newsletter = computed<BanjadoFooterNewsletter>(() => ({ ...EMPTY_NEWSLETTER, ...props.content?.newsletter }));
const bar = computed<BanjadoFooterBar>(() => ({ ...EMPTY_BAR, ...props.content?.bar }));

const resolveLink = (link: BanjadoFooterLink): BanjadoFooterResolvedLink => {
  const external = isExternalHref(link.href);

  return { label: link.label, external, to: external ? link.href : localePath(link.href) };
};

// Unvollstaendige Zeilen (frisch im Editor angelegt) werden nicht gerendert.
const columns = computed<BanjadoFooterResolvedColumn[]>(() =>
  (props.content?.columns ?? []).map((column) => ({
    title: column.title,
    links: (column.links ?? []).filter((link) => link.label && link.href).map(resolveLink),
  })),
);

const consentParts = computed(() => splitConsentText(newsletter.value.consentText));
const copyright = computed(() => renderCopyright(bar.value.copyright, new Date().getFullYear()));

const emailInputId = `banjado-footer-newsletter-email-${useId()}`;
const email = ref('');
const consent = ref(false);
const turnstile = ref('');
const turnstileLoad = ref(false);
const turnstileElement = ref();

// Gleiche Mechanik wie der Core-Block NewsletterSubscribe: Turnstile erst laden,
// sobald jemand tippt, und ohne Token nicht absenden, sonst lehnt Plenty ab.
const subscribeNewsletter = async () => {
  if (!email.value || !consent.value) {
    return;
  }

  if (turnstileSiteKey.length > 0 && !turnstile.value) {
    send({ type: 'negative', message: t('error.newsletter.turnstileRequired') });
    return;
  }

  const response = await subscribe({
    email: email.value,
    emailFolder: Number(newsletter.value.emailFolderId) || DEFAULT_EMAIL_FOLDER_ID,
    'cf-turnstile-response': turnstile.value,
  });

  if (response) {
    send({ type: 'positive', message: t('newsletter.success') });
    email.value = '';
    consent.value = false;
  }

  turnstile.value = '';
  turnstileElement.value?.reset();
};

if (turnstileSiteKey.length > 0) {
  const stopTurnstileWatcher = watch(email, (value) => {
    if (value.length > 0) {
      turnstileLoad.value = true;
      stopTurnstileWatcher();
    }
  });
}
</script>
