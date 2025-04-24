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
    comparePassword(val: string): Promise<boolean>;
    omitPassword(): Pick<UserDoc, "_id" | "email" | "username" | "verified" | "createdAt" | "updatedAt">;
}

// Each schema maps to a MongoDB collection and defines the shape of the documents within that collection
const userSchema = new mongoose.Schema<UserDoc>({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // If the password hasn't been modified, skip hashing
    this.password = await hashValue(this.password); // Hash the password before saving the user document
    next();
});

userSchema.methods.comparePassword = async function(password: string) {
    return compareValue(password, this.password);
}

userSchema.methods.omitPassword = function() {
    const user = this.toObject(); // Convert the Mongoose document to a plain JavaScript object
    delete user.password;
    return user;
};


const UserModel = mongoose.model<UserDoc>("User", userSchema);
export default UserModel;