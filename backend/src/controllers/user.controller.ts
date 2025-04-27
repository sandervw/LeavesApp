import catchErrors from '../utils/catchErrors';
import { signupUser, loginUser, logoutUser, refreshAccessToken, verifyEmail, forgotPassword, resetPassword } from '../services/user.service';
import { CREATED, OK } from '../constants/http';
import { setAuthCookies } from '../utils/cookies';
import { signupSchema, loginSchema, verificationCodeSchema, emailSchema, resetPasswordSchema } from './user.schemas';
import { clearAuthCookies } from '../utils/cookies';

/**
 * Handles user signup.
 */
export const signupController = catchErrors(async (req, res) => {
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
 * Handles user login.
 */
export const loginController = catchErrors(async (req, res) => {
    const request = loginSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });
    const { accessToken, refreshToken } = await loginUser(request);
    return setAuthCookies({ res, accessToken, refreshToken })
        .status(OK).json({ message: 'Logged in successfully' });
});

/**
 * Handles user logout.
 */
export const logoutController = catchErrors(async (req, res) => {
    const accessToken = req.cookies.accessToken as string || '';
    await logoutUser(accessToken);
    return clearAuthCookies(res).status(OK).json({ message: 'Logged out successfully' });
});

/**
 * Handles access token refresh.
 */
export const refreshController = catchErrors(async (req, res) => {
    const refreshToken = req.cookies.refreshToken as string || '';
    const { accessToken, newRefreshToken } = await refreshAccessToken(refreshToken);
    return setAuthCookies({ res, accessToken, refreshToken: newRefreshToken })
        .status(OK).json({ message: 'Access token refreshed' });
});

/**
 * Handles email verification.
 */
export const verifyController = catchErrors(async (req, res) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);
    await verifyEmail(verificationCode);
    return res.status(OK).json({ message: 'Email verified successfully' });
});

/**
 * Handles forgot password request.
 */
export const forgotPasswordController = catchErrors(async (req, res) => {
    const email = emailSchema.parse(req.body.email);
    await forgotPassword(email);
    return res.status(OK).json({ message: 'Password reset email sent' });
});

/**
 * Handles password reset request.
 */
export const resetPasswordController = catchErrors(async (req, res) => {
    const {
        password,
        verificationCode
    } = resetPasswordSchema.parse(req.body);
    await resetPassword(verificationCode, password);
    return res.status(OK).json({ message: 'Password reset successfully' });
});