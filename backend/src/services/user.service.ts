import { JWT_REFRESH_SECRET, JWT_SECRET } from '../constants/env';
import jwt from 'jsonwebtoken';
import VerificationCodeType from '../constants/verificationCodeType';
import SessionModel from '../models/session.model';
import UserModel from '../models/user.model';
import VerificationCodeModel from '../models/verificationCode.model';
import { oneYearFromNow } from '../utils/date';
import appAssert from '../utils/appAssert';
import { CONFLICT } from '../constants/http';

export type CreateAccountParams = {
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
export const signupUser = async (userData: CreateAccountParams) => {
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
    // Sign access token and refresh token
    const refreshToken = jwt.sign(
        { sessionId: session._id},
        JWT_REFRESH_SECRET,
        { audience: ['user'], expiresIn: '30d'}
    );
    const accessToken = jwt.sign(
        { userId: user._id, sessionId: session._id},
        JWT_SECRET,
        { audience: ['user'], expiresIn: '15m'}
    );
    // return user and tokens
    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
    };
};