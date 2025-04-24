import { JWT_REFRESH_SECRET, JWT_SECRET } from '../constants/env';
import jwt from 'jsonwebtoken';
import VerificationCodeType from '../constants/verificationCodeType';
import SessionModel from '../models/session.model';
import UserModel from '../models/user.model';
import VerificationCodeModel from '../models/verificationCode.model';
import { oneYearFromNow } from '../utils/date';

export type CreateAccountParams = {
    email: string;
    username: string;
    password: string;
    userAgent?: string;
}

export const signupUser = async (userData: CreateAccountParams) => {
    // Verify existing user doens't exist
    const existingUser = await UserModel.exists({ email: userData.email });
    if (existingUser) throw new Error('User already exists');
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
    
}