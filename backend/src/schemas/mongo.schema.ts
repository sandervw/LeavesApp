import mongoose from 'mongoose';
import VerificationCodeTypes from '../constants/verificationCodeType';

/**
 * Schemas to ensure our controllers and services shake hands on the same data structure.
 * Defines shape of data in MongoDB and the shape of data in our controllers and services.
 * Each of these needs to extend mongoose.Document, for two reasons:
 * 1. Use mongoose doc's props/methods
 * 2. Use mongoose's ObjectId type for _id
 */

export type mongoId = mongoose.Types.ObjectId;

export interface UserDoc extends mongoose.Document<mongoId> {
  email: string;
  username: string; // Mostly for showing off in the UI
  password: string;
  verified: boolean; // Whether the user has verified their email
  createdAt: Date;
  updatedAt: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<UserDoc, "_id" | "email" | "username" | "verified" | "createdAt" | "updatedAt">;
}

// Gives us methods and typing for props on mongoDB document
export interface VerificationCodeDoc extends mongoose.Document<mongoId> {
  userId: mongoId;
  codeType: VerificationCodeTypes;
  createdAt: Date;
  expiresAt: Date;
}

export interface SessionDoc extends mongoose.Document<mongoId> {
  userId: mongoId;
  userAgent?: string; // What device user is signed in on
  createdAt: Date;
  expiresAt: Date;
}

export interface TreeDoc extends mongoose.Document<mongoId> {
  name: string;
  type: string; // root, branch, or leaf
  text: string;
  children: mongoId[]; // Array of ObjectIds referencing child nodes
  parent: mongoId | null; // ObjectId referencing the parent node
  userId: mongoId; // User ID to associate with the tree element
  depth: number; // Depth of the node in the tree
}

export interface TemplateDoc extends TreeDoc {
  wordWeight: number; // Used to store the percentage of the word count that this element should take up
}

export interface StorynodeDoc extends TreeDoc {
  isComplete: boolean; // Used for rendering a finished vs unfinished element
  wordWeight: number; // Used to store the percentage of the word count that this element should take up
  wordLimit: number; // Used to store the maximum number of words for this node
  wordCount: number; // Used to store the current word count for this node
  archived: boolean; // Used to store whether a story is archived or not
}