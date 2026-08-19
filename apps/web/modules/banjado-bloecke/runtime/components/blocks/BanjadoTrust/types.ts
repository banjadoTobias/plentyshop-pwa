export type BanjadoTrustProps = {
  name: string;
  type: string;
  content: BanjadoTrustContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type BanjadoTrustIcon = 'shield' | 'truck' | 'return' | 'star';

export interface BanjadoTrustItem {
  icon: BanjadoTrustIcon;
  title: string;
  text: string;
}

export interface BanjadoTrustContent {
  items?: BanjadoTrustItem[];
}
