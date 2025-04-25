import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

const secure = process.env.NODE_ENV === 'production';

export const REFRESH_PATH = '/user/refresh'; // Only send the refresh token on this path

const defaults: CookieOptions = {
    sameSite: 'strict', // Helps prevent CSRF attacks
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure, // Ensures the cookie is only sent over HTTPS (not HTTP)
}

const getAccessTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: fifteenMinutesFromNow()
});

const getRefreshTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: thirtyDaysFromNow(),
    path: REFRESH_PATH, 
});

type Params = {
    res: Response;
    accessToken: string;
    refreshToken: string;
}
/**
 * Sets the access and refresh tokens as cookies on the response object.
 */
export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
    return res.cookie('accessToken', accessToken, getAccessTokenCookieOptions())
        .cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());
}

/**
 * Clears the access and refresh tokens from the cookies on the response object.
 */
export const clearAuthCookies = (res: Response) => {
    return res.clearCookie('accessToken').clearCookie('refreshToken', {path: REFRESH_PATH});
}