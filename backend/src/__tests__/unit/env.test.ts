/**
 * Unit tests for env config helpers
 */

import { parseCacheTtlHours, parseAllowedOrigins, parseConcurrencyLimit } from '../../shared/config/env';

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

describe('parseAllowedOrigins', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should return the default (localhost:5173) when value is undefined in development', () => {
    expect(parseAllowedOrigins(undefined, 'development')).toEqual(['http://localhost:5173']);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should return the default when value is an empty string in development', () => {
    expect(parseAllowedOrigins('', 'development')).toEqual(['http://localhost:5173']);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should return the default and warn when value is undefined in production', () => {
    expect(parseAllowedOrigins(undefined, 'production')).toEqual(['http://localhost:5173']);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('ALLOWED_ORIGINS'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('production'));
  });

  it('should return the default and warn when value is empty in production', () => {
    expect(parseAllowedOrigins('', 'production')).toEqual(['http://localhost:5173']);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should parse a single origin', () => {
    expect(parseAllowedOrigins('https://app.example.com', 'production')).toEqual([
      'https://app.example.com',
    ]);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should parse multiple comma-separated origins', () => {
    expect(
      parseAllowedOrigins('https://app.example.com,https://staging.example.com', 'production')
    ).toEqual(['https://app.example.com', 'https://staging.example.com']);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should trim whitespace around each origin', () => {
    expect(
      parseAllowedOrigins('  https://app.example.com , https://staging.example.com  ', 'production')
    ).toEqual(['https://app.example.com', 'https://staging.example.com']);
  });

  it('should filter out empty segments from double commas', () => {
    expect(parseAllowedOrigins('https://a.com,,https://b.com', 'development')).toEqual([
      'https://a.com',
      'https://b.com',
    ]);
  });

  it('should not warn when valid origins are set in production', () => {
    parseAllowedOrigins('https://app.example.com', 'production');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('parseConcurrencyLimit', () => {
  it('should return the default (20) when value is undefined', () => {
    expect(parseConcurrencyLimit(undefined)).toBe(20);
  });

  it('should return the default (20) when value is an empty string', () => {
    expect(parseConcurrencyLimit('')).toBe(20);
  });

  it('should return the default (20) when value is non-numeric', () => {
    expect(parseConcurrencyLimit('abc')).toBe(20);
  });

  it('should return the default (20) when value is zero', () => {
    expect(parseConcurrencyLimit('0')).toBe(20);
  });

  it('should return the default (20) when value is negative', () => {
    expect(parseConcurrencyLimit('-5')).toBe(20);
  });

  it('should parse a valid positive integer', () => {
    expect(parseConcurrencyLimit('10')).toBe(10);
  });

  it('should floor a float to an integer', () => {
    expect(parseConcurrencyLimit('7.9')).toBe(7);
  });

  it('should accept 1 as the minimum valid value', () => {
    expect(parseConcurrencyLimit('1')).toBe(1);
  });
});
