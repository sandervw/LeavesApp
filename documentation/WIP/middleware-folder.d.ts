/** *authenticate.ts */
// total size: 741 chars
import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import { verifyToken } from "../utils/jwt";

declare const authenticate: RequestHandler;
export default authenticate;

/** *errorHandler.ts */
// total size: 1334 chars
import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import { AppError } from "../utils/errorUtils";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies";
import { logger } from "../utils/logger";

declare const errorHandler: ErrorRequestHandler;
declare const handleZodError: (res: Response, error: z.ZodError) => Response;
declare const handleAppError: (res: Response, error: AppError) => Response;
export default errorHandler;
