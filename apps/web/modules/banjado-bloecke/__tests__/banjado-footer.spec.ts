import { describe, expect, it, vi } from 'vitest';
import type { Block } from '@plentymarkets/shop-api';
import { paths } from '~/utils/paths';
import type { BanjadoFooterColumn, BanjadoFooterContent } from '../runtime/components/blocks/BanjadoFooter/types';
import {
  BANJADO_BLOCKS_CATEGORY,
  BANJADO_FOOTER_BLOCK_NAME,
  BANJADO_FOOTER_BLOCKS_LIST_KEY,
  COPYRIGHT_YEAR_PLACEHOLDER,
  PRIVACY_POLICY_PLACEHOLDER,
  SOCIAL_NETWORKS,
} from '../runtime/components/blocks/BanjadoFooter/constants';
import { isExternalHref, renderCopyright, splitConsentText } from '../runtime/components/blocks/BanjadoFooter/utils';

// paths ist im Shop ein Nuxt-Auto-Import; in der reinen node-Umgebung stellen wir es als Global bereit
// (gleiches Muster wie app/utils/__tests__/quickAddOptions.spec.ts).
vi.stubGlobal('paths', paths);

const { createBanjadoFooter, createBanjadoFooterContent, getBlocksList } =
  await import('../runtime/components/blocks/BanjadoFooter/defaults');

/** Pflichtlinks, die der Footer aus rechtlichen Gruenden immer fuehren muss. */
const REQUIRED_LEGAL_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Impressum', href: paths.legalDisclosure },
  { label: 'Datenschutzerklärung', href: paths.privacyPolicy },
  { label: 'AGB', href: paths.termsAndConditions },
  { label: 'Widerrufsrecht', href: paths.cancellationRights },
  { label: 'Widerrufsformular', href: paths.cancellationForm },
  { label: 'Barrierefreiheit', href: paths.declarationOfAccessibility },
];

const allLinks = (columns: BanjadoFooterColumn[] | undefined) => (columns ?? []).flatMap((column) => column.links);

describe('createBanjadoFooter', () => {
  it('should create a content block named BanjadoFooter with its own uuid', () => {
    const block = createBanjadoFooter();

    expect(block.name).toBe(BANJADO_FOOTER_BLOCK_NAME);
    expect(block.type).toBe('content');
    expect(block.meta.uuid).toBeTruthy();
    expect(block.meta.isGlobalTemplate).toBe(false);
  });

  it('should never have empty content (an empty block is hidden completely)', () => {
    const block = createBanjadoFooter();
    const content = block.content as Record<string, unknown>;

    expect(content).toBeTypeOf('object');
    expect(Object.keys(content).length).toBeGreaterThan(0);
  });

  it('should create fresh uuids on every call', () => {
    expect(createBanjadoFooter().meta.uuid).not.toBe(createBanjadoFooter().meta.uuid);
  });
});

