import Router from "express";
import { authRegister, authLogin } from "../controllers/auth.controller";

const router = Router();

router.post("/register", authRegister);
router.post("/login", authLogin);

export default router;
