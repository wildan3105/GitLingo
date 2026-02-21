/**
 * Unit tests for env config helpers
 */

import { parseCacheTtlHours } from '../../shared/config/env';

describe('parseCacheTtlHours', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should return the default (12) when value is undefined', () => {
    expect(parseCacheTtlHours(undefined)).toBe(12);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should return the default (12) when value is an empty string', () => {
    expect(parseCacheTtlHours('')).toBe(12);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should return the default (12) when value is non-numeric', () => {
    expect(parseCacheTtlHours('abc')).toBe(12);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should return the default (12) when value is zero', () => {
    expect(parseCacheTtlHours('0')).toBe(12);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should return the default (12) when value is negative', () => {
    expect(parseCacheTtlHours('-5')).toBe(12);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should return the parsed value for a valid positive number', () => {
    expect(parseCacheTtlHours('6')).toBe(6);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should accept the default value (12) without warning', () => {
    expect(parseCacheTtlHours('12')).toBe(12);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should accept the maximum value (24) without warning', () => {
    expect(parseCacheTtlHours('24')).toBe(24);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should cap to 24 and warn when value exceeds the maximum', () => {
    expect(parseCacheTtlHours('48')).toBe(24);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('48'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('24'));
  });

  it('should cap to 24 and warn when value is just above the maximum', () => {
    expect(parseCacheTtlHours('25')).toBe(24);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should accept fractional hours (e.g. 0.5)', () => {
    expect(parseCacheTtlHours('0.5')).toBe(0.5);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
