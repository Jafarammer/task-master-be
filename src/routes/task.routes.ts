import Router from "express";
import { authToken } from "../middleware/authMiddleware";
import {
  handleCreateTask,
  handleUpdateTask,
  handleGetTask,
  handleSoftDeleteTask,
  handleRestoreTask,
  handleHardDeleteTask,
  handleTaskUpdateStatus,
  handleGetTaskCompleted,
  handleGetTaskPending,
  handleGetDetailTask,
} from "../controllers/task.controller";

const router = Router();

router.get("/", authToken, handleGetTask);
router.get("/completed", authToken, handleGetTaskCompleted);
router.get("/pending", authToken, handleGetTaskPending);

router.delete("/soft/:taskId", authToken, handleSoftDeleteTask);
router.delete("/hard/:taskId", authToken, handleHardDeleteTask);
router.patch("/restore/:taskId", authToken, handleRestoreTask);
router.patch("/status/:taskId", authToken, handleTaskUpdateStatus);

router.post("/", authToken, handleCreateTask);

router.get("/detail/:id", authToken, handleGetDetailTask);
router.patch("/:id", authToken, handleUpdateTask);

export default router;
