import { describe, it, expect } from 'vitest';
import { formatMoney, formatDate, initials, fullName, formatBytes } from './utils';

describe('utils', () => {
  it('formatMoney formats to 2dp', () => {
    expect(formatMoney(1234.5)).toBe('1,234.50');
    expect(formatMoney('99.999')).toBe('100.00');
    expect(formatMoney(null)).toBe('0.00');
  });
  it('formatDate handles date-only and invalid', () => {
    expect(formatDate('2026-05-29')).toMatch(/May/);
    expect(formatDate(null)).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
  });
  it('initials + fullName', () => {
    expect(initials('Ada', 'Lovelace')).toBe('AL');
    expect(fullName('Ada', 'Lovelace')).toBe('Ada Lovelace');
  });
  it('formatBytes', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
