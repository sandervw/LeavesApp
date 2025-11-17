/** *tree.service.ts */
// total size: 3761 chars
import mongoose from 'mongoose';
import { TreeDoc, mongoId } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/http';
import { MAX_TREE_DEPTH } from '../constants/env';
import { recursiveGetDescendants } from './recursive.service';

type QueryParam = {
  [key: string]: undefined | string | QueryParam | (string | QueryParam)[];
};

export default class TreeService<T extends TreeDoc> {
  constructor(model: mongoose.Model<T>);
  private model: mongoose.Model<T>;
  find: (userId: mongoId, query?: QueryParam) => Promise<T[]>;
  findById: (userId: mongoId, id: mongoId) => Promise<T>;
  findChildren: (userId: mongoId, id: mongoId) => Promise<T[]>;
  upsert: (userId: mongoId, data: T) => Promise<T>;
  deleteById: (userId: mongoId, id: mongoId) => Promise<{ 'Deleted': T | null }>;
  private calculateDepth: (userId: mongoId, parentId?: mongoId) => Promise<number>;
}

/** *template.service.ts */
// total size: 271 chars
import TreeService from './tree.service';
import { Template } from '../models/tree.model';
import { TemplateDoc } from '../schemas/mongo.schema';

declare class TemplateService extends TreeService<TemplateDoc> {
  constructor();
}

export default: TemplateService;

/** *storynode.service.ts */
// total size: 4753 chars
import TreeService from './tree.service';
import { Storynode } from '../models/tree.model';
import { StorynodeDoc, mongoId } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { NOT_FOUND } from '../constants/http';
import { recursiveStorynodeFromTemplate, recursiveUpdateWordLimits, recursiveGetLeaves } from './recursive.service';

declare class StorynodeService extends TreeService<StorynodeDoc> {
  constructor();
  upsert: (userId: mongoId, data: StorynodeDoc) => Promise<StorynodeDoc>;
  addFromTemplate: (userId: mongoId, templateId: mongoId, parentId?: mongoId | null) => Promise<StorynodeDoc>;
  getStoryFile: (userId: mongoId, storynodeId: mongoId) => Promise<string>;
  private calculateWordCount: (text: string) => number;
  private calculateChildrenWordCount: (children: StorynodeDoc[]) => number;
  private collectAncestors: (nodeId: mongoId, userId: mongoId) => Promise<StorynodeDoc[]>;
  private updateParentWordCounts: (node: StorynodeDoc, userId: mongoId) => Promise<void>;
}

export default: StorynodeService;

/** *auth.service.ts */
// total size: 6989 chars
import VerificationCodeType from '../constants/verificationCodeType';
import SessionModel from '../models/session.model';
import UserModel from '../models/user.model';
import VerificationCodeModel from '../models/verificationCode.model';
import { fiveMinutesAgo, ONE_DAY_MS, oneHourFromNow, oneYearFromNow, thirtyDaysFromNow } from '../utils/date';
import appAssert from '../utils/appAssert';
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } from '../constants/http';
import { RefreshTokenPayload, refreshTokenSignOptions, signToken, verifyToken } from '../utils/jwt';
import { sendMail } from '../utils/emailUtils';
import { getPasswordResetTemplate, getVerifyEmailTemplate } from '../utils/emailUtils';
import { APP_ORIGIN, NODE_ENV } from '../constants/env';
import { mongoId } from '../schemas/mongo.schema';
import { logger } from '../utils/logger';

export type SignupUserParams = {
  email: string;
  username: string;
  password: string;
  userAgent?: string;
};

export const signupUser: (userData: SignupUserParams) => Promise<{
  user: any;
  accessToken: string;
  refreshToken: string;
}>;

export type LoginUserParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const loginUser: (params: LoginUserParams) => Promise<{
  user: any;
  accessToken: string;
  refreshToken: string;
}>;

export const logoutUser: (accessToken: string) => Promise<void>;

export const refreshAccessToken: (refreshToken: string) => Promise<{
  accessToken: string;
  newRefreshToken?: string;
}>;

export const verifyEmail: (verificationCode: mongoId) => Promise<{
  user: any;
}>;

export const forgotPassword: (email: string) => Promise<{
  verificationUrl?: string;
  emailId?: string;
}>;

type ResetPasswordParams = {
  verificationCode: mongoId;
  password: string;
};

export const resetPassword: (params: ResetPasswordParams) => Promise<{
  user: any;
}>;

/** *recursive.service.ts */
// total size: 3568 chars
import mongoose from 'mongoose';
import { StorynodeDoc, TreeDoc, mongoId } from "../schemas/mongo.schema";
import { Storynode, Template } from '../models/tree.model';
import appAssert from '../utils/appAssert';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/http';
import { MAX_TREE_DEPTH } from '../constants/env';

export const recursiveUpdateWordLimits: (node: Readonly<StorynodeDoc>) => Promise<void>;

export const recursiveGetDescendants: <T extends TreeDoc>(tree: T, model: mongoose.Model<T>) => Promise<T[]>;

export const recursiveGetLeaves: <T extends TreeDoc>(tree: T, model: mongoose.Model<T>) => Promise<T[]>;

export const recursiveStorynodeFromTemplate: (userId: mongoId, templateId: mongoId, parentId?: mongoId) => Promise<StorynodeDoc>;
