import Router from "express";
import { authToken } from "../middleware/authMiddleware";
import {
  handleCreateTask,
  handleUpdateTask,
  handleGetTask,
  handleSearchTask,
} from "../controllers/task.controller";

const router = Router();

router.get("/", authToken, handleGetTask);
router.post("/", authToken, handleCreateTask);
router.patch("/:id", authToken, handleUpdateTask);
router.get("/search", authToken, handleSearchTask);

export default router;
