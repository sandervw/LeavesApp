import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";
import { APP_ORIGIN } from "../constants/env";

// What we NEED TO DO:
// - PRD: secure=true, sameSite='lax', domain='.wordleaves.com' (for custom domain and subdomains)
// - DEV: secure=false, sameSite='none', domain=undefined (for localhost and preview deployments)
// - Localhost: secure=true, sameSite='lax', domain=undefined (if using https://localhost)
const secure = APP_ORIGIN.startsWith('https://');
const isProduction = APP_ORIGIN.includes('wordleaves.com');
const cookieDomain = isProduction ? '.wordleaves.com' : undefined;

export const REFRESH_PATH = '/auth/refresh'; // Only send the refresh token on this path

const defaults: CookieOptions = {
  sameSite: 'none', // lax for same-site (custom domain), none for cross-site (localhost/preview)
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