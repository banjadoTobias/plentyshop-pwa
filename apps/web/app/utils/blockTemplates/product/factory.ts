import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';
import { createBanjadoZubehoer } from '~~/modules/banjado-zubehoer/runtime/components/blocks/BanjadoZubehoer/defaults';

/**
 * banjado-Produktseite nach dem abgenommenen Prototyp v2 (17.08.2026):
 * links die Galerie, rechts die Kauf-Box in Prototyp-Reihenfolge
 * (Name, Bewertung, Preis, Varianten, Bestelleigenschaften = Motiv/Upload/
 * Wunschtext, Menge + Warenkorb), darunter der Zubehoer-Kasten. Tags sind
 * bewusst aus - Entscheidung W3 (18.08.2026): kein Tag ist fuer Kunden
 * sichtbar, der Prototyp ist die Whitelist.
 */
export const createProduct = (): Block[] => {
  const itemTextTitle = t('defaultTemplate.product.itemText.title');
  const technicalDataTitle = t('defaultTemplate.product.technicalData.title');
  const customerReviewTitle = t('defaultTemplate.product.customerReview.title');
  const legalInfoTitle = t('defaultTemplate.product.productLegalInformation.title');
  const legalInfoLinkText = t('defaultTemplate.product.productLegalInformation.linkText');

  return [
    {
      name: 'MultiGrid',
      type: 'structure',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      configuration: {
        columnWidths: [6, 6],
        sticky: [1],
        layout: {
          marginTop: '0',
          marginBottom: '0',
        },
      },
      layout: {
        gap: 'XL',
        narrowContainer: true,
      },
      content: [
        {
          name: 'ImageGallery',
          type: 'content',
          meta: {
            uuid: uuid(),
            isGlobalTemplate: false,
          },
          parent_slot: 0,
          content: {
            thumbnails: {
              showThumbnails: true,
              thumbnailType: 'bottom',
              enableHoverZoom: true,
            },
          },
        },
        {
          name: 'PriceCard',
          type: 'content',
          meta: {
            uuid: uuid(),
            isGlobalTemplate: false,
          },
          parent_slot: 1,
          content: {
            fields: {
              itemName: true,
              price: true,
              // W3 (18.08.2026): kein Tag ist sichtbar
              tags: false,
              availability: true,
              starRating: true,
              orderProperties: true,
              // Aus mit Absicht: variationProperties rendert ALLE Merkmale der
              // Variante, auch die interne Steuerung (ZB_LINK, Suche_mehr_mit,
              // GS_product_detail_*, Preisgueltigkeit ...). Der Prototyp ist die
              // Whitelist (W3) - die Kunden-Fakten kommen spaeter als eigener
              // Block, nicht ueber dieses Sammelfeld.
              variationProperties: false,
              previewText: true,
              attributes: true,
              itemBundle: false,
              graduatedPrices: false,
              addToWishlist: true,
              quantityAndAddToCart: true,
              itemText: false,
              technicalData: false,
            },
            fieldsOrder: [
              'itemName',
              'starRating',
              'price',
              'previewText',
              'attributes',
              'variationProperties',
              'orderProperties',
              'itemBundle',
              'graduatedPrices',
              'addToWishlist',
              'quantityAndAddToCart',
              'availability',
              'tags',
              'itemText',
              'technicalData',
            ],
            fieldsDisabled: ['quantityAndAddToCart', 'price', 'itemBundle', 'attributes'],
            wishlistSize: 'small',
            dropShadow: true,
            borders: true,
            borderColor: '#E3E1D9',
            layout: {
              paddingTop: 0,
              paddingBottom: 0,
              paddingRight: 0,
              paddingLeft: 0,
            },
          },
        },
        {
          // Zubehoer direkt unter der Kauf-Box, wie im Prototyp
          ...createBanjadoZubehoer(),
          parent_slot: 1,
        },
      ],
    },
    {
      name: 'ItemText',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        text: {
          title: itemTextTitle,
        },
        layout: {
          displayAsCollapsable: true,
          initiallyCollapsed: false,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    },
    {
      name: 'TechnicalData',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        text: {
          title: technicalDataTitle,
        },
        layout: {
          displayAsCollapsable: true,
          initiallyCollapsed: true,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    },
    {
      name: 'CustomerReview',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        text: {
          title: customerReviewTitle,
        },
        layout: {
          collapsible: true,
          initiallyCollapsed: false,
        },
      },
    },
    {
      name: 'ProductLegalInformation',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        text: {
          title: legalInfoTitle,
          linkText: legalInfoLinkText,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 15,
          paddingRight: 0,
        },
      },
    },
    {
      name: 'ProductRecommendedProducts',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        text: {
          pretitle: '',
          title: 'Das könnte Ihnen auch gefallen',
          subtitle: '',
          htmlDescription: '',
        },
        source: {
          type: 'cross_selling',
          itemId: '',
          categoryId: '',
          crossSellingRelation: 'Similar',
        },
      },
    },
  ] as Block[];
};
