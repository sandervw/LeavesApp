import mongoose from "mongoose";
import { MONGO_URI } from "../constants/env";

const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
        process.exit(1); //shuts down server if it can't connect to db
    }
}

export default connectToDatabase;