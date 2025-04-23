import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PORT, MONGO_URI } from './constants/env';
import cors from 'cors'; // cors (Cross-Origin Resource Sharing: allows api calls from outside of the server domain)
import templateRoutes from './routes/templateRoutes';
import storynodeRoutes from './routes/storynodeRoutes';
import userRoutes from './routes/userRoutes';

// Create express server
const app = express();

/*==MIDDLEWARE==*/
// Parses URL-encoded request body (IE. name=John+Doe&age=25)
app.use(express.urlencoded({ extended: true }));
// Parses request body into a javascript object (tells express to expect a Content-Type of JSON)
app.use(express.json());
// Allows CORS requests
app.use(cors());
// Logging (need next to go to next function/middleware)
app.use((req: Request, res: Response, next) => {
    console.log(req.path, req.method);
    next();
});
// app.use('/template', templateRoutes);
// app.use('/storynode', storynodeRoutes);
// app.use('/user', userRoutes);

/*==MAIN REQUESTS==*/
app.get('/', async (req: Request, res: Response) => {
    res.json({mssg: 'Welcome to the app'});
});

/*==CONNECT TO MONGO==*/
// Async (returns a promise)
mongoose.connect(MONGO_URI)
    .then(() => {
        // Start listening for requests
        app.listen(PORT, () => {
            console.log(`Listening on Port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(MONGO_URI);
        console.log(err);
    });