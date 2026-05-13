import Router from "express";
import {
  handleGetProfile,
  handleUpdateProfile,
} from "../controllers/profile.controller";
import { authToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authToken, handleGetProfile);
router.patch("/", authToken, handleUpdateProfile);

export default router;
