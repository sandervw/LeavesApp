import { JWT_REFRESH_SECRET, JWT_SECRET } from '../constants/env';
import jwt from 'jsonwebtoken';
import VerificationCodeType from '../constants/verificationCodeType';
import SessionModel from '../models/session.model';
import UserModel from '../models/user.model';
import VerificationCodeModel from '../models/verificationCode.model';
import { ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from '../utils/date';
import appAssert from '../utils/appAssert';
import { CONFLICT, NOT_FOUND, UNAUTHORIZED } from '../constants/http';
import { RefreshTokenPayload, refreshTokenSignOptions, signToken, verifyToken } from '../utils/jwt';
import { access } from 'fs';

export type SignupUserParams = {
    email: string;
    username: string;
    password: string;
    userAgent?: string;
}

/**
 * Creates a new user and returns the user and authentication tokens.
 * @param userData.email - The email of the user
 * @param userData.username - The username of the user
 * @param userData.password - The password of the user
 * @returns The created user and the access and refresh tokens
 */
export const signupUser = async (userData: SignupUserParams) => {
    // Verify existing user doens't exist
    const existingUser = await UserModel.exists({ email: userData.email });
    appAssert(!existingUser, CONFLICT, 'Email already in use');
    // Create user
    const user = await UserModel.create({
        email: userData.email,
        username: userData.username,
        password: userData.password,
    });
    
    // Create verification code
    const verificationCode = await VerificationCodeModel.create({
        userId: user._id,
        codeType: VerificationCodeType.EmailVerification,
        expiresAt: oneYearFromNow(),
    });
    // Send verification email

    // Create session (unit of time user is logged in for)
    const session = await SessionModel.create({
        userId: user._id,
        userAgent: userData.userAgent,
    });
    const sessionInfo = { sessionId: session._id };
    // Sign access token and refresh token
    const refreshToken = signToken( sessionInfo , refreshTokenSignOptions);
    const accessToken = signToken({ ...sessionInfo, userId: user._id }); // Defaults to AccessTokenSignOptions
    // return user and tokens
    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
    };
};

export type LoginUserParams = {
    email: string;
    password: string;
    userAgent?: string;
}

/**
 * Logs in a user and returns the user and authentication tokens.
 * @param email - The email of the user
 * @param password - The password of the user
 * @returns The created user and the access and refresh tokens
 * @returns The created user and the access and refresh tokens
 */
export const loginUser = async ({email, password, userAgent}: LoginUserParams) => {
    // Get user by email
    const user = await UserModel.findOne({ email });
    // Verify user exists
    appAssert(user, UNAUTHORIZED, 'No user found with that email/password');
    // Validate password
    const isValidPassword = await user.comparePassword(password);
    appAssert(isValidPassword, UNAUTHORIZED, 'Invalid password');
    // Create session (unit of time user is logged in for)
    const session = await SessionModel.create({
        userId: user._id,
        userAgent: userAgent,
    });
    const sessionInfo = { sessionId: session._id };
    // Sign access token and refresh token
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions)
    const accessToken = signToken({ ...sessionInfo, userId: user._id });
    // return user and access tokens
    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
    };
};

/**
 * Logs out a user by deleting their session from the database.
 * @param accessToken - Access token for user to logout
 */
export const logoutUser = async (accessToken: string) => {
    const { payload } = verifyToken(accessToken);
    if (payload)  await SessionModel.findByIdAndDelete(payload.sessionId);
}

/**
 * Refreshes the access token for a user by verifying the refresh token and creating a new access token.
 * @param refreshToken - Refresh token for user to refresh access token
 * @returns The new access token and refresh token (if applicable)
 * @throws UNAUTHORIZED if the refresh token is invalid or expired
 */
export const refreshAccessToken = async (refreshToken: string) => {
    const { payload } = verifyToken<RefreshTokenPayload>(
        refreshToken,
        { secret: refreshTokenSignOptions.secret });
    appAssert(payload, UNAUTHORIZED, 'Invalid token'); // Token expired or invalid
    const session = await SessionModel.findById(payload.sessionId);
    appAssert(
        session && session.expiresAt.getTime() > Date.now(),
        UNAUTHORIZED,
        'Session Expired'); // Session expired or invalid
    // Refresh session if it expires in the next 24 hours (better user experience)
    const sessionNeedsRefresh = session.expiresAt.getTime() - Date.now() < ONE_DAY_MS;
    if (sessionNeedsRefresh) {
        session.expiresAt = thirtyDaysFromNow();
        await session.save();
    }
    const newRefreshToken = sessionNeedsRefresh ? signToken(
        { sessionId: session._id },
        refreshTokenSignOptions
    ) : undefined;
    // Sign new access token
    const accessToken = signToken({
        sessionId: session._id,
        userId: session.userId,
    });
    return { accessToken, newRefreshToken };
}

/**
 * Takes an email verification code ID; looks up the code in the database;
 * if a code is found, grabs the user ID from the code document;
 * then looks up the user in the database and marks them as verified;
 * finally, deletes the code from the database.
 * @param verificationCode - The verification code to verify
 */
export const verifyEmail = async (verificationCode: string) => {
    const code = await VerificationCodeModel.findOne({ 
        _id: verificationCode,
        codeType: VerificationCodeType.EmailVerification,
        expiresAt: { $gt: new Date() }, // Check if code is expired
     });
    appAssert(code, NOT_FOUND, 'Invalid or expired code'); // Code expired or invalid
    const user = await UserModel.findById(code.userId);
    appAssert(user, UNAUTHORIZED, 'User not found');
    user.verified = true;
    await user.save();
    await code.deleteOne(); // Delete code from database
    return {user: user.omitPassword()};
}