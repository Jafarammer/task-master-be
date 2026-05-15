import Router from "express";
import {
  handleGetProfile,
  handleUpdateProfile,
  handleUpdateProfilePicture,
} from "../controllers/profile.controller";
import { authToken } from "../middleware/authMiddleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.get("/", authToken, handleGetProfile);
router.patch("/", authToken, handleUpdateProfile);
router.patch(
  "/picture",
  authToken,
  upload.single("profile_picture"),
  handleUpdateProfilePicture,
);

export default router;
