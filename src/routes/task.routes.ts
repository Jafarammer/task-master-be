import Router from "express";
import { authToken } from "../middleware/authMiddleware";
import { handleCreateTask } from "../controllers/task.controller";

const router = Router();

router.post("/", authToken, handleCreateTask);

export default router;
