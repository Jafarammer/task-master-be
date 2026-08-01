import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  REFRESH_TOKEN_COOKIE_NAME,
  refreshTokenCookieOptions,
  clearRefreshTokenCookieOptions,
} from "../app/cookie";
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validations/auth.validate";
import * as authService from "../services/auth.service";

export const handleRefreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  const result = await authService.refreshAccessTokenService(refreshToken);

  if (result.error) {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearRefreshTokenCookieOptions);

    return res.status(result.code).json({
      message: result.message,
    });
  }

  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    result.data!.refreshToken,
    refreshTokenCookieOptions,
  );

  return res.status(result.code).json({
    message: result.message,
    accessToken: result.data!.accessToken,
  });
};

export const handleLogin = async (req: Request, res: Response) => {
  const validated = loginValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      message: validated.error.issues[0].message,
      // errors: validated.error.flatten(),
    });
  }
  const result = await authService.loginUser(validated.data);

  if (result.error || !result.data) {
    return res.status(result.code).json({ message: result.message });
  }

  const { accessToken, refreshToken } = result.data;

  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    refreshTokenCookieOptions,
  );

  return res.status(result.code).json({
    message: result.message,
    accessToken,
  });
};

export const handleRegister = async (req: Request, res: Response) => {
  const validated = registerValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      message: validated.error.issues[0].message,
      // errors: validated.error.flatten(),
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
    return res.redirect(result.data!.redirectUrl);
  }
  return res.redirect(result.data!.redirectUrl);
};

export const reActivateAccount = async (req: Request, res: Response) => {
  const { code } = req.query;

  const result = await authService.reActivateUser(code as string);

  if (result.error) {
    return res.redirect(result.data!.redirectUrl);
  }
  return res.redirect(result.data!.redirectUrl);
};

export const handleChangePassword = async (req: AuthRequest, res: Response) => {
  const id = req.user!.id;
  const validated = changePasswordValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      message: validated.error.issues[0].message,
      // errors: validated.error.flatten(),
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
      message: validated.error.issues[0].message,
      // errors: validated.error.flatten(),
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
      message: validated.error.issues[0].message,
      // errors: validated.error.flatten(),
    });
  }

  const result = await authService.resetPassword(validated.data);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }
  return res.status(result.code).json({ message: result.message });
};

export const handleLogout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  const result = await authService.logOutUser(refreshToken);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearRefreshTokenCookieOptions);

  return res.status(result.code).json({ message: result.message });
};
