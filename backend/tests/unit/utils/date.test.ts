import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  oneYearFromNow,
  thirtyDaysFromNow,
  oneHourFromNow,
  fifteenMinutesFromNow,
  fiveMinutesAgo,
  ONE_DAY_MS,
} from '../../../src/utils/date';

describe('Date Utils', () => {

  // Fixed timestamp for consistent testing (Jan 1, 2025, 12:00:00 UTC)
  const mockNow = new Date('2025-01-01T12:00:00.000Z').getTime();

  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    vi.spyOn(Date, 'now').mockReturnValue(mockNow);
  });

  afterEach(() => {
    // Restore the original Date.now after each test
    vi.restoreAllMocks();
  });

  describe('ONE_DAY_MS constant', () => {
    it('should equal milliseconds in one day', () => {
      const expected = 24 * 60 * 60 * 1000; // 86,400,000 ms
      expect(ONE_DAY_MS).toBe(expected);
    });
  });

  describe('oneYearFromNow', () => {
    let result: Date;
    beforeEach(() => {
      result = oneYearFromNow();
    });

    it('should return a date 365 days from now', () => {
      const expected = new Date(mockNow + 365 * ONE_DAY_MS);
      expect(result).toEqual(expected);
    });

    it('should return a Date object', () => {
      expect(result).toBeInstanceOf(Date);
    });

    it('should be exactly 365 days in the future', () => {
      const daysDifference = (result.getTime() - mockNow) / ONE_DAY_MS;
      expect(daysDifference).toBe(365);
    });
  });

  describe('thirtyDaysFromNow', () => {
    let result: Date;
    beforeEach(() => {
      result = thirtyDaysFromNow();
    });

    it('should return a date 30 days from now', () => {
      const expected = new Date(mockNow + 30 * ONE_DAY_MS);
      expect(result).toEqual(expected);
    });

    it('should return a Date object', () => {
      expect(result).toBeInstanceOf(Date);
    });

    it('should be exactly 30 days in the future', () => {
      const daysDifference = (result.getTime() - mockNow) / ONE_DAY_MS;
      expect(daysDifference).toBe(30);
    });
  });

  describe('oneHourFromNow', () => {
    let result: Date;
    beforeEach(() => {
      result = oneHourFromNow();
    });

    it('should return a date 1 hour from now', () => {
      const expected = new Date(mockNow + 60 * 60 * 1000);
      expect(result).toEqual(expected);
    });

    it('should return a Date object', () => {
      expect(result).toBeInstanceOf(Date);
    });

    it('should be exactly 1 hour (3600 seconds) in the future', () => {
      const secondsDifference = (result.getTime() - mockNow) / 1000;
      expect(secondsDifference).toBe(3600);
    });
  });
  
  describe('fifteenMinutesFromNow', () => {
    let result: Date;
    beforeEach(() => {
      result = fifteenMinutesFromNow();
    });

    it('should return a date 15 minutes from now', () => {
      const expected = new Date(mockNow + 15 * 60 * 1000);
      expect(result).toEqual(expected);
    });

    it('should return a Date object', () => {
      expect(result).toBeInstanceOf(Date);
    });

    it('should be exactly 15 minutes (900 seconds) in the future', () => {
      const secondsDifference = (result.getTime() - mockNow) / 1000;
      expect(secondsDifference).toBe(900);
    });
  });

  describe('fiveMinutesAgo', () => {
    let result: Date;
    beforeEach(() => {
      result = fiveMinutesAgo();
    });

    it('should return a date 5 minutes ago', () => {
      const expected = new Date(mockNow - 5 * 60 * 1000);
      expect(result).toEqual(expected);
    });

    it('should return a Date object', () => {
      expect(result).toBeInstanceOf(Date);
    });

    it('should be exactly 5 minutes (300 seconds) in the past', () => {
      const secondsDifference = (mockNow - result.getTime()) / 1000;
      expect(secondsDifference).toBe(300);
    });

    it('should be in the past', () => {
      expect(result.getTime()).toBeLessThan(mockNow);
    });
  });

  describe('Date relationships', () => {
    it('oneYearFromNow should be greater than thirtyDaysFromNow', () => {
      expect(oneYearFromNow().getTime()).toBeGreaterThan(thirtyDaysFromNow().getTime());
    });

    it('thirtyDaysFromNow should be greater than oneHourFromNow', () => {
      expect(thirtyDaysFromNow().getTime()).toBeGreaterThan(oneHourFromNow().getTime());
    });

    it('oneHourFromNow should be greater than fifteenMinutesFromNow', () => {
      expect(oneHourFromNow().getTime()).toBeGreaterThan(fifteenMinutesFromNow().getTime());
    });

    it('fifteenMinutesFromNow should be greater than fiveMinutesAgo', () => {
      expect(fifteenMinutesFromNow().getTime()).toBeGreaterThan(fiveMinutesAgo().getTime());
    });
  });
});
