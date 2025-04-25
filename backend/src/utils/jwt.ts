import jwt, { SignOptions } from "jsonwebtoken";
import { SessionDoc } from "../models/session.model";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";


export type RefreshTokenPayload = {
    sessionId: SessionDoc['id']
}

export type AccessTokenPayload = {
    sessionId: SessionDoc['id'],
    userId: SessionDoc['userId']
}

type SignOptionsAndSecret = SignOptions & { secret: string }

const defaults: SignOptions = {
    audience: ['user'],
}

export const accessTokenSignOptions: SignOptionsAndSecret = {
    expiresIn: '15m',
    secret: JWT_SECRET
}

export const refreshTokenSignOptions: SignOptionsAndSecret = {
    expiresIn: '30d',
    secret: JWT_REFRESH_SECRET
}

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
}

export const verifyToken = (
    token: 
)