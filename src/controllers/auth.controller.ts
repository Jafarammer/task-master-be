import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { ILoginPayload } from "../interfaces/auth.interface";
import * as authService from "../services/auth.service";
import { CLIENT_HOST } from "../utils/env";

export const authRegister = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  const result = await authService.registerUser({
    fullName,
    email,
    password,
  });

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(201).json({ message: result.message });
};

export const handleLogin = async (req: Request, res: Response) => {
  const payload: ILoginPayload = {
    email: req.body.email,
    password: req.body.password,
  };
  const result = await authService.loginUser(payload);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res
    .status(result.code)
    .json({ accessToken: result.token, message: result.message });
};

export const activateAccount = async (req: Request, res: Response) => {
  const { code } = req.query;

  const result = await authService.activateUser(code as string);

  if (result.error) {
    return res.redirect(
      `${CLIENT_HOST}/login?status=error&message=${encodeURIComponent(
        result.message || "Invalid activation token",
      )}`,
    );
  }
  return res.redirect(
    `${CLIENT_HOST}/login?status=success&message=${encodeURIComponent(
      "Account activated successfully",
    )}`,
  );
};

export const reActivateAccount = async (req: Request, res: Response) => {
  const { code } = req.query;

  const result = await authService.reActivateUser(code as string);

  if (result.error) {
    return res.redirect(
      `${CLIENT_HOST}/login?status=error&message=${encodeURIComponent(
        result.message || "Invalid activation token",
      )}`,
    );
  }
  return res.redirect(
    `${CLIENT_HOST}/login?status=success&message=${encodeURIComponent(
      "Account activated successfully",
    )}`,
  );
};

export const handleChangePassword = async (req: AuthRequest, res: Response) => {
  const id = req.user.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const result = await authService.changePassword(id, {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }
  return res.status(result.code).json({
    message: result.message,
    data: result.data,
    requireRelogin: result.requireRelogin,
  });
};

export const handleForgotPassword = async (req: Request, res: Response) => {
  const payload = {
    email: req.body.email,
  };
  const result = await authService.forgotPassword(payload);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }
  return res.status(result.code).json({ message: result.message });
};

export const handleResetPassword = async (req: Request, res: Response) => {
  const payload = {
    token: req.body.token,
    newPassword: req.body.newPassword,
    confirmPassword: req.body.confirmPassword,
  };
  const result = await authService.resetPassword(payload);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }
  return res.status(result.code).json({ message: result.message });
};
