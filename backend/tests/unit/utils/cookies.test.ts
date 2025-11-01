import { describe, it, expect, vi } from 'vitest';
import { setAuthCookies, clearAuthCookies, getRefreshTokenCookieOptions, getAccessTokenCookieOptions } from '../../../src/utils/cookies';

describe('Cookies utils', () => {
  describe('setAuthCookies', () => {
    it('Should only set accessToken if no refreshToken provided', () => {
      // Arrange
      const mockCookie = vi.fn();
      const mockRes: any = { cookie: mockCookie  };
      mockCookie.mockReturnValue(mockRes); // For chaining
      // Act
      setAuthCookies({ res: mockRes, accessToken: 'access123' });
      // Assert
      expect(mockCookie).toHaveBeenCalledTimes(1);
      expect(mockCookie).toHaveBeenCalledWith('accessToken', 'access123', getAccessTokenCookieOptions());
    });

    it('Should set both cookies when when refreshToken is provided', () => {
      // Arrange
      const mockAccessCookie = vi.fn();
      const mockRefreshCookie = vi.fn();
      const mockRes: any = { cookie: mockAccessCookie, refreshCookie: mockRefreshCookie  };
      mockAccessCookie.mockReturnValue(mockRes); // For chaining
      // Act
      setAuthCookies({ res: mockRes, accessToken: 'access123', refreshToken: 'refresh456' });
      // Assert
      expect(mockAccessCookie).toHaveBeenCalledTimes(1);
      expect(mockAccessCookie).toHaveBeenCalledWith('accessToken', 'access123', getAccessTokenCookieOptions());
      expect(mockAccessCookie).toHaveBeenCalledTimes(2); // Called again for refresh token
      expect(mockAccessCookie).toHaveBeenCalledWith('refreshToken', 'refresh456', getRefreshTokenCookieOptions());
    });

    it('Should call res.cookie with the correct cookie names', () => {
      
    });

    it('Should use correct cookie type options', () => {
      
    });

    it('Should return the response object for chaining', () => {
      
    });
  });

  describe('clearAuthCookies', () => {
    it('It should clear both access and refresh token', () => {
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