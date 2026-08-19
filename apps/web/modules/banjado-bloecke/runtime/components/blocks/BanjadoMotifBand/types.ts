export type BanjadoMotifBandProps = {
  name: string;
  type: string;
  content: BanjadoMotifBandContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export interface BanjadoMotifChip {
  label: string;
  count?: string;
  link?: string;
}

export interface BanjadoMotifTile {
  image: string;
  alt: string;
  link?: string;
}

export interface BanjadoMotifBandContent {
  text: {
    eyebrow?: string;
    titleHtml?: string;
    description?: string;
  };
  chips?: BanjadoMotifChip[];
  wall?: BanjadoMotifTile[];
  button?: {
    label?: string;
    link?: string;
  };
}
