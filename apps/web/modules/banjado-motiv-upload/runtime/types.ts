import type { ProductProperty } from '@plentymarkets/shop-api';

export type MotivFormat = {
  label: string;
  widthCm: number;
  heightCm: number;
};

export type RequiredPixels = {
  width: number;
  height: number;
};

export type ImageDimensions = {
  width: number;
  height: number;
};

export type ResolutionLevel = 'ok' | 'warn' | 'bad';

export type ResolutionVerdict = {
  level: ResolutionLevel;
  ratio: number;
  dpi: number;
  requiredWidthPx: number;
  requiredHeightPx: number;
  title: string;
  text: string;
};

export type MotivNotice = {
  level: ResolutionLevel;
  title: string;
  text: string;
  fileName: string;
};

export type FileFacts = {
  name: string;
  type: string;
  size: number;
};

export type FileRejectionReason = 'ok' | 'empty' | 'type' | 'size';

export type FileCheckResult = {
  accepted: boolean;
  reason: FileRejectionReason;
  message: string;
};

export type PreviewAssignment = {
  wunschmotivNumber: string;
  previewVersion: string;
};

export type MotivUploadPlan = {
  rendersMotivUpload: boolean;
  hiddenPropertyIds: number[];
};

export type BanjadoMotivUploadProps = {
  hasTooltip: boolean;
  productProperty: ProductProperty;
};
