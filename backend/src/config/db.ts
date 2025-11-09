import mongoose from "mongoose";
import { MONGO_URI, NODE_ENV } from "../constants/env";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;

const connectToDatabase = async () => {
    try {
        let uri = MONGO_URI;

        // Use MongoDB Memory Server for test environment if MONGO_URI is not explicitly set
        // or if it's the default test URI from tests/setup.ts
        if (NODE_ENV === "test" && (!MONGO_URI || MONGO_URI === "mongodb://localhost:27017/test-db")) {
            console.log("Starting MongoDB Memory Server for test environment...");
            mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            console.log("MongoDB Memory Server started at:", uri);
        }

        await mongoose.connect(uri);
        console.log(`Connected to MongoDB (${NODE_ENV} environment)`);
    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
        process.exit(1); //shuts down server if it can't connect to db
    }
}

// Cleanup function for graceful shutdown
export const disconnectFromDatabase = async () => {
    try {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
            console.log("MongoDB Memory Server stopped");
        }
    } catch (error) {
        console.log("Error disconnecting from MongoDB:", error);
    }
}

export default connectToDatabase;