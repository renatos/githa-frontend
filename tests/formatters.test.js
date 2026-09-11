import { describe, it, expect } from 'vitest';
import { formatDate, formatDateOnly, formatDateTime, formatCurrency, formatShortName, formatPhone, round2 } from '../src/utils/formatters';

describe('formatters utility', () => {
  describe('formatDate and formatDateOnly', () => {
    it('returns empty string when date is null, undefined or empty', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
      expect(formatDateOnly(null)).toBe('');
    });

    it('formats YYYY-MM-DD date strings without timezone displacement', () => {
      expect(formatDate('2026-06-25')).toBe('25/06/2026');
      expect(formatDate('2026-01-01')).toBe('01/01/2026');
      expect(formatDate('2026-12-31')).toBe('31/12/2026');
      expect(formatDateOnly('2026-07-01')).toBe('01/07/2026');
    });

    it('formats ISO timestamp strings correctly', () => {
      const date = new Date(2026, 5, 25, 10, 0, 0); // June 25 2026
      const formatted = formatDate(date.toISOString());
      expect(formatted).toContain('25/06/2026');
    });
  });

  describe('formatDateTime', () => {
    it('returns empty string when empty', () => {
      expect(formatDateTime(null)).toBe('');
      expect(formatDateTime('')).toBe('');
    });

    it('formats date and time in pt-BR', () => {
      const date = new Date(2026, 5, 25, 14, 30, 0);
      const res = formatDateTime(date.toISOString());
      expect(res).toContain('25/06/2026');
    });
  });

  describe('formatCurrency', () => {
    it('formats numbers into BRL currency format', () => {
      expect(formatCurrency(200)).toContain('200,00');
      expect(formatCurrency(0)).toContain('0,00');
      expect(formatCurrency(null)).toBe('');
      expect(formatCurrency(undefined)).toBe('');
    });
  });

  describe('formatShortName', () => {
    it('shortens full names', () => {
      expect(formatShortName('Maria Silva')).toBe('Maria Silva');
      expect(formatShortName('Maria Clara Souza Silva')).toBe('Maria Silva');
      expect(formatShortName('Maria')).toBe('Maria');
      expect(formatShortName('')).toBe('');
    });
  });

  describe('formatPhone', () => {
    it('formats 11 digit phones', () => {
      expect(formatPhone('11999998888')).toBe('(11) 99999-8888');
    });
  });

  describe('round2', () => {
    it('rounds to 2 decimal places', () => {
      expect(round2(10.555)).toBe(10.56);
      expect(round2(10.554)).toBe(10.55);
    });
  });
});
