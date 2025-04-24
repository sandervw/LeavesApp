import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";

/**
 * Middleware to catch all errors throw by api routes
 */
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.log(`PATH: ${req.path}`, error);

    if (error instanceof z.ZodError) {
        return handleZodError(res, error);
    }

    res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

/**
 * Return nicer zod error messages
 * @param res
 * @param error 
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