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

// text und button sind bewusst nicht optional: die Editor-Formulare binden per
// v-model direkt darauf, und vue-tsc (der Typecheck der PlentyONE-Bereitstellung)
// lehnt den Zugriff auf moeglicherweise undefinierte Objekte ab. Die Formular-
// Computed fuellt fehlende Felder zur Laufzeit auf.
export interface BanjadoMotifBandContent {
  text: {
    eyebrow?: string;
    titleHtml?: string;
    description?: string;
  };
  chips?: BanjadoMotifChip[];
  wall?: BanjadoMotifTile[];
  button: {
    label?: string;
    link?: string;
  };
}
