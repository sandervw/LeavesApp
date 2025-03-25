import express from "express";
import mongoose from "mongoose";
import {config} from "dotenv";
import cors from "cors"; // cors (Cross-Origin Resource Sharing: allows api calls from outside of the server domain)
import templateRoutes from "./routes/templateRoutes.js";
// import storynodeRoutes from "./routes/storynodeRoutes.js";

// Create express server
config();
const server = express();
const PORT = process.env.PORT || 3000;

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
server.use("/templates", templateRoutes);
// server.use("/storynodes", storynodeRoutes);

/*==MAIN REQUESTS==*/
server.get('/', async (req, res) => {
    res.json({mssg: 'Welcome to the app'});
});

/*==CONNECT TO MONGO==*/
// Async (returns a promise)
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // Start listening for requests
        server.listen(PORT, () => {
            console.log(`Listening on Port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(process.env.MONGO_URI);
        console.log(err);
    });