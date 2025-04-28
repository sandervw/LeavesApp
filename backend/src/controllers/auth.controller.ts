import { z } from 'zod';
import { catchErrors } from '../utils/errorUtils';
import { signupUser, loginUser, logoutUser, refreshAccessToken, verifyEmail, forgotPassword, resetPassword } from '../services/auth.service';
import { CREATED, OK } from '../constants/http';
import { setAuthCookies } from '../utils/cookies';
import { clearAuthCookies } from '../utils/cookies';

const emailSchema = z.string().email().min(1).max(255);
const verificationCodeSchema = z.string().min(1).max(24); // Based on mongodb ObjectId length
const usernameSchema = z.string().min(1).max(255);
const passwordSchema = z.string().min(6).max(255);
const userAgentSchema = z.string().optional();

/** Handles user signup. */
export const signupController = catchErrors(async (req, res) => {
    // validate request
    const request = {
        email: emailSchema.parse(req.body.email),
        password: passwordSchema.parse(req.body.password),
        username: usernameSchema.parse(req.body.username),
        userAgent: userAgentSchema.parse(req.headers['user-agent']),
    };
    // call service
    const { user, accessToken, refreshToken } = await signupUser(request);
    //return response
    return setAuthCookies({ res, accessToken, refreshToken })
        .status(CREATED).json(user);
});

/** Handles user login. */
export const loginController = catchErrors(async (req, res) => {
    const request = {
        email: emailSchema.parse(req.body.email),
        password: passwordSchema.parse(req.body.password),
        userAgent: userAgentSchema.parse(req.headers['user-agent']),
    };
    const { accessToken, refreshToken } = await loginUser(request);
    return setAuthCookies({ res, accessToken, refreshToken })
        .status(OK).json({ message: 'Logged in successfully' });
});

/** Handles user logout. */
export const logoutController = catchErrors(async (req, res) => {
    const accessToken = req.cookies.accessToken as string || '';
    await logoutUser(accessToken);
    return clearAuthCookies(res).status(OK).json({ message: 'Logged out successfully' });
});

/** Handles access token refresh. */
export const refreshController = catchErrors(async (req, res) => {
    const refreshToken = req.cookies.refreshToken as string || '';
    console.log('refresh token', refreshToken);
    
    const { accessToken, newRefreshToken } = await refreshAccessToken(refreshToken);
    return setAuthCookies({ res, accessToken, refreshToken: newRefreshToken })
        .status(OK).json({ message: 'Access token refreshed' });
});

/** Handles email verification. */
export const verifyController = catchErrors(async (req, res) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await verifyEmail(verificationCode);
    return res.status(OK).json({ message: 'Email verified successfully' });
});

/** Handles forgot password request. */
export const forgotPasswordController = catchErrors(async (req, res) => {
    const email = emailSchema.parse(req.body.email);
    await forgotPassword(email);
    return res.status(OK).json({ message: 'Password reset email sent' });
});

/** Handles password reset request. */
export const resetPasswordController = catchErrors(async (req, res) => {
    const request = {
        verificationCode: verificationCodeSchema.parse(req.body.verificationCode),
        password: passwordSchema.parse(req.body.password),
    }
    await resetPassword(request);
    return clearAuthCookies(res).status(OK).json({ message: 'Password reset successfully' });
});