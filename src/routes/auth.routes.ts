import { Router } from "express";

import {
  authRegister,
  authLogin,
  activateAccount,
  reActivateAccount,
  handleChangePassword,
  handleForgotPassword,
  handleResetPassword,
} from "../controllers/auth.controller";

import { authToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", authRegister);
router.post("/login", authLogin);
router.get("/activate", activateAccount);
router.get("/reactivate", reActivateAccount);
router.patch("/change-password", authToken, handleChangePassword);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword);

export default router;
