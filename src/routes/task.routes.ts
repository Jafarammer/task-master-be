import Router from "express";
import { authToken } from "../middleware/authMiddleware";
import {
  handleCreateTask,
  handleUpdateTask,
} from "../controllers/task.controller";

const router = Router();

router.post("/", authToken, handleCreateTask);
router.patch("/:id", authToken, handleUpdateTask);

export default router;
