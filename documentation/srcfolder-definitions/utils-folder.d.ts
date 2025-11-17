/** *date.ts */
// total size: 570 chars

export const oneYearFromNow: () => Date;
export const thirtyDaysFromNow: () => Date;
export const oneHourFromNow: () => Date;
export const fifteenMinutesFromNow: () => Date;
export const fiveMinutesAgo: () => Date;
export const ONE_DAY_MS: number;

/** *jwt.ts */
// total size: 1910 chars

import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { SessionDoc } from "../schemas/mongo.schema";

export type RefreshTokenPayload = {
    sessionId: SessionDoc['_id'];
};

export type AccessTokenPayload = {
    sessionId: SessionDoc['_id'];
    userId: SessionDoc['userId'];
};

export const accessTokenSignOptions: SignOptions & { secret: string; };
export const refreshTokenSignOptions: SignOptions & { secret: string; };
export const signToken: (payload: AccessTokenPayload | RefreshTokenPayload, options?: SignOptions & { secret: string; }) => string;
export const verifyToken: <Payload extends object = AccessTokenPayload>(token: string, options?: VerifyOptions & { secret: string; }) => { payload: Payload } | { error: string };

/** *bcrypt.ts */
// total size: 410 chars

import bcrypt from 'bcrypt';

export const hashValue: (val: string, saltRounds?: number) => Promise<string>;
export const compareValue: (val: string, hashedVal: string) => Promise<boolean>;

/** *appAssert.ts */
// total size: 620 chars

import { AppError } from "./errorUtils";
import { HttpStatusCode } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

type AppAssert = (condition: unknown, httpStatusCode: HttpStatusCode, message: string, appErrorCode?: AppErrorCode) => asserts condition;

declare const appAssert: AppAssert;
export default appAssert;

/** *errorUtils.ts */
// total size: 650 chars

import { NextFunction, Request, Response } from 'express';
import AppErrorCode from "../constants/appErrorCode";
import { HttpStatusCode } from "../constants/http";

export class AppError extends Error {
    constructor(statusCode: HttpStatusCode, message: string, errorCode?: AppErrorCode);
    statusCode: HttpStatusCode;
    message: string;
    errorCode?: AppErrorCode;
}

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const catchErrors: (controller: AsyncController) => AsyncController;

/** *emailUtils.ts */
// total size: 2480 chars

import resend from "../config/resend";

type Params = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export const sendMail: (params: Params) => Promise<any>;
export const getPasswordResetTemplate: (url: string) => { subject: string; text: string; html: string; };
export const getVerifyEmailTemplate: (url: string) => { subject: string; text: string; html: string; };

/** *logger.ts */
// total size: 520 chars

import winston from 'winston';

export const logger: winston.Logger;

/** *cookies.ts */
// total size: 1620 chars

import { CookieOptions, Response } from "express";

export const REFRESH_PATH: string;
export const getAccessTokenCookieOptions: () => CookieOptions;
export const getRefreshTokenCookieOptions: () => CookieOptions;

type SetAuthCookiesParams = {
  res: Response;
  accessToken: string;
  refreshToken?: string;
};

export const setAuthCookies: (params: SetAuthCookiesParams) => Response;
export const clearAuthCookies: (res: Response) => Response;
