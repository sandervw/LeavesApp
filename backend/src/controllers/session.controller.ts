import { NOT_FOUND, OK } from "../constants/http";
import SessionModel from "../models/session.model";
import appAssert from "../utils/appAssert";
import { catchErrors } from "../utils/errorUtils";
import { mongoIdSchema } from "./controller.schema";

/**
 * Retrieves the session information for the current user
 * No need to validate request, as authenticate middleware already does that
 * No need for a service either, as this is a simple query to the database
 */
export const getSessionsController = catchErrors(async (req, res) => {
    const sessions = await SessionModel.find(
        { userId: req.userId, expiresAt: { $gt: new Date() } },
        { _id: 1, userAgent: 1, createdAt: 1 }, // Only return these fields
        { sort: { createdAt: -1 } }); // Sort by createdAt in descending order (most recent first)
    return res.status(OK).json(
        sessions.map((session) => ({
            ...session.toObject(),
            ...(
                // Add isCurrent property to the current session
                // On frontend, ensures that user won't delete their current session
                session.id === req.sessionId && { isCurrent: true } 
            )
        }))
    );
});

/**
 * Deletes a session for the current user
 * No need to validate request, as authenticate middleware already does that
 * No need for a service either, as this is a simple query to the database
 */
export const deleteSessionController = catchErrors(async (req, res) => {
    const sessionId = mongoIdSchema.parse(req.params.id);
    const deleted = await SessionModel.findOneAndDelete({
        _id: sessionId,
        userId: req.userId, // Need this, otherwise user could delete any session
    });
    appAssert(deleted, NOT_FOUND, "Session not found");
    return res.status(OK).json({ message: "Session deleted" });
}); 
