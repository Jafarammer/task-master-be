import { Router } from "express";

import {
  authRegister,
  authLogin,
  activateAccount,
  handleChangePassword,
} from "../controllers/auth.controller";

import { authToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", authRegister);

router.post("/login", authLogin);

router.get("/activate", activateAccount);

router.patch(
  "/change-password",

  authToken,

  handleChangePassword,
);

export default router;
