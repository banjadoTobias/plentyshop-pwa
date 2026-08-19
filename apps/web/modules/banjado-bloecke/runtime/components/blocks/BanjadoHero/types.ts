export type BanjadoHeroProps = {
  name: string;
  type: string;
  content: BanjadoHeroContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export interface BanjadoHeroImage {
  url: string;
  alt: string;
}

export interface BanjadoHeroProof {
  value: string;
  label: string;
}

export interface BanjadoHeroContent {
  text: {
    /** Kleine Zeile ueber der Ueberschrift, z. B. "Manufaktur in Sachsen · seit 2010". */
    eyebrow?: string;
    /** Ueberschrift; <em>...</em> faerbt das Wort gruen wie im Prototyp. */
    titleHtml?: string;
    lead?: string;
  };
  buttons: {
    primaryLabel?: string;
    primaryLink?: string;
    secondaryLabel?: string;
    secondaryLink?: string;
  };
  /** Drei Kennzahlen unter den Knoepfen. */
  proof?: BanjadoHeroProof[];
  /** Bildcollage rechts; das erste Bild steht hochkant ueber zwei Reihen. */
  images?: BanjadoHeroImage[];
}
