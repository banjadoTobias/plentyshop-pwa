import type { MotivItem, MotivSourceEntry } from '../../types';

const IMAGE_BASE = 'https://banjado.s3.eu-central-1.amazonaws.com/banjado-Motivmappe/200x200px';

export const sourceEntry = (
  number: string,
  title: string,
  facets: Partial<Omit<MotivSourceEntry, 'src' | 'name'>> = {},
): MotivSourceEntry => ({
  src: `${IMAGE_BASE}/${number}.webp`,
  name: `${number} - ${title}`,
  tags: [number, title, ...(facets.tags ?? [])],
  color: facets.color ?? [],
  theme: facets.theme ?? [],
  style: facets.style ?? ['Standard'],
  saison: facets.saison ?? [],
  zielgruppe: [],
});

/** Kleine, aber typische Rohliste: fuehrende Null, Dublette, Ausreisser, seltene Saison. */
export const sourceEntries: MotivSourceEntry[] = [
  sourceEntry('0010', 'Sonnengelb', { color: ['Gelb'], theme: ['Abstrakt'], style: ['Einfarbig'], saison: ['Sommer'] }),
  sourceEntry('10003', 'Bambus', { color: ['Grün', 'Beige'], theme: ['Natur', 'Struktur'], tags: ['Holz', 'Pflanze'] }),
  sourceEntry('10004', 'Bulldogge', {
    color: ['Braun'],
    theme: ['Tiere', 'Hunde'],
    style: ['NEUE Motive', 'Standard'],
    saison: ['Sommer', 'Schule'],
    tags: ['Hund', 'Welpe'],
  }),
  sourceEntry('10787', 'Trockenes Holz', {
    color: ['Braun', 'Grau'],
    theme: ['Oberflächen', 'Holz'],
    saison: ['Herbst'],
  }),
  sourceEntry('20000', 'Blumen', { color: ['Bunt'], theme: ['Blumen & Blüten'], saison: ['Frühling', 'Sommer'] }),
  sourceEntry('20000', 'Blumen Dublette', { color: ['Rot'], theme: ['Blumen & Blüten'] }),
  sourceEntry('12061', 'Schwarze Steine', {
    color: ['Schwarz'],
    theme: ['Natur', 'Stein & Steinwand'],
    saison: ['Sommer'],
  }),
];

export const item = (n: string, t: string, facets: Partial<Omit<MotivItem, 'n' | 't'>> = {}): MotivItem => ({
  n,
  t,
  th: facets.th ?? [],
  c: facets.c ?? [],
  s: facets.s ?? [],
  sa: facets.sa ?? [],
});

export const items: MotivItem[] = [
  item('0010', 'Sonnengelb', { th: ['Abstrakt'], c: ['Gelb'], sa: ['Sommer'] }),
  item('10003', 'Bambus', { th: ['Natur', 'Oberflächen'], c: ['Grün', 'Beige'] }),
  item('10004', 'Bulldogge', { th: ['Tiere', 'Hunde'], c: ['Braun'], s: ['NEUE Motive'], sa: ['Sommer'] }),
  item('10787', 'Trockenes Holz', { th: ['Oberflächen', 'Holz'], c: ['Braun', 'Grau'], sa: ['Herbst'] }),
  item('12061', 'Schwarze Steine', { th: ['Natur', 'Stein & Steinwand'], c: ['Schwarz'], sa: ['Sommer'] }),
];
