import { ErrorRequestHandler } from "express";

/**
 * Middleware to catch all errors throw my api routes
 */
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.log(`PATH: ${req.path}`, error);
    res.status(500).send("Internal Server Error"); // 500 is a generic server error
};

export default errorHandler;