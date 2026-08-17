export type AccessorySelectionMode = 'single' | 'multiple';

export interface AccessoryGroupConfig {
  tag: string | number;
  title: string;
  mode: AccessorySelectionMode;
}
