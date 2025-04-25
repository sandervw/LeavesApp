import mongoose from 'mongoose';
import { thirtyDaysFromNow } from '../utils/date';

export interface SessionDoc extends mongoose.Document<mongoose.Types.ObjectId> {
    userId: mongoose.Types.ObjectId;
    userAgent?: string; // What device user is signed in on
    createdAt: Date;
    expiresAt: Date;
}

const SessionSchema = new mongoose.Schema<SessionDoc>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userAgent: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, default: thirtyDaysFromNow },
});

const SessionModel = mongoose.model<SessionDoc>(
    'Session',
    SessionSchema,
);

export default SessionModel;