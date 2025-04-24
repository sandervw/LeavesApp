import { NextFunction, Request, Response } from 'express'

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
const catchErrors = (controller: AsyncController): AsyncController => {
    return async (req, res, next) => {
        try {
            await controller(req, res, next);
        } catch (error) {
            next(error); // Passes error to next middleware (error handler)
        }
    }
}

export default catchErrors;