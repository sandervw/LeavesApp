import AppErrorCode from "../constants/appErrorCode";
import { HttpStatusCode } from "../constants/http";
import { NextFunction, Request, Response } from 'express'


export class AppError extends Error {
    constructor(
        public statusCode: HttpStatusCode,
        public message: string,
        public errorCode?: AppErrorCode,
    ){
        super(message);
    }
}

type AsyncController = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

/**
 * Wraps an async controller to catch errors and pass them to the next middleware.
 * @param controller - The function to wrap
 * @returns A new function with error handling
 */
export const catchErrors = (controller: AsyncController): AsyncController => {
    return async (req, res, next) => {
        try {
            await controller(req, res, next);
        } catch (error) {
            next(error); // Passes error to next middleware (error handler)
        }
    }
}