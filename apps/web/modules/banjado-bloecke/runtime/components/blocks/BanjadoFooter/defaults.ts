import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';
import type { BlocksList } from '~/composables/useBlocksList/types';
import type { BanjadoFooterContent } from './types';
import {
  BANJADO_BLOCKS_CATEGORY,
  BANJADO_FOOTER_BLOCK_NAME,
  BANJADO_FOOTER_BLOCKS_LIST_KEY,
  BANJADO_FOOTER_TITLE,
  COPYRIGHT_YEAR_PLACEHOLDER,
  DEFAULT_EMAIL_FOLDER_ID,
  PRIVACY_POLICY_PLACEHOLDER,
} from './constants';

/**
 * Inhalt des Live-Footers auf banjado.com (Stand 07.09.2026) in der Optik des
 * abgenommenen Prototyps v2. Interne Ziele kommen aus app/utils/paths.ts, die
 * Kategorie-Pfade /briefkasten/ und /magnettafel/ sind Shop-URLs und bleiben
 * lokal. "Banjado Wohnwelten" (live ohne Ziel) entfaellt. Die Texte sind
 * Markeninhalte und stehen deshalb als deutsche Literale, nicht in i18n.
 */
export const createBanjadoFooterContent = (): BanjadoFooterContent => ({
  brand: {
    logoText: 'banjado',
    logoImage: '',
    claim: 'Personalisierte Wohnaccessoires aus unserer Manufaktur in Sachsen. Seit 2010.',
  },
  contact: {
    lead: 'Haben Sie Fragen?',
    phone: '+49 (0) 35243 460 400',
    phoneHref: 'tel:+4935243460400',
    hours: 'Mo–Fr 9–15 Uhr',
    email: 'shop@banjado.com',
  },
  columns: [
    {
      title: 'Unsere Marken',
      links: [
        { label: 'Banjado Briefkasten', href: '/briefkasten/' },
        { label: 'Banjado Magnettafel', href: '/magnettafel/' },
      ],
    },
    {
      title: 'Einkaufen',
      links: [
        { label: 'Zahlung und Versand', href: paths.shipping },
        { label: 'Widerrufsrecht', href: paths.cancellationRights },
        { label: 'Widerrufsformular', href: paths.cancellationForm },
        { label: 'Warenkorb', href: paths.cart },
      ],
    },
    {
      title: 'Service',
      links: [
        { label: 'Mein Konto', href: paths.account },
        { label: 'Mein Merkzettel', href: paths.wishlist },
        { label: 'Retourenportal', href: paths.accountReturns },
        { label: 'Kontakt', href: paths.contact },
      ],
    },
    {
      title: 'Unternehmen',
      links: [
        { label: 'Impressum', href: paths.legalDisclosure },
        { label: 'Datenschutzerklärung', href: paths.privacyPolicy },
        { label: 'AGB', href: paths.termsAndConditions },
        { label: 'Barrierefreiheit', href: paths.declarationOfAccessibility },
      ],
    },
  ],
  social: {
    title: 'Werde Teil unserer Community',
    items: [
      { network: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/banjado.GmbH/' },
      { network: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/banjado_onlineshops/' },
      { network: 'pinterest', label: 'Pinterest', href: 'https://www.pinterest.de/banjado_Wohnwelt/' },
      { network: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@Banjadoshop' },
    ],
  },
  newsletter: {
    enabled: true,
    title: 'Newsletter – keine Angebote mehr verpassen',
    emailPlaceholder: 'E-Mail **',
    consentText: `Hiermit bestätige ich, dass ich die ${PRIVACY_POLICY_PLACEHOLDER} gelesen habe. Meine Einwilligung kann ich jederzeit widerrufen. **`,
    privacyPolicyLabel: 'Datenschutzerklärung',
    buttonLabel: 'Abonnieren',
    hint: '** Hierbei handelt es sich um ein Pflichtfeld.',
    emailFolderId: DEFAULT_EMAIL_FOLDER_ID,
  },
  bar: {
    priceNote: 'Preisangaben inkl. gesetzl. MwSt. und zzgl. Service- und Versandkosten',
    copyright: `© ${COPYRIGHT_YEAR_PLACEHOLDER} banjado GmbH`,
  },
});

/** Der Footer-Block als einziges Kind des FooterContainer (app/utils/blockTemplates/footer/factory.ts). */
export const createBanjadoFooter = (): Block => ({
  name: BANJADO_FOOTER_BLOCK_NAME,
  type: 'content',
  meta: { uuid: uuid(), isGlobalTemplate: false },
  content: createBanjadoFooterContent(),
});

export const getBlocksList = (): BlocksList =>
  ({
    [BANJADO_FOOTER_BLOCKS_LIST_KEY]: {
      category: BANJADO_BLOCKS_CATEGORY,
      title: BANJADO_FOOTER_TITLE,
      blockName: BANJADO_FOOTER_BLOCK_NAME,
      accessControl: ['content'],
      variations: [
        {
          title: 'Fußzeile wie banjado.com',
          image: 'https://cdn02.plentyone.com/99wr15d283p3/item/images/2112266555/middle/BK-10864-32-WT.jpg.avif',
          template: {
            en: createBanjadoFooter(),
            de: createBanjadoFooter(),
          },
        },
      ],
    },
  }) as unknown as BlocksList;
