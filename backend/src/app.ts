import 'dotenv/config'; // NEEDS TO BE ON TOP: loads environment variables from a .env file
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // Cross-Origin Resource Sharing: allows api calls from outside of the server domain
import { APP_ORIGIN, NODE_ENV } from './constants/env';
import errorHandler from './middleware/errorHandler';
import authenticate from './middleware/authenticate';
import { OK } from './constants/http';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import sessionRoutes from './routes/session.route';
import templateRoutes from './routes/template.route';
import storynodeRoutes from './routes/storynode.route';
import testRoutes from './routes/test.route';
import { globalLimiter } from './config/rateLimit';
import { logger } from './utils/logger';


// Create express server
export const app = express();

/*==MIDDLEWARE==*/
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded request body (IE. name=John+Doe&age=25)
app.use(express.json()); // (Tells express to expect a Content-Type of JSON)
app.use(
  cors({
    origin: APP_ORIGIN, // Only frontend code can access API
    credentials: true, // Allows cookies to be sent with requests (for authentication)
  })
);
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

// Test routes (only available in test environment)
if (NODE_ENV === 'test') {
  app.use('/test', testRoutes);
}

// TODO: handle unknown routes (404)


app.use(errorHandler); // Catches all errors thrown in routes above

/*==MAIN REQUESTS==*/
app.get('/', (req, res) => {
  res.status(OK).json({ status: 'healthy' });
});