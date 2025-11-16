import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./src/routes/user.routes";
import authRoutes from "./src/routes/auth.routes";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

// Error handler
// app.use(errorHandler);

export default app;
