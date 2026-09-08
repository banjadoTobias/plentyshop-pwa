export type BanjadoFooterProps = {
  name: string;
  type: string;
  content: BanjadoFooterContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type BanjadoSocialNetwork = 'facebook' | 'instagram' | 'pinterest' | 'youtube';

export interface BanjadoFooterLink {
  label: string;
  /** Interner Pfad (laeuft durch localePath) oder absolute Adresse (https:, mailto:, tel:). */
  href: string;
}

export interface BanjadoFooterColumn {
  title: string;
  links: BanjadoFooterLink[];
}

export interface BanjadoFooterBrand {
  /** Wortmarke, wenn kein Logo-Bild gesetzt ist. */
  logoText: string;
  /** Optionale Bild-URL; leer = Wortmarke als Text. */
  logoImage: string;
  claim: string;
}

export interface BanjadoFooterContact {
  /** Zeile ueber der Telefonnummer, z. B. "Haben Sie Fragen?". */
  lead: string;
  /** Anzeigeform der Nummer, z. B. "+49 (0) 35243 460 400". */
  phone: string;
  /** Waehlbare Form fuer den Link, z. B. "tel:+4935243460400". */
  phoneHref: string;
  hours: string;
  email: string;
}

export interface BanjadoFooterSocialItem {
  network: BanjadoSocialNetwork;
  /** Sichtbarer Name fuer Screenreader und Tooltip. */
  label: string;
  href: string;
}

export interface BanjadoFooterSocial {
  title: string;
  items: BanjadoFooterSocialItem[];
}

export interface BanjadoFooterNewsletter {
  enabled: boolean;
  title: string;
  emailPlaceholder: string;
  /** Einwilligungstext; der Platzhalter {privacyPolicy} wird zum Link auf die Datenschutzerklaerung. */
  consentText: string;
  /** Linktext, der fuer {privacyPolicy} eingesetzt wird. */
  privacyPolicyLabel: string;
  buttonLabel: string;
  /** Fussnote unter dem Formular, z. B. Pflichtfeld-Hinweis. */
  hint: string;
  /** Plenty-E-Mail-Ordner fuer die Anmeldung. */
  emailFolderId: number;
}

export interface BanjadoFooterBar {
  priceNote: string;
  /** Copyright-Text; der Platzhalter {year} wird zur Renderzeit durch das Jahr ersetzt. */
  copyright: string;
}

export interface BanjadoFooterContent {
  brand?: BanjadoFooterBrand;
  contact?: BanjadoFooterContact;
  columns?: BanjadoFooterColumn[];
  social?: BanjadoFooterSocial;
  newsletter?: BanjadoFooterNewsletter;
  bar?: BanjadoFooterBar;
}

/** Vollstaendig befuellter Inhalt fuer das Editor-Formular, damit jedes v-model ein Ziel hat. */
export type BanjadoFooterCompleteContent = Required<BanjadoFooterContent>;

/** Einwilligungstext, zerlegt am Platzhalter fuer den Datenschutz-Link. */
export interface BanjadoConsentTextParts {
  before: string;
  after: string;
  hasLink: boolean;
}

/** Link mit fertig aufgeloestem Ziel: interne Pfade sind lokalisiert, externe bleiben wie eingegeben. */
export interface BanjadoFooterResolvedLink {
  label: string;
  to: string;
  external: boolean;
}

export interface BanjadoFooterResolvedColumn {
  title: string;
  links: BanjadoFooterResolvedLink[];
}
