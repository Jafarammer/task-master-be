import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validations/auth.validate";
import * as authService from "../services/auth.service";

export const handleLogin = async (req: Request, res: Response) => {
  const validated = loginValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      error: true,
      message: validated.error.issues[0].message,
      errors: validated.error.flatten(),
    });
  }
  const result = await authService.loginUser(validated.data);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res
    .status(result.code)
    .json({ accessToken: result.data.token, message: result.message });
};

export const handleRegister = async (req: Request, res: Response) => {
  const validated = registerValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      error: true,
      message: validated.error.issues[0].message,
      errors: validated.error.flatten(),
    });
  }

  const result = await authService.registerUser(validated.data);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({ message: result.message });
};

export const activateAccount = async (req: Request, res: Response) => {
  const { code } = req.query;

  const result = await authService.activateUser(code as string);

  if (result.error) {
    return res.redirect(result.data.redirectUrl);
  }
  return res.redirect(result.data.redirectUrl);
};

export const reActivateAccount = async (req: Request, res: Response) => {
  const { code } = req.query;

  const result = await authService.reActivateUser(code as string);

  if (result.error) {
    return res.redirect(result.data.redirectUrl);
  }
  return res.redirect(result.data.redirectUrl);
};

export const handleChangePassword = async (req: AuthRequest, res: Response) => {
  const id = req.user.id;
  const validated = changePasswordValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      error: true,
      message: validated.error.issues[0].message,
      errors: validated.error.flatten(),
    });
  }

  const result = await authService.changePassword(id, validated.data);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }
  return res.status(result.code).json({
    message: result.message,
    data: result.data,
  });
};

export const handleForgotPassword = async (req: Request, res: Response) => {
  const validated = forgotPasswordValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      error: true,
      message: validated.error.issues[0].message,
      errors: validated.error.flatten(),
    });
  }

  const result = await authService.forgotPassword(validated.data);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }
  return res.status(result.code).json({ message: result.message });
};

export const handleResetPassword = async (req: Request, res: Response) => {
  const validated = resetPasswordValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      error: true,
      message: validated.error.issues[0].message,
      errors: validated.error.flatten(),
    });
  }

  const result = await authService.resetPassword(validated.data);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }
  return res.status(result.code).json({ message: result.message });
};
