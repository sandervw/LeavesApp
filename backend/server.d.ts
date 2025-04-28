import mongoose from "mongoose";

/**
 * Declaration file for global types
 * Used primarily to add userId and SessionId to any requests
 */

declare global {
    namespace Express {
        interface Request {
            userId: mongoose.Types.ObjectId;
            sessionId: mongoose.Types.ObjectId;
        }
    }
}