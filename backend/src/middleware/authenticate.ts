import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import { verifyToken } from "../utils/jwt";

/**
 * Middleware to check if the user is authenticated.
 * If the user is authenticated, it adds the userId and sessionId to the request object.
 */
const authenticate: RequestHandler = (req, res, next) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    appAssert(
        accessToken,
        UNAUTHORIZED,
        'Not authorized',
        AppErrorCode.InvalidAccessToken);
    const { error, payload } = verifyToken(accessToken);
    appAssert(
        payload,
        UNAUTHORIZED,
        error === 'jwt expired' ? 'Access token expired' : 'Invalid access token',
        AppErrorCode.InvalidAccessToken //We use this back on frontend to trigger a refresh token request
    );
    req.userId = payload.userId;
    req.sessionId = payload.sessionId;
    next();
};

export default authenticate;
