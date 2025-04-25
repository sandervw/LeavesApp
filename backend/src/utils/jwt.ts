import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { SessionDoc } from "../models/session.model";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";

const defaults: SignOptions = {
    audience: ['user'],
};

export type RefreshTokenPayload = {
    sessionId: SessionDoc['id'];
};

export type AccessTokenPayload = {
    sessionId: SessionDoc['id'],
    userId: SessionDoc['userId'];
};

type SignOptionsAndSecret = SignOptions & { secret: string; };

type VerifyOptionsAndSecret = VerifyOptions & { secret: string; };

export const accessTokenSignOptions: SignOptionsAndSecret = {
    expiresIn: '15m',
    secret: JWT_SECRET
};

export const refreshTokenSignOptions: SignOptionsAndSecret = {
    expiresIn: '30d',
    secret: JWT_REFRESH_SECRET
};

/**
 * Signs a JWT token with the given payload and options.
 * @param payload - A sessionId, and a userId for AccessTokens
 * @param options - Audience, Secret, Expiration time, etc
 * @returns The signed JWT token
 */
export const signToken = (
    payload: AccessTokenPayload | RefreshTokenPayload,
    options?: SignOptionsAndSecret
) => {
    const { secret, ...signOpts } = options || accessTokenSignOptions;
    return jwt.sign(
        payload,
        secret,
        { ...defaults, ...signOpts }); // Uses default audience if none provided
};

/**
 * Verifies a JWT token and returns the payload or an error message.
 * @param token - The JWT token to verify
 * @param options - Options for verification, including the secret and audience
 * @returns The decoded payload if verification is successful, or an error message if it fails
 */
export const verifyToken = <Payload extends object = AccessTokenPayload>(
    token: string,
    options?: VerifyOptionsAndSecret
) => {
    const { secret = JWT_SECRET, ...verifyOpts } = options || {};
    try {
        const payload = jwt.verify(
            token,
            secret,
            { ...defaults, ...verifyOpts }) as Payload;
        return { payload };
    } catch (error: any) {
        return { error: error.message };
    }
};