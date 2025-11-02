import { describe, it, expect, vi } from 'vitest';
import { setAuthCookies, clearAuthCookies, getRefreshTokenCookieOptions, getAccessTokenCookieOptions } from '../../../src/utils/cookies';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

describe('Cookies utils', () => {
  describe('setAuthCookies', () => {
    it('Should only set accessToken if no refreshToken provided', () => {
      // Arrange
      const mockCookie = vi.fn(); // Mock for res.cookie
      const mockRes: any = { cookie: mockCookie }; // Mock response object
      mockCookie.mockReturnValue(mockRes); // For chaining
      // Act
      setAuthCookies({ res: mockRes, accessToken: 'access123' }); // Call the function
      // Assert
      expect(mockCookie).toHaveBeenCalledTimes(1);
      expect(mockCookie).toHaveBeenCalledWith('accessToken', 'access123', getAccessTokenCookieOptions());
    });

    it('Should call res.cookie with the correct cookie names', () => {
      // Arrange
      const mockCookie = vi.fn();
      const mockRes: any = { cookie: mockCookie };
      mockCookie.mockReturnValue(mockRes); 
      // Act
      setAuthCookies({ res: mockRes, accessToken: 'access123', refreshToken: 'refresh456' });
      // Assert
      expect(mockCookie).toHaveBeenCalledTimes(2);
      expect(mockCookie).toHaveBeenNthCalledWith(1, 'accessToken', 'access123', getAccessTokenCookieOptions());
      expect(mockCookie).toHaveBeenNthCalledWith(2, 'refreshToken', 'refresh456', getRefreshTokenCookieOptions());
    });

    it('Should return the response object for chaining', () => {
      // Arrange
      const mockCookie = vi.fn();
      const mockRes: any = { cookie: mockCookie };
      mockCookie.mockReturnValue(mockRes); 
      // Act
      const result = setAuthCookies({ res: mockRes, accessToken: 'access123', refreshToken: 'refresh456' });
      // Assert
      expect(result).toBe(mockRes);
    });
  });

  describe('clearAuthCookies', () => {
    it('It should clear both access and refresh token', () => {
      // Arrange
      const mockClearCookie = vi.fn();
      const mockRes: any = { clearCookie: mockClearCookie };
      mockClearCookie.mockReturnValue(mockRes); 
      // Act
      clearAuthCookies(mockRes);
      // Assert
      expect(mockClearCookie).toHaveBeenCalledTimes(2);
      expect(mockClearCookie).toHaveBeenCalledWith('accessToken');
      expect(mockClearCookie).toHaveBeenNthCalledWith(2, 'refreshToken', { path: '/refresh' });
    });

    it('Should return the response object', () => {
      // Arrange
      const mockClearCookie = vi.fn();
      const mockRes: any = { clearCookie: mockClearCookie };
      mockClearCookie.mockReturnValue(mockRes);
      // Act
      const result = clearAuthCookies(mockRes);
      // Assert
      expect(result).toBe(mockRes);
    });
  });

  describe('getAccessTokenCookieOptions', () => {
    it('Should expire in fifteen minutes', () => {
      // Arrange
      const options = getAccessTokenCookieOptions();
      const expectedExpiry = 15 * 60 * 1000;
      // Act
      const result = options.expires as Date;
      // Assert
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(Date.now());
      expect(result.getTime()).toBeLessThan(Date.now() + expectedExpiry);
    });

    it('Should have correct security settings', () => {
      
    });

    it('Should not be restricted to a specific path', () => {
    });
  });

  describe('getRefreshTokenCookieOptions', () => {
    it('Should expire in thirty days', () => {
    });

    it('Should have correct security settings', () => {
    });

    it('Should be restricted to only the REFRESH_PATH', () => {
    });
  });
}
);