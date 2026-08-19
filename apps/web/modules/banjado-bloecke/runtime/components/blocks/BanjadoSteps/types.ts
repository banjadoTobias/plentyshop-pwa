export type BanjadoStepsProps = {
  name: string;
  type: string;
  content: BanjadoStepsContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export interface BanjadoStep {
  title: string;
  text: string;
}

export interface BanjadoStepsContent {
  text: {
    eyebrow?: string;
  };
  steps?: BanjadoStep[];
}
