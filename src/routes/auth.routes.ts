import { Router } from "express";

import {
  handleRegister,
  handleLogin,
  activateAccount,
  reActivateAccount,
  handleChangePassword,
  handleForgotPassword,
  handleResetPassword,
} from "../controllers/auth.controller";

import { authToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", handleLogin);
router.post("/register", handleRegister);
router.get("/activate", activateAccount);
router.get("/reactivate", reActivateAccount);
router.patch("/change-password", authToken, handleChangePassword);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword);

export default router;
