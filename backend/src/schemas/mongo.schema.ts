import mongoose from 'mongoose';

/**
 * Schemas to ensure our controllers and services shake hands on the same data structure.
 * Defines shape of data in MongoDB and the shape of data in our controllers and services.
 * Each of these needs to extend mongoose.Document, for two reasons:
 * 1. Use mongoose doc's props/methods
 * 2. Use mongoose's ObjectId type for _id
 */

export interface UserDoc extends mongoose.Document<mongoose.Types.ObjectId> {
    email: string;
    username: string; // Mostly for showing off in the UI
    password: string;
    verified: boolean; // Whether the user has verified their email
    createdAt: Date;
    updatedAt: Date;
    comparePassword(val: string): Promise<boolean>;
    omitPassword(): Pick<UserDoc, "_id" | "email" | "username" | "verified" | "createdAt" | "updatedAt">;
}

export interface SessionDoc extends mongoose.Document<mongoose.Types.ObjectId> {
    userId: mongoose.Types.ObjectId;
    userAgent?: string; // What device user is signed in on
    createdAt: Date;
    expiresAt: Date;
}

export interface TreeDoc extends mongoose.Document<mongoose.Types.ObjectId> {
    name: string;
    type: string; // root, branch, or leaf
    text: string;
    children: string[]; // Array of ObjectIds referencing child nodes
    parent: string | null; // ObjectId referencing the parent node
    userId: mongoose.Types.ObjectId; // User ID to associate with the tree element
}