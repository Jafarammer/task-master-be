import { Router } from "express";

import {
  authRegister,
  authLogin,
  activateAccount,
  reActivateAccount,
  handleChangePassword,
} from "../controllers/auth.controller";

import { authToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", authRegister);
router.post("/login", authLogin);
router.get("/activate", activateAccount);
router.get("/reactivate", reActivateAccount);
router.patch("/change-password", authToken, handleChangePassword);

export default router;
