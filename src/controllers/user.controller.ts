import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const register = async (req: Request, res: Response) => {
  try {
    // console.log("📥 Register body:", req.body);
    const { firstName, lastName, email, password } = req.body;
    const user = await userService.registerUser(
      firstName,
      lastName,
      email,
      password
    );

    const userObj =
      typeof user.toObject === "function" ? user.toObject() : user;
    delete userObj.password;
    // console.log("✅ User saved:", user); // cek berhasil save
    res
      .status(201)
      .json({ message: "User registered successfully", data: userObj });
  } catch (error: any) {
    // console.error("❌ Register error:", error);
    res.status(400).json({ error: error.message });
  }
};
