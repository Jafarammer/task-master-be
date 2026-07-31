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
  handleGetTaskTrash,
  handleGetTrashStatistics,
  handleDeleteAllTaskTrash,
} from "../controllers/task.controller";

const router = Router();

router.get("/completed", authToken, handleGetTaskCompleted);
router.get("/pending", authToken, handleGetTaskPending);
router.get("/trash/statistics", authToken, handleGetTrashStatistics);
router.get("/trash", authToken, handleGetTaskTrash);
router.get("/detail/:id", authToken, handleGetDetailTask);
router.get("/", authToken, handleGetTask);

router.delete("/trash/all", authToken, handleDeleteAllTaskTrash);
router.delete("/soft/:taskId", authToken, handleSoftDeleteTask);
router.delete("/hard/:taskId", authToken, handleHardDeleteTask);

router.patch("/restore/:taskId", authToken, handleRestoreTask);
router.patch("/status/:taskId", authToken, handleTaskUpdateStatus);

router.post("/", authToken, handleCreateTask);
router.put("/:id", authToken, handleUpdateTask);

export default router;
