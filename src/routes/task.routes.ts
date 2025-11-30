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
  handleGetTaskCompleted,
  handleGetTaskPending,
  handleGetDetail,
} from "../controllers/task.controller";

const router = Router();

router.get("/", authToken, handleGetTask); //done integration
router.get("/:id", authToken, handleGetDetail); //done integration
router.post("/", authToken, handleCreateTask); //done integration
router.patch("/:id", authToken, handleUpdateTask);
router.get("/search", authToken, handleSearchTask);
router.delete("/soft/:task_id", authToken, handleSoftDeleteTask);
router.delete("/hard/:task_id", authToken, handleHardDelete); //done integration
router.patch("/restore/:task_id", authToken, handleRestoreTask);
router.patch("/status/:task_id", authToken, handleTaskUpdateStatus); //done integration
router.get("/completed", authToken, handleGetTaskCompleted);
router.get("/pending", authToken, handleGetTaskPending);

export default router;
