import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const authRegister = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await authService.registerUser(
      firstName,
      lastName,
      email,
      password
    );

    const userObj =
      typeof user.toObject === "function" ? user.toObject() : user;
    delete userObj.password;
    res
      .status(201)
      .json({ message: "User registered successfully", data: userObj });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const authLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { accessToken, user } = await authService.loginUser(email, password);
    res.json({ accessToken });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
