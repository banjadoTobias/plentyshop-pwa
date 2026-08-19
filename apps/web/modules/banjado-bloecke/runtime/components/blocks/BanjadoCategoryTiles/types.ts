export type BanjadoCategoryTilesProps = {
  name: string;
  type: string;
  content: BanjadoCategoryTilesContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export interface BanjadoCategoryTile {
  image: string;
  label: string;
  link: string;
}

export interface BanjadoCategoryTilesContent {
  text: {
    eyebrow?: string;
    title?: string;
  };
  linkAll?: {
    label?: string;
    link?: string;
  };
  tiles?: BanjadoCategoryTile[];
}
