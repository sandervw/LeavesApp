import { JWT_REFRESH_SECRET, JWT_SECRET } from '../constants/env';
import jwt from 'jsonwebtoken';
import VerificationCodeType from '../constants/verificationCodeType';
import SessionModel from '../models/session.model';
import UserModel from '../models/user.model';
import VerificationCodeModel from '../models/verificationCode.model';
import { oneYearFromNow } from '../utils/date';
import appAssert from '../utils/appAssert';
import { CONFLICT, UNAUTHORIZED } from '../constants/http';
import { refreshTokenSignOptions, signToken, verifyToken } from '../utils/jwt';

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

export const refreshAccessToken = async (refreshToken: string) => {
    
}