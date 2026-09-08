<template>
  <div>
    <EditorFormPanel v-model="brandOpen" title="Marke & Kontakt" data-testid="banjado-footer-form">
      <div class="py-2">
        <UiFormLabel>Wortmarke</UiFormLabel>
        <SfInput v-model="footerContent.brand.logoText" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Logo-Bild-URL (leer = Wortmarke als Text)</UiFormLabel>
        <SfInput v-model="footerContent.brand.logoImage" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Claim</UiFormLabel>
        <textarea v-model="footerContent.brand.claim" rows="2" :class="textareaClass" />
      </div>
      <div class="py-2">
        <UiFormLabel>Zeile über der Telefonnummer</UiFormLabel>
        <SfInput v-model="footerContent.contact.lead" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Telefon (Anzeige)</UiFormLabel>
        <SfInput v-model="footerContent.contact.phone" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Telefon (wählbar, z. B. tel:+4935243460400)</UiFormLabel>
        <SfInput v-model="footerContent.contact.phoneHref" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Erreichbarkeit</UiFormLabel>
        <SfInput v-model="footerContent.contact.hours" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>E-Mail</UiFormLabel>
        <SfInput v-model="footerContent.contact.email" type="email" />
      </div>
    </EditorFormPanel>

    <EditorFormPanel v-model="columnsOpen" title="Link-Spalten" data-testid="banjado-footer-form-columns">
      <div
        v-for="(column, columnIndex) in footerContent.columns"
        :key="columnIndex"
        class="border-b border-gray-200 py-2 last:border-b-0"
      >
        <UiFormLabel>Spalte {{ columnIndex + 1 }} — Titel</UiFormLabel>
        <SfInput v-model="column.title" type="text" />
        <div v-for="(link, linkIndex) in column.links" :key="linkIndex" class="mt-3 rounded-md bg-gray-50 p-2">
          <div class="flex items-center justify-between">
            <UiFormLabel>Link {{ linkIndex + 1 }} — Text</UiFormLabel>
            <button
              type="button"
              class="text-xs text-editor-danger hover:underline"
              @click="removeLink(column, linkIndex)"
            >
              Entfernen
            </button>
          </div>
          <SfInput v-model="link.label" type="text" />
          <UiFormLabel class="mt-2">Ziel (Pfad wie /shipping oder https://…)</UiFormLabel>
          <SfInput v-model="link.href" type="text" />
        </div>
        <UiButton variant="secondary" size="sm" class="mt-3" @click="addLink(column)">Link hinzufügen</UiButton>
      </div>
    </EditorFormPanel>

    <EditorFormPanel v-model="socialOpen" title="Community" data-testid="banjado-footer-form-social">
      <div class="py-2">
        <UiFormLabel>Überschrift</UiFormLabel>
        <SfInput v-model="footerContent.social.title" type="text" />
      </div>
      <div
        v-for="(item, itemIndex) in footerContent.social.items"
        :key="itemIndex"
        class="border-t border-gray-200 py-2"
      >
        <div class="flex items-center justify-between">
          <UiFormLabel>Netzwerk {{ itemIndex + 1 }}</UiFormLabel>
          <button type="button" class="text-xs text-editor-danger hover:underline" @click="removeSocialItem(itemIndex)">
            Entfernen
          </button>
        </div>
        <select v-model="item.network" :class="selectClass">
          <option v-for="network in SOCIAL_NETWORKS" :key="network" :value="network">{{ network }}</option>
        </select>
        <UiFormLabel class="mt-2">Name (für Screenreader)</UiFormLabel>
        <SfInput v-model="item.label" type="text" />
        <UiFormLabel class="mt-2">Profil-URL</UiFormLabel>
        <SfInput v-model="item.href" type="text" />
      </div>
      <UiButton variant="secondary" size="sm" class="mt-3" @click="addSocialItem">Netzwerk hinzufügen</UiButton>
    </EditorFormPanel>

    <EditorFormPanel v-model="newsletterOpen" title="Newsletter" data-testid="banjado-footer-form-newsletter">
      <label class="flex items-center gap-2 py-2">
        <SfSwitch v-model="footerContent.newsletter.enabled" />
        <span class="text-sm">Newsletter-Anmeldung anzeigen</span>
      </label>
      <div class="py-2">
        <UiFormLabel>Überschrift</UiFormLabel>
        <SfInput v-model="footerContent.newsletter.title" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Platzhalter im E-Mail-Feld</UiFormLabel>
        <SfInput v-model="footerContent.newsletter.emailPlaceholder" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Einwilligungstext ({{ PRIVACY_POLICY_PLACEHOLDER }} wird zum Link)</UiFormLabel>
        <textarea v-model="footerContent.newsletter.consentText" rows="3" :class="textareaClass" />
      </div>
      <div class="py-2">
        <UiFormLabel>Linktext Datenschutzerklärung</UiFormLabel>
        <SfInput v-model="footerContent.newsletter.privacyPolicyLabel" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Knopf-Beschriftung</UiFormLabel>
        <SfInput v-model="footerContent.newsletter.buttonLabel" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Hinweis unter dem Formular</UiFormLabel>
        <SfInput v-model="footerContent.newsletter.hint" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Plenty-E-Mail-Ordner (ID)</UiFormLabel>
        <SfInput v-model="footerContent.newsletter.emailFolderId" type="number" min="1" />
      </div>
    </EditorFormPanel>

    <EditorFormPanel v-model="barOpen" title="Fußleiste" data-testid="banjado-footer-form-bar">
      <div class="py-2">
        <UiFormLabel>Preishinweis</UiFormLabel>
        <SfInput v-model="footerContent.bar.priceNote" type="text" />
      </div>
      <div class="py-2">
        <UiFormLabel>Copyright ({{ COPYRIGHT_YEAR_PLACEHOLDER }} = aktuelles Jahr)</UiFormLabel>
        <SfInput v-model="footerContent.bar.copyright" type="text" />
      </div>
    </EditorFormPanel>
  </div>
</template>

<script setup lang="ts">
import { SfInput, SfSwitch } from '@storefront-ui/vue';
import type {
  BanjadoFooterBar,
  BanjadoFooterBrand,
  BanjadoFooterColumn,
  BanjadoFooterCompleteContent,
  BanjadoFooterContact,
  BanjadoFooterContent,
  BanjadoFooterNewsletter,
  BanjadoFooterProps,
  BanjadoFooterSocial,
} from './types';
import {
  COPYRIGHT_YEAR_PLACEHOLDER,
  EMPTY_BAR,
  EMPTY_BRAND,
  EMPTY_CONTACT,
  EMPTY_NEWSLETTER,
  EMPTY_SOCIAL,
  PRIVACY_POLICY_PLACEHOLDER,
  SOCIAL_NETWORKS,
} from './constants';

const brandOpen = ref(true);
const columnsOpen = ref(false);
const socialOpen = ref(false);
const newsletterOpen = ref(false);
const barOpen = ref(false);

const textareaClass = 'w-full rounded-md border border-gray-300 p-2 text-sm';
const selectClass = 'w-full rounded-md border border-gray-300 p-2 text-sm';

const props = defineProps<BanjadoFooterProps>();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();

// Inhalt wie in BanjadoHeroForm direkt am Block-Objekt vervollstaendigen, damit jedes v-model ein Ziel hat.
const footerContent = computed<BanjadoFooterCompleteContent>(() => {
  const uuid = props.meta?.uuid || blockUuid.value;
  const content = (findOrDeleteBlockByUuid(data.value, uuid)?.content ?? {}) as Partial<BanjadoFooterContent>;

  content.brand = { ...EMPTY_BRAND, ...content.brand } as BanjadoFooterBrand;
  content.contact = { ...EMPTY_CONTACT, ...content.contact } as BanjadoFooterContact;
  content.social = { ...EMPTY_SOCIAL, ...content.social } as BanjadoFooterSocial;
  content.newsletter = { ...EMPTY_NEWSLETTER, ...content.newsletter } as BanjadoFooterNewsletter;
  content.bar = { ...EMPTY_BAR, ...content.bar } as BanjadoFooterBar;
  if (!content.columns) {
    content.columns = [];
  }
  if (!content.social.items) {
    content.social.items = [];
  }

  return content as BanjadoFooterCompleteContent;
});

const addLink = (column: BanjadoFooterColumn) => {
  column.links.push({ label: '', href: '' });
};

const removeLink = (column: BanjadoFooterColumn, index: number) => {
  column.links.splice(index, 1);
};

const addSocialItem = () => {
  footerContent.value.social.items.push({ network: 'facebook', label: '', href: '' });
};

const removeSocialItem = (index: number) => {
  footerContent.value.social.items.splice(index, 1);
};
</script>
