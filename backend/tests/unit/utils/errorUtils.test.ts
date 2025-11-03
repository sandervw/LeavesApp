import { describe, it, expect, vi, beforeEach } from 'vitest';
import { catchErrors, AppError } from '../../../src/utils/errorUtils';
import { BAD_REQUEST, UNAUTHORIZED, NOT_FOUND } from '../../../src/constants/http';
import AppErrorCode from '../../../src/constants/appErrorCode';
import { Request, Response, NextFunction } from 'express';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

describe('errorUtils', () => {

  describe('AppError class', () => {
    it('Should create an AppError with statusCode and message', () => {
      // Setup
      const statusCode = BAD_REQUEST;
      const message = 'Test error message';
      // Act
      const error = new AppError(statusCode, message);
      // Validate
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(message);
      expect(error.errorCode).toBeUndefined();
    });

    it('Should create an AppError with optional errorCode', () => {
      // Setup
      const statusCode = UNAUTHORIZED;
      const message = 'Invalid token';
      const errorCode = AppErrorCode.InvalidAccessToken;
      // Act
      const error = new AppError(statusCode, message, errorCode);
      // Validate
      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(message);
      expect(error.errorCode).toBe(errorCode);
    });

    it('Should have Error prototype methods', () => {
      // Setup
      const error = new AppError(NOT_FOUND, 'Resource not found');
      // Validate
      expect(error.toString()).toContain('Resource not found');
      expect(error.stack).toBeDefined();
    });
  });

  describe('catchErrors function', () => {
    // Mock Express objects
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockReq = {};
      mockRes = {};
      mockNext = vi.fn();
    });

    it('Should call the wrapped controller with req, res, next', async () => {
      // Setup
      const controller = vi.fn().mockResolvedValue(undefined);
      const wrappedController = catchErrors(controller);
      // Act
      await wrappedController(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      // Validate
      expect(controller).toHaveBeenCalledTimes(1);
      expect(controller).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('Should not call next when controller succeeds', async () => {
      // Setup
      const controller = vi.fn().mockResolvedValue(undefined);
      const wrappedController = catchErrors(controller);
      // Act
      await wrappedController(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      // Validate
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('Should catch async errors and pass to next middleware', async () => {
      // Setup
      const error = new Error('Test error');
      const controller = vi.fn().mockRejectedValue(error);
      const wrappedController = catchErrors(controller);
      // Act
      await wrappedController(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      // Validate
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('real-world usage scenarios', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };
      mockNext = vi.fn();
    });

    it('Should handle controller that sends response successfully', async () => {
      // Setup
      const controller = vi.fn(async (req, res) => {
        res.status!(200).json({ message: 'Success' });
      });
      const wrappedController = catchErrors(controller);
      // Act
      await wrappedController(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      // Validate
      expect(controller).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Success' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('Should handle controller that throws during database operation', async () => {
      // Setup
      const dbError = new Error('Database connection failed');
      const controller = vi.fn(async () => {
        throw dbError;
      });
      const wrappedController = catchErrors(controller);
      // Act
      await wrappedController(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      // Validate
      expect(mockNext).toHaveBeenCalledWith(dbError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('Should handle controller that throws AppError for validation', async () => {
      // Setup
      const validationError = new AppError(BAD_REQUEST, 'Email is required');
      const controller = vi.fn(async () => {
        throw validationError;
      });
      const wrappedController = catchErrors(controller);
      // Act
      await wrappedController(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      // Validate
      expect(mockNext).toHaveBeenCalledWith(validationError);
      const receivedError = mockNext.mock.calls[0][0];
      expect(receivedError.statusCode).toBe(BAD_REQUEST);
      expect(receivedError.message).toBe('Email is required');
    });
  });
});
