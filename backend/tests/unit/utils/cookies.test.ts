import { describe, it, expect, vi } from 'vitest';
import { setAuthCookies, clearAuthCookies, getRefreshTokenCookieOptions, getAccessTokenCookieOptions } from '../../../src/utils/cookies';

/* eslint-disable */

describe('Cookies utils', () => {
  describe('setAuthCookies', () => {
    it('Should only set accessToken if no refreshToken provided', () => {
      // Arrange
      const mockCookie = vi.fn();
      const mockRes: any = { cookie: mockCookie };
      mockCookie.mockReturnValue(mockRes); // For chaining
      // Act
      setAuthCookies({ res: mockRes, accessToken: 'access123' });
      // Assert
      expect(mockCookie).toHaveBeenCalledTimes(1);
      expect(mockCookie).toHaveBeenCalledWith('accessToken', 'access123', getAccessTokenCookieOptions());
    });

    it('Should call res.cookie with the correct cookie names', () => {
      // Arrange
      const mockCookie = vi.fn();
      const mockRes: any = { cookie: mockCookie };
      mockCookie.mockReturnValue(mockRes); // For chaining
      // Act
      setAuthCookies({ res: mockRes, accessToken: 'access123', refreshToken: 'refresh456' });
      // Assert
      expect(mockCookie).toHaveBeenCalledTimes(2);
      expect(mockCookie).toHaveBeenNthCalledWith(1, 'accessToken', 'access123', getAccessTokenCookieOptions());
      expect(mockCookie).toHaveBeenNthCalledWith(2, 'refreshToken', 'refresh456', getRefreshTokenCookieOptions());
    });

    it('Should return the response object for chaining', () => {

    });
  });

  describe('clearAuthCookies', () => {
    it('It should clear both access and refresh token', () => {
      // Arrange
      const mockClearCookie = vi.fn();
      const mockRes: any = { clearCookie: mockClearCookie };
      mockClearCookie.mockReturnValue(mockRes); // For chaining
      // Act
      clearAuthCookies(mockRes);
      // Assert
      expect(mockClearCookie).toHaveBeenCalledTimes(2);
      expect(mockClearCookie).toHaveBeenCalledWith('accessToken');
      expect(mockClearCookie).toHaveBeenCalledWith('refreshToken');
    });

    it('Should return the response object', () => {
    });
  });

  describe('getAccessTokenCookieOptions', () => {
    it('Should expire in fifteen minutes', () => {
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