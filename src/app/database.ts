import mongoose from "mongoose";
import { MONGO_URI } from "../utils/env";
import { logger } from "./logging";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI as string);
    logger.info("DB connected");
  } catch (error) {
    logger.error("DB connection failed", error);
    process.exit(1);
  }
};
