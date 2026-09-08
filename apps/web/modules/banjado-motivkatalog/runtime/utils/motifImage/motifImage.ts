import { MOTIF_IMAGE_BASE, MOTIF_IMAGE_EXTENSION, MOTIF_IMAGE_SIZE_THUMB } from '../../config/constants';

/**
 * @description Bild-URL aus der Motivnummer; die Nummer traegt die fuehrende Null ('0010').
 * @param number Motivnummer.
 * @param size Ordner auf S3, Standard 200x200px.
 * @example
 * ``` ts
 * getMotifImageUrl('0010'); // https://banjado.s3.eu-central-1.amazonaws.com/banjado-Motivmappe/200x200px/0010.webp
 * ```
 */
export const getMotifImageUrl = (number: string, size: string = MOTIF_IMAGE_SIZE_THUMB): string =>
  `${MOTIF_IMAGE_BASE}/${size}/${number}.${MOTIF_IMAGE_EXTENSION}`;
