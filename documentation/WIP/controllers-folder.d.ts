/** *auth.controller.d.ts */
// total size: 2282 chars
import { catchErrors } from '../utils/errorUtils';
import { signupUser, loginUser, logoutUser, refreshAccessToken, verifyEmail, forgotPassword, resetPassword } from '../services/auth.service';
import { CREATED, OK } from '../constants/http';
import { setAuthCookies } from '../utils/cookies';
import { clearAuthCookies } from '../utils/cookies';
import { emailSchema, passwordSchema, usernameSchema, userAgentSchema, mongoIdSchema } from '../schemas/controller.schema';

export const signupController: (req: any, res: any) => Promise<any>;
export const loginController: (req: any, res: any) => Promise<any>;
export const logoutController: (req: any, res: any) => Promise<any>;
export const refreshController: (req: any, res: any) => Promise<any>;
export const verifyController: (req: any, res: any) => Promise<any>;
export const forgotPasswordController: (req: any, res: any) => Promise<any>;
export const resetPasswordController: (req: any, res: any) => Promise<any>;

/** *user.controller.d.ts */
// total size: 343 chars
import { NOT_FOUND, OK } from '../constants/http';
import UserModel from '../models/user.model';
import appAssert from '../utils/appAssert';
import { catchErrors } from '../utils/errorUtils';

export const getUserController: (req: any, res: any) => Promise<any>;

/** *session.controller.d.ts */
// total size: 945 chars
import { NOT_FOUND, OK } from "../constants/http";
import SessionModel from "../models/session.model";
import appAssert from "../utils/appAssert";
import { catchErrors } from "../utils/errorUtils";
import { mongoIdSchema } from "../schemas/controller.schema";

export const getSessionsController: (req: any, res: any) => Promise<any>;
export const deleteSessionController: (req: any, res: any) => Promise<any>;

/** *template.controller.d.ts */
// total size: 1152 chars
import { CREATED, OK } from '../constants/http';
import TemplateService from '../services/template.service';
import { catchErrors } from '../utils/errorUtils';
import { mongoIdSchema, postSchema } from '../schemas/controller.schema';

export const getTemplatesController: (req: any, res: any) => Promise<any>;
export const getOneTemplateController: (req: any, res: any) => Promise<any>;
export const getTemplateChildrenController: (req: any, res: any) => Promise<any>;
export const postTemplateController: (req: any, res: any) => Promise<any>;
export const deleteTemplateController: (req: any, res: any) => Promise<any>;

/** *storynode.controller.d.ts */
// total size: 1647 chars
import { CREATED, OK } from '../constants/http';
import StorynodeService from '../services/storynode.service';
import { catchErrors } from '../utils/errorUtils';
import { mongoIdSchema, optionalMongoIdSchema, postSchema } from '../schemas/controller.schema';

export const getStorynodesController: (req: any, res: any) => Promise<any>;
export const getOneStorynodeController: (req: any, res: any) => Promise<any>;
export const getStorynodeChildrenController: (req: any, res: any) => Promise<any>;
export const postStorynodeController: (req: any, res: any) => Promise<any>;
export const deleteStorynodeController: (req: any, res: any) => Promise<any>;
export const postFromTemplateController: (req: any, res: any) => Promise<any>;
export const getStoryFileController: (req: any, res: any) => Promise<any>;

/** *test.controller.d.ts */
// total size: 507 chars
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { NODE_ENV } from '../constants/env';
import { OK } from '../constants/http';
import appAssert from '../utils/appAssert';

export const clearDatabaseHandler: (req: Request, res: Response) => Promise<void>;
