import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";
import { APP_ORIGIN } from "../constants/env";

// Secure cookies required for Azure deployments (https) and production
// Local development (http://localhost) can use insecure cookies
const secure = APP_ORIGIN.startsWith('https://');

/**
 * For custom domain setups, set cookie domain to allow sharing across subdomains
 * Production: wordleaves.com and api.wordleaves.com share cookies via .wordleaves.com
 * Local/dev: localhost shares cookies (no domain needed); dev doesn't, but oh well
 */
const isProduction = APP_ORIGIN.includes('wordleaves.com');
const cookieDomain = isProduction ? '.wordleaves.com' : undefined;

export const REFRESH_PATH = '/auth/refresh'; // Only send the refresh token on this path

const defaults: CookieOptions = {
  sameSite: 'lax',
  httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
  secure, // Ensures the cookie is only sent over HTTPS (not HTTP)
  domain: cookieDomain, // Share cookies across subdomains when using custom domain
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow()
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path: REFRESH_PATH, // FOUND IT!: This is the only path the refresh token will be sent on
});

type Params = {
  res: Response;
  accessToken: string;
  refreshToken?: string;
};

/**
 * Sets the access (and optional refresh) token(s)a as cookies on the response object.
 */
export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
  if (!refreshToken) return res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
  return res.cookie('accessToken', accessToken, getAccessTokenCookieOptions())
    .cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());
};

/**
 * Clears the access and refresh tokens from the cookies on the response object.
 */
export const clearAuthCookies = (res: Response) => {
  return res.clearCookie('accessToken').clearCookie('refreshToken', { path: REFRESH_PATH });
};