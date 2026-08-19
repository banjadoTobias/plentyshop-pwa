import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';

/**
 * banjado-Kategorieseite nach dem abgenommenen Prototyp v2 (17.08.2026):
 * Kategoriename samt Beschreibung oben, links die Facetten-Sidebar nach dem
 * Otto/IKEA-Muster (zuerst die gepflegten Plenty-Facetten, dann der Preis),
 * rechts das Raster mit ruhigen Kacheln - Name, Preis, Bewertung, Merkzettel,
 * kein Kaufknopf in der Kachel. Kein Motiv-Peek und kein Zweitbild beim
 * Hover (verworfen, 17.08.2026).
 */
export function createCategory(): Block[] {
  const categoryName = t('defaultTemplate.category.categoryData.name');

  return [
    {
      name: 'CategoryData',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        name: categoryName,
        fields: {
          name: true,
          description1: true,
          description2: false,
          shortDescription: false,
        },
        fieldsOrder: ['name', 'description1', 'description2', 'shortDescription'],
        fieldsDisabled: [],
        displayCategoryImage: 'off',
        image: {
          fillMode: 'fill',
          alt: '',
          brightness: 0.75,
        },
        text: {
          color: '#2A2E25',
          bgColor: '#fff',
          bgOpacity: 1,
          textAlignment: 'left',
          justify: 'top',
          align: 'left',
          background: true,
        },
        layout: {
          paddingTop: 24,
          paddingBottom: 24,
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    },
    {
      name: 'MultiGrid',
      type: 'structure',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      configuration: {
        columnWidths: [3, 9],
      },
      layout: {
        gap: 'XL',
        narrowContainer: true,
      },
      content: [
        {
          name: 'SortFilter',
          type: 'content',
          meta: {
            uuid: uuid(),
            isGlobalTemplate: false,
          },
          parent_slot: 0,
          content: {
            fields: {
              // Kategoriebaum steckt in der Hauptnavigation, nicht in der Sidebar
              category: false,
              sortBy: true,
              perPage: true,
              // Bewertung und Hersteller filtern bei einem Ein-Marken-Shop nichts
              itemRating: false,
              manufacturer: false,
              price: true,
              availability: false,
              // die gepflegten Plenty-Facetten (Bauart, Farbe Motiv, Material, ...)
              customizedFilters: true,
            },
            filtersOrder: [
              'customizedFilters',
              'price',
              'sortBy',
              'perPage',
              'category',
              'itemRating',
              'manufacturer',
              'availability',
            ],
            filtersDisabled: [],
            showAllFiltersImmediately: true,
            numberOfFiltersToShowInitially: 0,
          },
        },
        {
          name: 'ItemGrid',
          type: 'content',
          meta: {
            uuid: uuid(),
            isGlobalTemplate: false,
          },
          parent_slot: 1,
          content: {
            itemsPerRowDesktop: 4,
            itemsPerRowTablet: 3,
            itemsPerRowMobile: 2,
            showItemCount: true,
            itemCountPosition: 'left',
            fields: {
              manufacturer: false,
              title: true,
              rating: true,
              previewText: false,
              price: true,
              addToCart: false,
            },
            fieldsOrder: ['manufacturer', 'title', 'rating', 'previewText', 'price', 'addToCart'],
            fieldsDisabled: ['title'],
            contentAlignment: 'left',
            cardBorders: true,
            showSecondImageOnHover: false,
            showWishlistButton: true,
            addToCartStyle: 'primary',
            paginationPosition: 'bottom',
          },
        },
      ],
    },
  ] as Block[];
}
