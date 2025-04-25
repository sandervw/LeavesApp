import catchErrors from '../utils/catchErrors';
import { signupUser, loginUser, logoutUser, refreshAccessToken, verifyEmail } from '../services/user.service';
import { CREATED, OK, UNAUTHORIZED } from '../constants/http';
import { setAuthCookies } from '../utils/cookies';
import { signupSchema, loginSchema, verificationCodeSchema } from './user.schemas';
import { verifyToken } from '../utils/jwt';
import SessionModel from '../models/session.model';
import { clearAuthCookies } from '../utils/cookies';
import appAssert from '../utils/appAssert';

/**
 * Handles user signup; validates request; creates user; sends user and authentication cookies.
 */
export const signup = catchErrors(async (req, res) => {
    // validate request
    const request = signupSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });
    // call service
    const { user, accessToken, refreshToken } = await signupUser(request);
    //return response
    return setAuthCookies({ res, accessToken, refreshToken })
        .status(CREATED).json(user);
});

/**
 * Handles user login; validates request; authenticates user; sends authentication cookies.
 */
export const login = catchErrors(async (req, res) => {
    const request = loginSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });
    const { accessToken, refreshToken } = await loginUser(request);
    return setAuthCookies({ res, accessToken, refreshToken })
        .status(OK).json({ message: 'Logged in successfully' });
});

/**
 * Handles user logout; verifies access token; deletes session from database.
 */
export const logout = catchErrors(async (req, res) => {
    const accessToken = req.cookies.accessToken as string || '';
    await logoutUser(accessToken);
    return clearAuthCookies(res).status(OK).json({ message: 'Logged out successfully' });
});

/**
 * Handles access token refresh; verifies refresh token; creates new access token (possibly new refresh token); sends cookies.
 */
export const refresh = catchErrors(async (req, res) => {
    const refreshToken = req.cookies.refreshToken as string || '';
    const { accessToken, newRefreshToken } = await refreshAccessToken(refreshToken);
    return setAuthCookies({ res, accessToken, refreshToken: newRefreshToken })
        .status(OK).json({ message: 'Access token refreshed' });
});

/**
 * Handles email verification; verifies token; updates user emailVerified field.
 */
export const verify = catchErrors(async (req, res) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    const { payload } = verifyEmail(verificationCode);
});