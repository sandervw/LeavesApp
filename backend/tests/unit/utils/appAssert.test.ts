import { describe, it, expect } from 'vitest';
import appAssert from '../../../src/utils/appAssert';
import { AppError } from '../../../src/utils/errorUtils';
import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '../../../src/constants/http';
import AppErrorCode from '../../../src/constants/appErrorCode';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

describe('appAssert', () => {

  describe('when condition is truthy', () => {
    it('should not throw an error for true condition', () => {
      // Act & Validate
      expect(() => {
        appAssert(true, BAD_REQUEST, 'This should not throw');
      }).not.toThrow();
    });

    it('should not throw an error for truthy values', () => {
      // Act & Validate
      expect(() => {
        appAssert(1, BAD_REQUEST, 'Should not throw');
      }).not.toThrow();

      expect(() => {
        appAssert('non-empty string', BAD_REQUEST, 'Should not throw');
      }).not.toThrow();

      expect(() => {
        appAssert({}, BAD_REQUEST, 'Should not throw');
      }).not.toThrow();

      expect(() => {
        appAssert([], BAD_REQUEST, 'Should not throw');
      }).not.toThrow();
    });
  });

  describe('when condition is falsy', () => {
    it('should throw AppError for false condition', () => {
      // Act & Validate
      expect(() => {
        appAssert(false, BAD_REQUEST, 'Test error message');
      }).toThrow(AppError);
    });

    it('should throw AppError for null', () => {
      // Act & Validate
      expect(() => {
        appAssert(null, NOT_FOUND, 'Resource not found');
      }).toThrow(AppError);
    });

    it('should throw AppError for undefined', () => {
      // Act & Validate
      expect(() => {
        appAssert(undefined, BAD_REQUEST, 'Value is undefined');
      }).toThrow(AppError);
    });

    it('should throw AppError for empty string', () => {
      // Act & Validate
      expect(() => {
        appAssert('', BAD_REQUEST, 'Empty string error');
      }).toThrow(AppError);
    });

    it('should throw AppError for 0', () => {
      // Act & Validate
      expect(() => {
        appAssert(0, BAD_REQUEST, 'Zero is falsy');
      }).toThrow(AppError);
    });
  });

  describe('AppError properties', () => {
    it('should throw AppError with correct status code', () => {
      // Act & Validate
      try {
        appAssert(false, UNAUTHORIZED, 'Unauthorized access');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(UNAUTHORIZED);
      }
    });

    it('should throw AppError with correct message', () => {
      // Setup
      const testMessage = 'This is a test error message';
      // Act & Validate
      try {
        appAssert(false, BAD_REQUEST, testMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe(testMessage);
      }
    });

    it('should throw AppError with optional error code', () => {
      // Act & Validate
      try {
        appAssert(false, UNAUTHORIZED, 'Invalid token', AppErrorCode.InvalidAccessToken);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).errorCode).toBe(AppErrorCode.InvalidAccessToken);
      }
    });

    it('should throw AppError without error code when not provided', () => {
      // Act & Validate
      try {
        appAssert(false, BAD_REQUEST, 'Error without code');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).errorCode).toBeUndefined();
      }
    });
  });

  describe('different HTTP status codes', () => {
    it('should handle BAD_REQUEST (400)', () => {
      // Act & Validate
      try {
        appAssert(false, BAD_REQUEST, 'Bad request error');
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as AppError).statusCode).toBe(400);
      }
    });

    it('should handle UNAUTHORIZED (401)', () => {
      // Act & Validate
      try {
        appAssert(false, UNAUTHORIZED, 'Unauthorized error');
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it('should handle NOT_FOUND (404)', () => {
      // Act & Validate
      try {
        appAssert(false, NOT_FOUND, 'Not found error');
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as AppError).statusCode).toBe(404);
      }
    });

    it('should handle INTERNAL_SERVER_ERROR (500)', () => {
      // Act & Validate
      try {
        appAssert(false, INTERNAL_SERVER_ERROR, 'Server error');
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as AppError).statusCode).toBe(500);
      }
    });
  });

  describe('real-world usage examples', () => {
    it('should validate user exists', () => {
      // Setup
      const user = null;
      // Act & Validate
      expect(() => {
        appAssert(user, NOT_FOUND, 'User not found');
      }).toThrow(AppError);
    });

    it('should validate required fields', () => {
      // Setup
      const email = '';
      // Act & Validate
      expect(() => {
        appAssert(email, BAD_REQUEST, 'Email is required');
      }).toThrow(AppError);
    });

    it('should validate authentication', () => {
      // Setup
      const isAuthenticated = false;
      // Act & Validate
      expect(() => {
        appAssert(isAuthenticated, UNAUTHORIZED, 'Authentication required', AppErrorCode.InvalidAccessToken);
      }).toThrow(AppError);
    });

    it('should pass when validation succeeds', () => {
      // Setup
      const user = { id: 1, name: 'Test User' };
      // Act & Validate
      expect(() => {
        appAssert(user, NOT_FOUND, 'User not found');
      }).not.toThrow();
    });
  });

  describe('type narrowing behavior', () => {
    it('should narrow types after assertion', () => {
      // Setup
      const value: string | null = 'test';
      // Act
      // After this assertion, TypeScript knows value is not null
      appAssert(value, BAD_REQUEST, 'Value is required');
      // This should compile without errors
      const uppercased: string = value.toUpperCase();
      // Validate
      expect(uppercased).toBe('TEST');
    });
  });
});
