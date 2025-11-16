import Router from "express";
import {
  handleGetAllUser,
  handleGetUserById,
} from "../controllers/user.controller";
import { authToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authToken, handleGetAllUser);
router.get("/:id", authToken, handleGetUserById);

export default router;
