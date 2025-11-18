/** *app.ts */
// total size: 1892 chars
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { APP_ORIGIN, NODE_ENV } from './constants/env';
import errorHandler from './middleware/errorHandler';
import authenticate from './middleware/authenticate';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import sessionRoutes from './routes/session.route';
import templateRoutes from './routes/template.route';
import storynodeRoutes from './routes/storynode.route';
import testRoutes from './routes/test.route';
import { globalLimiter } from './config/security';
import { logger } from './utils/logger';
import { helmetConfig } from './config/security';
import mongoose from 'mongoose';

export const app: express.Application;
