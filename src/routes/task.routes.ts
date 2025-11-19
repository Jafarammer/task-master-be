import Router from "express";
import { authToken } from "../middleware/authMiddleware";
import {
  handleCreateTask,
  handleUpdateTask,
  handleGetTask,
  handleSearchTask,
  handleDeleteTask,
} from "../controllers/task.controller";

const router = Router();

router.get("/", authToken, handleGetTask);
router.post("/", authToken, handleCreateTask);
router.patch("/:id", authToken, handleUpdateTask);
router.get("/search", authToken, handleSearchTask);
router.delete("/:task_id", authToken, handleDeleteTask);

export default router;
