import mongoose from "mongoose";
import { MONGO_URI } from "../src/utils/env";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.info("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ DB connection failed", error);
    process.exit(1);
  }
};
