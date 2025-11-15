import 'dotenv/config'; // NEEDS TO BE ON TOP: loads environment variables from a .env file
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // Cross-Origin Resource Sharing: allows api calls from outside of the server domain
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

// Create express server
export const app = express();
// Trust only the first proxy (Azure's load balancer) for rate limiting
// See: https://express-rate-limit.github.io/ERR_ERL_PERMISSIVE_TRUST_PROXY/
app.set('trust proxy', 1);

/*==MIDDLEWARE==*/
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded request body (IE. name=John+Doe&age=25)
app.use(express.json()); // (Tells express to expect a Content-Type of JSON)
app.use(
  cors({
    origin: APP_ORIGIN, // Only frontend code can access API
    credentials: true, // Allows cookies to be sent with requests (for authentication)
  })
);
app.use(helmetConfig); // Sets various HTTP headers for security
app.use(cookieParser() as express.RequestHandler); // Parses cookies from request headers (for authentication)
// ******Note: See cookies.ts - the refresh token is only sent on the auth/refresh path
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

/*==ROUTES==*/
app.use('/auth', authRoutes);
app.use('/user', authenticate, globalLimiter, userRoutes);
app.use('/session', authenticate, globalLimiter, sessionRoutes);
app.use('/template', authenticate, globalLimiter, templateRoutes);
app.use('/storynode', authenticate, globalLimiter, storynodeRoutes);
if (NODE_ENV === 'test') { // Test routes (only available in test environment)
  app.use('/test', testRoutes);
}

// TODO: handle unknown routes (404)


app.use(errorHandler); // Catches all errors thrown in routes above

/*==MAIN REQUESTS==*/
app.get('/', async (req, res) => {
  try {
    await mongoose.connection.db!.admin().ping();
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});