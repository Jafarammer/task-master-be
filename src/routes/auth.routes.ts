import Router from "express";
import {
  authRegister,
  authLogin,
  activateAccount,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", authRegister);
router.post("/login", authLogin);
router.get("/activate", activateAccount);

export default router;
