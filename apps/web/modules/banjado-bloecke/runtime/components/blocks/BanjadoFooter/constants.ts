import type {
  BanjadoFooterBar,
  BanjadoFooterBrand,
  BanjadoFooterContact,
  BanjadoFooterNewsletter,
  BanjadoFooterSocial,
  BanjadoSocialNetwork,
} from './types';

export const BANJADO_FOOTER_BLOCK_NAME = 'BanjadoFooter';

/**
 * Schluessel in der Block-Bibliothek. Der Quick-Add des Footers sucht darueber
 * (useBlocksList.getBlockTemplateByLanguage nimmt den Schluessel, nicht das
 * Feld "category"), deshalb muss er in quick-add-options.ts gleich lauten.
 */
export const BANJADO_FOOTER_BLOCKS_LIST_KEY = 'banjadoFooter';

/** Bibliotheks-Kategorie aller banjado-Bloecke. */
export const BANJADO_BLOCKS_CATEGORY = 'banjado';

/** Anzeigename in Block-Bibliothek und Footer-Quick-Add. */
export const BANJADO_FOOTER_TITLE = 'banjado Fußzeile';

/** Farben des FooterContainer-Rahmens: brand-sand und brand-ink-2 aus tailwind.config.ts. */
export const BANJADO_FOOTER_BACKGROUND = '#F8F7F3';
export const BANJADO_FOOTER_TEXT = '#4A5145';

export const COPYRIGHT_YEAR_PLACEHOLDER = '{year}';
export const PRIVACY_POLICY_PLACEHOLDER = '{privacyPolicy}';

/** Plenty-Standardordner fuer Newsletter-Anmeldungen (wie der Core-Block NewsletterSubscribe). */
export const DEFAULT_EMAIL_FOLDER_ID = 1;

/** Absolute Ziele (https:, mailto:, tel:, //host) laufen nicht durch localePath. */
export const EXTERNAL_HREF_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export const SOCIAL_NETWORKS: BanjadoSocialNetwork[] = ['facebook', 'instagram', 'pinterest', 'youtube'];

export const EMPTY_BRAND: BanjadoFooterBrand = { logoText: '', logoImage: '', claim: '' };
export const EMPTY_CONTACT: BanjadoFooterContact = { lead: '', phone: '', phoneHref: '', hours: '', email: '' };
export const EMPTY_SOCIAL: BanjadoFooterSocial = { title: '', items: [] };
export const EMPTY_NEWSLETTER: BanjadoFooterNewsletter = {
  enabled: false,
  title: '',
  emailPlaceholder: '',
  consentText: '',
  privacyPolicyLabel: '',
  buttonLabel: '',
  hint: '',
  emailFolderId: DEFAULT_EMAIL_FOLDER_ID,
};
export const EMPTY_BAR: BanjadoFooterBar = { priceNote: '', copyright: '' };
