import Router from "express";
import { handleGetProfile } from "../controllers/profile.controller";
import { authToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authToken, handleGetProfile);

export default router;
