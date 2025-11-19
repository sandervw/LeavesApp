import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";
import { NODE_ENV } from "../constants/env";

// What we NEED TO DO:
// - PRD: secure=true, sameSite='lax', domain='.wordleaves.com' (for custom domain and subdomains)
// - DEV: secure=true, sameSite='none', domain=undefined (for localhost and preview deployments)
// - Localhost: secure=false, sameSite='lax', domain=undefined (if using https://localhost)
const secure = (NODE_ENV === 'production' || NODE_ENV === 'development');
const sameSite = (NODE_ENV === 'production' || NODE_ENV === 'local') ? 'lax' : 'none';
const domain = secure ? '.wordleaves.com' : undefined;

export const REFRESH_PATH = '/auth/refresh'; // Only send the refresh token on this path

const defaults: CookieOptions = {
  sameSite,
  httpOnly: true,
  secure,
  domain,
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