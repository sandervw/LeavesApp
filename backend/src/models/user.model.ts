import mongoose from 'mongoose';
import { compareValue, hashValue } from '../utils/bcrypt';

// Gives us methods and typing for props on mongoDB document
export interface UserDoc extends mongoose.Document {
    email: string;
    username: string;
    password: string;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword: (password: string) => Promise<boolean>;
}

// Each schema maps to a MongoDB collection and defines the shape of the documents within that collection
const UserSchema = new mongoose.Schema<UserDoc>({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // If the password hasn't been modified, skip hashing
    this.password = await hashValue(this.password); // Hash the password before saving the user document
    next();
});

UserSchema.methods.comparePassword = async function(password: string) {
    return compareValue(password, this.password);
}

const UserModel = mongoose.model<UserDoc>('User', UserSchema);

export default UserModel;