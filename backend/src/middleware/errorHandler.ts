import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/appError";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies";

/**
 * Middleware to catch all errors throw by api routes
 */
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.log(`PATH: ${req.path}`, error);

    if (req.path === REFRESH_PATH) clearAuthCookies(res); // Clear both cookies if error occurs on refresh route

    if (error instanceof z.ZodError) {
        return handleZodError(res, error);
    }

    if (error instanceof AppError) {
        return handleAppError(res, error);
    }

    res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

/**
 * Handle App Errors
 */
const handleAppError = (res: Response, error: AppError) => {
    res.status(error.statusCode).json({
        message: error.message,
        errorCode: error.errorCode,
    })};

/**
 * Return nicer zod error messages
 */
const handleZodError = (res: Response, error: z.ZodError) => {
    const errors = error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
    }));
    res.status(BAD_REQUEST).json({
        message: 'Invalid request',
        errors
    });
}

export default errorHandler;