import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { CLIENT_HOST } from "../utils/env";

export const authRegister = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  const result = await authService.registerUser({
    firstName,
    lastName,
    email,
    password,
  });

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(201).json({ message: result.message });
};

export const authLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res
    .status(201)
    .json({ accessToken: result.token, message: result.message });
};

export const activateAccount = async (req: Request, res: Response) => {
  const { code } = req.query;

  const result = await authService.activateUser(code as string);

  if (result.error) {
    return res.redirect(
      `${CLIENT_HOST}/login?status=error&message=${encodeURIComponent(
        result.message || "Invalid activation token"
      )}`
    );
  }
  return res.redirect(
    `${CLIENT_HOST}/login?status=success&message=${encodeURIComponent(
      "Account activated successfully"
    )}`
  );
};
