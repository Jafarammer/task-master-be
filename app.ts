import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { CLIENT_HOST } from "./src/utils/env";

import userRoutes from "./src/routes/user.routes";
import authRoutes from "./src/routes/auth.routes";
import taskRoutes from "./src/routes/task.routes";

const app: Application = express();

// Security first
app.use(helmet());

// Middleware
app.use(express.json());

const allowedOrigins = ["http://localhost:5173", CLIENT_HOST].filter(
  Boolean
) as string[];

app.use(
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
  })
);

app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/task", taskRoutes);

// Health check (Render cek ini)
app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

export default app;
