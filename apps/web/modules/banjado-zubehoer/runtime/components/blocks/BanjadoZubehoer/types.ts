export interface BanjadoZubehoerContent {
  text?: {
    title?: string;
    hint?: string;
  };
}

export type BanjadoZubehoerProps = {
  name: string;
  type: string;
  content?: BanjadoZubehoerContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};
