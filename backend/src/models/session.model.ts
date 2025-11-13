import mongoose from 'mongoose';
import { thirtyDaysFromNow } from '../utils/date';
import { SessionDoc } from '../schemas/mongo.schema';

const sessionSchema = new mongoose.Schema<SessionDoc>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userAgent: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, default: thirtyDaysFromNow },
})
  .index({ userId: 1, expiresAt: 1 });

const SessionModel = mongoose.model<SessionDoc>(
  'Session',
  sessionSchema,
);

export default SessionModel;