import mongoose from "mongoose";
import { MONGO_URI, NODE_ENV } from "../constants/env";
import { logger } from "../utils/logger";

let mongoServer: any = null;

const connectToDatabase = async () => {
  try {
    let uri = MONGO_URI;

    // Use MongoDB Memory Server for test env if MONGO_URI not set or default test URI from tests/setup.ts
    if (NODE_ENV === "test" && (!MONGO_URI || MONGO_URI === "mongodb://localhost:27017/test-db")) {
      logger.info("Starting MongoDB Memory Server for test environment...");
      // Dynamically import mongodb-memory-server only in test environment
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      logger.info("MongoDB Memory Server started at:", uri);
    }

    await mongoose.connect(uri);
    logger.info(`Connected to MongoDB (${NODE_ENV} environment)`);
  } catch (error) {
    logger.info("Error connecting to MongoDB:", error);
    process.exit(1); //shuts down server if it can't connect to db
  }
};

export default connectToDatabase;