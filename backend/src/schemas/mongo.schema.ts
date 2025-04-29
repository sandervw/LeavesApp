import mongoose from 'mongoose';

/**
 * Schemas to ensure our controllers and services shake hands on the same data structure.
 * This is a good place to define the shape of our data and any default values.
 */

// This one needs to extend mongoose.Document (see pick below)
export interface UserDoc extends mongoose.Document<mongoose.Types.ObjectId> {
    email: string;
    username: string;
    password: string;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(val: string): Promise<boolean>;
    omitPassword(): Pick<UserDoc, "_id" | "email" | "username" | "verified" | "createdAt" | "updatedAt">;
}

// This one needs to extend mongoose.Document (see jwt util)
export interface SessionDoc extends mongoose.Document<mongoose.Types.ObjectId> {
    userId: mongoose.Types.ObjectId;
    userAgent?: string; // What device user is signed in on
    createdAt: Date;
    expiresAt: Date;
}

export interface TreeDoc {
    name: string;
    type: string; // root, branch, or leaf
    text: string;
    children: string[]; // Array of ObjectIds referencing child nodes
    parent: string | null; // ObjectId referencing the parent node
    userId: mongoose.Types.ObjectId; // User ID to associate with the tree element
}