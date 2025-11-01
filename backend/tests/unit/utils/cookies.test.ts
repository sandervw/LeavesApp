import { describe, it, expect } from 'vitest';
import { setAuthCookies, clearAuthCookies, getRefreshTokenCookieOptions, getAccessTokenCookieOptions } from '../../../src/utils/cookies';

describe('Cookies utils', () => {
  describe('setAuthCookies', () => {
    it('Should only set accessToken if no refreshToken provided', () => {
      const mockRes: Response = {};
    });

    it('Should set both cookies when when refreshToken is provided', () => {
      const mockRes: Response = {};
    });

    it('Should call res.cookie with the correct cookie names', () => {
      const mockRes: Response = {};
    });

    it('Should use correct cookie type options', () => {
      const mockRes: Response = {};
    });

    it('Should return the response object for chaining', () => {
      const mockRes: Response = {};
    });
  });

  describe('clearAuthCookies', () => {
    it('', () => {
      const mockRes: Response = {};
    });
  });

  describe('getAccessTokenCookieOptions', () => {
    it('', () => {
      const mockRes: Response = {};
    });
  });

  describe('getRefreshTokenCookieOptions', () => {
    it('', () => {
      const mockRes: Response = {};
    });
  });
}
);