describe('createBanjadoFooterContent', () => {
  const content = createBanjadoFooterContent();

  it.each(REQUIRED_LEGAL_LINKS)('should contain the required link "$label" pointing to $href', ({ label, href }) => {
    const link = allLinks(content.columns).find((candidate) => candidate.label === label);

    expect(link, `Pflichtlink "${label}" fehlt`).toBeDefined();
    expect(link?.href).toBe(href);
  });

  it('should provide the five sections of the live banjado.com footer as four link columns', () => {
    expect(content.columns?.map((column) => column.title)).toEqual([
      'Unsere Marken',
      'Einkaufen',
      'Service',
      'Unternehmen',
    ]);
  });

  it('should keep the brand category links local instead of opening a new tab', () => {
    const brandLinks = content.columns?.[0]?.links ?? [];

    expect(brandLinks.map((link) => link.href)).toEqual(['/briefkasten/', '/magnettafel/']);
    brandLinks.forEach((link) => expect(isExternalHref(link.href)).toBe(false));
  });

  it('should not carry the dead "Banjado Wohnwelten" entry of the live footer', () => {
    expect(allLinks(content.columns).some((link) => link.label === 'Banjado Wohnwelten')).toBe(false);
  });

  it('should only use complete links (label and href set)', () => {
    allLinks(content.columns).forEach((link) => {
      expect(link.label.trim()).not.toBe('');
      expect(link.href.trim()).not.toBe('');
    });
  });

  it('should route service links through the account, wishlist, returns and contact paths', () => {
    const serviceLinks = content.columns?.[2]?.links.map((link) => link.href) ?? [];

    expect(serviceLinks).toEqual([paths.account, paths.wishlist, paths.accountReturns, paths.contact]);
  });

  it('should provide phone and mail as dialable contact data', () => {
    expect(content.contact?.phone).toBe('+49 (0) 35243 460 400');
    expect(content.contact?.phoneHref).toBe('tel:+4935243460400');
    expect(content.contact?.email).toBe('shop@banjado.com');
    expect(content.contact?.hours).toContain('Mo');
  });

  it('should list the four community networks with external profile links', () => {
    const items = content.social?.items ?? [];

    expect(items.map((item) => item.network)).toEqual(SOCIAL_NETWORKS);
    items.forEach((item) => {
      expect(isExternalHref(item.href)).toBe(true);
      expect(item.label.trim()).not.toBe('');
    });
  });

  it('should enable the newsletter with a consent text that links the privacy policy', () => {
    expect(content.newsletter?.enabled).toBe(true);
    expect(content.newsletter?.consentText).toContain(PRIVACY_POLICY_PLACEHOLDER);
    expect(content.newsletter?.privacyPolicyLabel).toBe('Datenschutzerklärung');
    expect(content.newsletter?.buttonLabel).toBe('Abonnieren');
    expect(content.newsletter?.emailFolderId).toBeGreaterThan(0);
  });

  it('should keep the price note and a copyright with the year placeholder in the bar', () => {
    expect(content.bar?.priceNote).toContain('MwSt');
    expect(content.bar?.copyright).toContain(COPYRIGHT_YEAR_PLACEHOLDER);
    expect(content.bar?.copyright).toContain('banjado GmbH');
  });

  it('should return a new object on every call so block copies do not share state', () => {
    const first = createBanjadoFooterContent();
    const second = createBanjadoFooterContent();

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.columns).not.toBe(second.columns);
  });
});

describe('getBlocksList', () => {
  it('should register the footer under the banjadoFooter key in the banjado category for content pages', () => {
    const list = getBlocksList();
    const entry = list[BANJADO_FOOTER_BLOCKS_LIST_KEY];

    expect(entry).toBeDefined();
    expect(entry?.category).toBe(BANJADO_BLOCKS_CATEGORY);
    expect(entry?.blockName).toBe(BANJADO_FOOTER_BLOCK_NAME);
    expect(entry?.accessControl).toEqual(['content']);
  });

  it('should provide a german and an english template with non-empty content', () => {
    const variation = getBlocksList()[BANJADO_FOOTER_BLOCKS_LIST_KEY]?.variations[0];

    expect(variation).toBeDefined();
    (['de', 'en'] as const).forEach((lang) => {
      const template = variation?.template[lang] as Block;
      const content = template.content as BanjadoFooterContent;

      expect(template.name).toBe(BANJADO_FOOTER_BLOCK_NAME);
      expect(Object.keys(content).length).toBeGreaterThan(0);
    });
  });
});

describe('utils', () => {
  it('should replace the year placeholder at render time', () => {
    expect(renderCopyright(`© ${COPYRIGHT_YEAR_PLACEHOLDER} banjado GmbH`, 2026)).toBe('© 2026 banjado GmbH');
  });

  it('should leave a copyright without placeholder untouched', () => {
    expect(renderCopyright('© banjado GmbH', 2026)).toBe('© banjado GmbH');
  });

  it('should split the consent text around the privacy policy placeholder', () => {
    const parts = splitConsentText(`Ich habe die ${PRIVACY_POLICY_PLACEHOLDER} gelesen.`);

    expect(parts).toEqual({ before: 'Ich habe die ', after: ' gelesen.', hasLink: true });
  });

  it('should report no link when the placeholder is missing', () => {
    expect(splitConsentText('Ich stimme zu.')).toEqual({ before: 'Ich stimme zu.', after: '', hasLink: false });
  });

  it.each([
    ['https://www.facebook.com/banjado.GmbH/', true],
    ['mailto:shop@banjado.com', true],
    ['tel:+4935243460400', true],
    ['//cdn.example.com/x', true],
    ['/shipping', false],
    ['/briefkasten/', false],
    ['shipping', false],
  ])('should classify %s as external=%s', (href, expected) => {
    expect(isExternalHref(href)).toBe(expected);
  });
});
