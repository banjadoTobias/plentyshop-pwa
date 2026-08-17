import { describe, expect, it } from 'vitest';
import {
  ACCEPT_ATTRIBUTE,
  MAX_FILE_SIZE_BYTES,
  checkFile,
  formatFileSize,
  isAcceptedFileType,
  isPdf,
} from '../runtime/utils/file-validation';

const megabytes = (count: number) => count * 1024 * 1024;

describe('Datei-Annahme', () => {
  it('should offer only printable formats to the file picker', () => {
    expect(ACCEPT_ATTRIBUTE).toBe('image/jpeg,image/png,application/pdf');
    expect(MAX_FILE_SIZE_BYTES).toBe(megabytes(20));
  });

  it('should accept a normal photo', () => {
    const result = checkFile({ name: 'strand.jpg', type: 'image/jpeg', size: megabytes(4) });

    expect(result.accepted).toBe(true);
    expect(result.reason).toBe('ok');
  });

  it('should reject formats the manufacture cannot print', () => {
    const result = checkFile({ name: 'entwurf.docx', type: 'application/msword', size: megabytes(1) });

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe('type');
    expect(result.message).toContain('JPG, PNG oder PDF');
  });

  it('should reject files above 20 MB and name both sizes', () => {
    const result = checkFile({ name: 'gross.png', type: 'image/png', size: megabytes(24) });

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe('size');
    expect(result.message).toContain('24 MB');
    expect(result.message).toContain('20 MB');
  });

  it('should accept a file that sits exactly on the limit', () => {
    expect(checkFile({ name: 'randfall.jpg', type: 'image/jpeg', size: megabytes(20) }).accepted).toBe(true);
  });

  it('should reject an empty file before anything else', () => {
    const result = checkFile({ name: 'leer.jpg', type: 'image/jpeg', size: 0 });

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe('empty');
  });

  it('should fall back to the extension when the browser reports no mime type', () => {
    expect(isAcceptedFileType({ name: 'urlaub.PNG', type: '', size: 1 })).toBe(true);
    expect(isAcceptedFileType({ name: 'modell.3ds', type: '', size: 1 })).toBe(false);
    expect(isAcceptedFileType({ name: 'ohne-endung', type: '', size: 1 })).toBe(false);
  });

  it('should recognise a pdf by mime type or extension', () => {
    expect(isPdf({ name: 'druck.pdf', type: '', size: 1 })).toBe(true);
    expect(isPdf({ name: 'druck', type: 'application/pdf', size: 1 })).toBe(true);
    expect(isPdf({ name: 'foto.jpg', type: 'image/jpeg', size: 1 })).toBe(false);
  });

  it('should write file sizes the way a customer reads them', () => {
    expect(formatFileSize(megabytes(20))).toBe('20 MB');
    expect(formatFileSize(megabytes(1.44))).toBe('1,4 MB');
  });
});
