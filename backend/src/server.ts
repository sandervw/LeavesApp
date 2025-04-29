import 'dotenv/config'; // NEEDS TO BE ON TOP: loads environment variables from a .env file
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // Cross-Origin Resource Sharing: allows api calls from outside of the server domain
import { PORT, NODE_ENV, APP_ORIGIN } from './constants/env';
import connectToDatabase from './config/db';
import errorHandler from './middleware/errorHandler';
import authenticate from './middleware/authenticate';
import { OK } from './constants/http';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import sessionRoutes from './routes/session.route';
import templateRoutes from './routes/template.route';

// Create express server
const app = express();

/*==MIDDLEWARE==*/
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded request body (IE. name=John+Doe&age=25)
app.use(express.json()); // (Tells express to expect a Content-Type of JSON)
app.use(
    cors({
        origin: APP_ORIGIN, // Only frontend code can access API
        credentials: true, // Allows cookies to be sent with requests (for authentication)
    })
);
app.use(cookieParser()); // Parses cookies from request headers (for authentication)
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

/*==ROUTES==*/
app.use('/auth', authRoutes);
app.use('/user', authenticate, userRoutes);
app.use('/sessions', authenticate, sessionRoutes);
// app.use('/template', authenticate, templateRoutes);
// app.use('/storynode', storynodeRoutes);
app.use(errorHandler); // Catches all errors thrown in routes above

/*==MAIN REQUESTS==*/
app.get('/', (req, res, next) => {
    res.status(OK).json({ status: 'healthy' });
});
app.listen(PORT, async () => {
    console.log(`Listening on Port ${PORT} in ${NODE_ENV}`);
    await connectToDatabase();
});