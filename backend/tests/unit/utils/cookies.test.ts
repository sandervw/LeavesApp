import { describe, it, expect, vi } from 'vitest';
import { setAuthCookies, clearAuthCookies, getRefreshTokenCookieOptions, getAccessTokenCookieOptions, REFRESH_PATH } from '../../../src/utils/cookies';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

describe('Cookies utils', () => {
  describe('setAuthCookies', () => {
    it('should only set accessToken if no refreshToken provided', () => {
      // Setup
      const mockCookie = vi.fn(); // Mock for res.cookie
      const mockRes: any = { cookie: mockCookie }; // Mock response object
      mockCookie.mockReturnValue(mockRes); // For chaining
      // Act
      setAuthCookies({ res: mockRes, accessToken: 'access123' }); // Call the function
      // Validate
      expect(mockCookie).toHaveBeenCalledTimes(1);
      const actualCall = mockCookie.mock.calls[0];
      expect(actualCall[0]).toBe('accessToken');
      expect(actualCall[1]).toBe('access123');
      expect(actualCall[2].expires).toBeInstanceOf(Date);
    });

    it('should call res.cookie with the correct cookie names', () => {
      // Setup
      const mockCookie = vi.fn();
      const mockRes: any = { cookie: mockCookie };
      mockCookie.mockReturnValue(mockRes);
      // Act
      setAuthCookies({ res: mockRes, accessToken: 'access123', refreshToken: 'refresh456' });
      // Validate
      expect(mockCookie).toHaveBeenCalledTimes(2);

      const accessCall = mockCookie.mock.calls[0];
      expect(accessCall[0]).toBe('accessToken');
      expect(accessCall[1]).toBe('access123');
      expect(accessCall[2].expires).toBeInstanceOf(Date);

      const refreshCall = mockCookie.mock.calls[1];
      expect(refreshCall[0]).toBe('refreshToken');
      expect(refreshCall[1]).toBe('refresh456');
      expect(refreshCall[2].expires).toBeInstanceOf(Date);
    });

    it('should return the response object for chaining', () => {
      // Setup
      const mockCookie = vi.fn();
      const mockRes: any = { cookie: mockCookie };
      mockCookie.mockReturnValue(mockRes);
      // Act
      const result = setAuthCookies({ res: mockRes, accessToken: 'access123', refreshToken: 'refresh456' });
      // Validate
      expect(result).toBe(mockRes);
    });
  });

  describe('clearAuthCookies', () => {
    it('should clear both access and refresh token', () => {
      // Setup
      const mockClearCookie = vi.fn();
      const mockRes: any = { clearCookie: mockClearCookie };
      mockClearCookie.mockReturnValue(mockRes);
      // Act
      clearAuthCookies(mockRes);
      // Validate
      expect(mockClearCookie).toHaveBeenCalledTimes(2);
      expect(mockClearCookie).toHaveBeenCalledWith('accessToken');
      expect(mockClearCookie).toHaveBeenNthCalledWith(2, 'refreshToken', { path: REFRESH_PATH });
    });

    it('should return the response object', () => {
      // Setup
      const mockClearCookie = vi.fn();
      const mockRes: any = { clearCookie: mockClearCookie };
      mockClearCookie.mockReturnValue(mockRes);
      // Act
      const result = clearAuthCookies(mockRes);
      // Validate
      expect(result).toBe(mockRes);
    });
  });

  describe('getAccessTokenCookieOptions', () => {
    it('should expire in fifteen minutes', () => {
      // Setup
      const before = Date.now();
      const options = getAccessTokenCookieOptions();
      const after = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;
      // Act
      const expiryTime = (options.expires as Date).getTime();
      // Validate
      expect(options.expires).toBeInstanceOf(Date);
      expect(expiryTime).toBeGreaterThanOrEqual(before + fifteenMinutes);
      expect(expiryTime).toBeLessThanOrEqual(after + fifteenMinutes);
    });

    it('should not be restricted to a specific path', () => {
      // Act
      const options = getAccessTokenCookieOptions();
      // Validate
      expect(options.path).toBeUndefined();
    });
  });

  describe('getRefreshTokenCookieOptions', () => {
    it('should expire in thirty days', () => {
      // Setup
      const before = Date.now();
      const options = getRefreshTokenCookieOptions();
      const after = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      // Act
      const expiryTime = (options.expires as Date).getTime();
      // Validate
      expect(options.expires).toBeInstanceOf(Date);
      expect(expiryTime).toBeGreaterThanOrEqual(before + thirtyDays);
      expect(expiryTime).toBeLessThanOrEqual(after + thirtyDays);
    });

    it('should be restricted to only the REFRESH_PATH', () => {
      // Setup
      const path = REFRESH_PATH;
      // Act
      const options = getRefreshTokenCookieOptions();
      // Validate
      expect(options.path).toBe(path);
    });
  });
}
);