import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { CLIENT_HOST } from "../utils/env";

// routes
import authRoutes from "../routes/auth.routes";
import profileRoutes from "../routes/profile.routes";
import taskRoutes from "../routes/task.routes";

const web: Application = express();

web.use(helmet());
web.use(express.json());

const allowedOrigins = ["http://localhost:5173", CLIENT_HOST].filter(
  Boolean,
) as string[];

web.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

web.use(morgan("dev"));

web.use("/api/auth", authRoutes);
web.use("/api/profile", profileRoutes);
web.use("/api/task", taskRoutes);

// Health check (Render cek ini)
web.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

export default web;
