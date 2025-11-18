/** *resend.ts */
// total size: 149 chars
import { Resend } from "resend";
import { RESEND_API_KEY } from "../constants/env";

declare const resend: Resend;
export default resend;

/** *security.ts */
// total size: 957 chars
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { NODE_ENV } from '../constants/env';

export const globalLimiter: rateLimit.RateLimitRequestHandler;
export const authLimiter: rateLimit.RateLimitRequestHandler;
export const helmetConfig: helmet.HelmetOptions;

/** *secrets.ts */
// total size: 1168 chars
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { SECRET_NAMES } from "../constants/env";

export const getSecretValue: (name: string) => Promise<string | undefined>;
export const initializeSecrets: () => Promise<void>;

/** *db.ts */
// total size: 674 chars
import mongoose from "mongoose";
import { MONGO_URI, NODE_ENV } from "../constants/env";
import { logger } from "../utils/logger";

declare const connectToDatabase: () => Promise<void>;
export default connectToDatabase;
