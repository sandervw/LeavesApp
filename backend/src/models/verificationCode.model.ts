import mongoose from 'mongoose';
import { VerificationCodeDoc } from '../schemas/mongo.schema';

// Each schema maps to a MongoDB collection and defines the shape of the documents within that collection
const VerificationCodeSchema = new mongoose.Schema<VerificationCodeDoc>({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    codeType: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
});

const VerificationCodeModel = mongoose.model<VerificationCodeDoc>(
    'VerificationCode',
    VerificationCodeSchema,
    'verification_codes' // Overrides default collection name
);

export default VerificationCodeModel;