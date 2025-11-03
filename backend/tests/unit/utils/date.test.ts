import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  oneYearFromNow,
  thirtyDaysFromNow,
  oneHourFromNow,
  fifteenMinutesFromNow,
  fiveMinutesAgo,
  ONE_DAY_MS,
} from '../../../src/utils/date';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

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
      // Setup
      const expected = 24 * 60 * 60 * 1000; // 86,400,000 ms
      // Validate
      expect(ONE_DAY_MS).toBe(expected);
    });
  });

  describe('oneYearFromNow', () => {
    let result: Date;
    beforeEach(() => {
      // Act
      result = oneYearFromNow();
    });

    it('should return a date 365 days from now', () => {
      // Setup
      const expected = new Date(mockNow + 365 * ONE_DAY_MS);
      // Validate
      expect(result).toEqual(expected);
    });

    it('should return a Date object', () => {
      // Validate
      expect(result).toBeInstanceOf(Date);
    });

    it('should be exactly 365 days in the future', () => {
      // Act
      const daysDifference = (result.getTime() - mockNow) / ONE_DAY_MS;
      // Validate
      expect(daysDifference).toBe(365);
    });
  });

  describe('thirtyDaysFromNow', () => {
    let result: Date;
    beforeEach(() => {
      // Act
      result = thirtyDaysFromNow();
    });

    it('should return a date 30 days from now', () => {
      // Setup
      const expected = new Date(mockNow + 30 * ONE_DAY_MS);
      // Validate
      expect(result).toEqual(expected);
    });

    it('should return a Date object', () => {
      // Validate
      expect(result).toBeInstanceOf(Date);
    });

    it('should be exactly 30 days in the future', () => {
      // Act
      const daysDifference = (result.getTime() - mockNow) / ONE_DAY_MS;
      // Validate
      expect(daysDifference).toBe(30);
    });
  });

  describe('oneHourFromNow', () => {
    let result: Date;
    beforeEach(() => {
      // Act
      result = oneHourFromNow();
    });

    it('should return a date 1 hour from now', () => {
      // Setup
      const expected = new Date(mockNow + 60 * 60 * 1000);
      // Validate
      expect(result).toEqual(expected);
    });

    it('should return a Date object', () => {
      // Validate
      expect(result).toBeInstanceOf(Date);
    });

    it('should be exactly 1 hour (3600 seconds) in the future', () => {
      // Act
      const secondsDifference = (result.getTime() - mockNow) / 1000;
      // Validate
      expect(secondsDifference).toBe(3600);
    });
  });
  
  describe('fifteenMinutesFromNow', () => {
    let result: Date;
    beforeEach(() => {
      // Act
      result = fifteenMinutesFromNow();
    });

    it('should return a date 15 minutes from now', () => {
      // Setup
      const expected = new Date(mockNow + 15 * 60 * 1000);
      // Validate
      expect(result).toEqual(expected);
    });

    it('should return a Date object', () => {
      // Validate
      expect(result).toBeInstanceOf(Date);
    });

    it('should be exactly 15 minutes (900 seconds) in the future', () => {
      // Act
      const secondsDifference = (result.getTime() - mockNow) / 1000;
      // Validate
      expect(secondsDifference).toBe(900);
    });
  });

  describe('fiveMinutesAgo', () => {
    let result: Date;
    beforeEach(() => {
      // Act
      result = fiveMinutesAgo();
    });

    it('should return a date 5 minutes ago', () => {
      // Setup
      const expected = new Date(mockNow - 5 * 60 * 1000);
      // Validate
      expect(result).toEqual(expected);
    });

    it('should return a Date object', () => {
      // Validate
      expect(result).toBeInstanceOf(Date);
    });

    it('should be exactly 5 minutes (300 seconds) in the past', () => {
      // Act
      const secondsDifference = (mockNow - result.getTime()) / 1000;
      // Validate
      expect(secondsDifference).toBe(300);
    });

    it('should be in the past', () => {
      // Validate
      expect(result.getTime()).toBeLessThan(mockNow);
    });
  });

  describe('Date relationships', () => {
    it('oneYearFromNow should be greater than thirtyDaysFromNow', () => {
      // Act & Validate
      expect(oneYearFromNow().getTime()).toBeGreaterThan(thirtyDaysFromNow().getTime());
    });

    it('thirtyDaysFromNow should be greater than oneHourFromNow', () => {
      // Act & Validate
      expect(thirtyDaysFromNow().getTime()).toBeGreaterThan(oneHourFromNow().getTime());
    });

    it('oneHourFromNow should be greater than fifteenMinutesFromNow', () => {
      // Act & Validate
      expect(oneHourFromNow().getTime()).toBeGreaterThan(fifteenMinutesFromNow().getTime());
    });

    it('fifteenMinutesFromNow should be greater than fiveMinutesAgo', () => {
      // Act & Validate
      expect(fifteenMinutesFromNow().getTime()).toBeGreaterThan(fiveMinutesAgo().getTime());
    });
  });
});
