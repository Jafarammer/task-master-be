import Router from "express";
import { authToken } from "../middleware/authMiddleware";
import {
  handleCreateTask,
  handleUpdateTask,
  handleGetTask,
  handleSearchTask,
  handleSoftDeleteTask,
  handleRestoreTask,
  handleHardDelete,
  handleTaskUpdateStatus,
} from "../controllers/task.controller";

const router = Router();

router.get("/", authToken, handleGetTask);
router.post("/", authToken, handleCreateTask);
router.patch("/:id", authToken, handleUpdateTask);
router.get("/search", authToken, handleSearchTask);
router.delete("/soft/:task_id", authToken, handleSoftDeleteTask);
router.delete("/hard/:task_id", authToken, handleHardDelete);
router.patch("/restore/:task_id", authToken, handleRestoreTask);
router.patch("/status/:task_id", authToken, handleTaskUpdateStatus);

export default router;
