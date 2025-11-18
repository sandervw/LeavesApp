/** *mongo.schema.ts */
// total size: 1529 chars
import mongoose from 'mongoose';
import VerificationCodeTypes from '../constants/verificationCodeType';

export type mongoId = mongoose.Types.ObjectId;

export interface UserDoc extends mongoose.Document<mongoId> {
  email: string;
  username: string;
  password: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<UserDoc, "_id" | "email" | "username" | "verified" | "createdAt" | "updatedAt">;
}

export interface VerificationCodeDoc extends mongoose.Document<mongoId> {
  userId: mongoId;
  codeType: VerificationCodeTypes;
  createdAt: Date;
  expiresAt: Date;
}

export interface SessionDoc extends mongoose.Document<mongoId> {
  userId: mongoId;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface TreeDoc extends mongoose.Document<mongoId> {
  name: string;
  type: string;
  text: string;
  children: mongoId[];
  parent: mongoId | null;
  userId: mongoId;
  depth: number;
}

export interface TemplateDoc extends TreeDoc {
  wordWeight: number;
}

export interface StorynodeDoc extends TreeDoc {
  isComplete: boolean;
  wordWeight: number;
  wordLimit: number;
  wordCount: number;
  archived: boolean;
}

/** *controller.schema.ts */
// total size: 1142 chars
import { Types } from 'mongoose';
import { z } from 'zod';

export const emailSchema: z.ZodType<string>;
export const mongoIdSchema: z.ZodType<Types.ObjectId>;
export const optionalMongoIdSchema: z.ZodType<Types.ObjectId | null>;
export const usernameSchema: z.ZodType<string>;
export const passwordSchema: z.ZodType<string>;
export const userAgentSchema: z.ZodType<string | undefined>;

export const postSchema: z.ZodType<{
  _id?: Types.ObjectId | null;
  kind?: 'storynode' | 'template';
  userId?: Types.ObjectId | null;
  name: string;
  type: 'root' | 'branch' | 'leaf';
  text: string;
  children?: (Types.ObjectId | null)[];
  parent?: Types.ObjectId | null;
  depth?: number;
  wordWeight?: number | null;
  wordLimit?: number | null;
  wordCount?: number | null;
  isComplete?: boolean | null;
  archived?: boolean | null;
}>;
