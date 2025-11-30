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

// ✅ LIST & SPECIAL ROUTES
router.get("/", authToken, handleGetTask); // done integration from fe
router.get("/search", authToken, handleSearchTask);
router.get("/completed", authToken, handleGetTaskCompleted); // done integration from fe
router.get("/pending", authToken, handleGetTaskPending);

// ✅ ACTION ROUTES
router.delete("/soft/:task_id", authToken, handleSoftDeleteTask);
router.delete("/hard/:task_id", authToken, handleHardDelete); // done integration from fe
router.patch("/restore/:task_id", authToken, handleRestoreTask);
router.patch("/status/:task_id", authToken, handleTaskUpdateStatus); // done integration from fe

// ✅ CREATE
router.post("/", authToken, handleCreateTask);

// ✅ DETAIL & UPDATE (DINAMIS DI PALING BAWAH)
router.get("/:id", authToken, handleGetDetail); // done integration from fe
router.patch("/:id", authToken, handleUpdateTask); // done integration from fe

export default router;
