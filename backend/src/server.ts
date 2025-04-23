import express from "express";
import mongoose from "mongoose";
import {config} from "dotenv";
import { PORT, MONGO_URI } from "./constants/env";
import cors from "cors"; // cors (Cross-Origin Resource Sharing: allows api calls from outside of the server domain)
import templateRoutes from "./routes/templateRoutes";
import storynodeRoutes from "./routes/storynodeRoutes";
import userRoutes from "./routes/userRoutes";

// Create express server
config();
const server = express();

/*==MIDDLEWARE==*/
// Parses URL-encoded request body (IE. name=John+Doe&age=25)
server.use(express.urlencoded({ extended: true }));
// Parses request body into a javascript object (tells express to expect a Content-Type of JSON)
server.use(express.json())
// Allows CORS requests
server.use(cors());
// Logging (need next to go to next function/middleware)
server.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});
server.use("/template", templateRoutes);
server.use("/storynode", storynodeRoutes);
server.use("/user", userRoutes);

/*==MAIN REQUESTS==*/
server.get('/', async (req, res) => {
    res.json({mssg: 'Welcome to the app'});
});

/*==CONNECT TO MONGO==*/
// Async (returns a promise)
mongoose.connect(MONGO_URI)
    .then(() => {
        // Start listening for requests
        server.listen(PORT, () => {
            console.log(`Listening on Port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(MONGO_URI);
        console.log(err);
    });