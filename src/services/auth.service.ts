import crypto from "crypto";
import {
  ILoginPayload,
  IRegisterPayload,
  IChangePasswordPayload,
  IForgotPasswordPayload,
  IResetPasswordPayload,
  ITokenPair,
} from "../interfaces/auth.interface";
import { IServiceResponse } from "../interfaces/common.interface";
import {
  findUserByEmail,
  cleatResetPasswordToken,
  createUser,
  updateUserActivation,
  findUserByActivation,
  updateUserReactivation,
  findUserById,
  updateUserPassword,
  updateForgotPassword,
  updataResetPassword,
  findUserByToken,
} from "../repositories/auth.repository";
import {
  createRefreshTokenRepository,
  deleteAllUserRefreshTokensRepository,
  deleteRefreshTokenRepository,
  findRefreshTokenRepository,
} from "../repositories/refresh-token.repository";
import sendRegistrationEmail from "../mail/sendRegistrationEmail";
import sendForgotPasswordEmail from "../mail/sendForgotPasswordEmail";
import { CLIENT_HOST, VERIFICATION_HOST } from "../utils/env";
import {
  generateAccessToken,
  generateTokenId,
  hashToken,
  verifyRefreshToken,
  generateRefreshToken,
} from "../utils/token";
import validationId from "../helpers/validationId.helper";
import {
  comparePassword,
  hashPassword,
  normalizeEmail,
} from "../helpers/auth.helper";
import { successResponse, errorResponse } from "../helpers/response.helper";

const REFRESH_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const createTokenPairService = async (
  userId: string,
  email: string,
): Promise<ITokenPair> => {
  const tokenId = generateTokenId();
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId, tokenId);

  const tokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DURATION_MS);

  await createRefreshTokenRepository({ userId, tokenHash, expiresAt });

  return {
    accessToken,
    refreshToken,
  };
};

export const refreshAccessTokenService = async (
  oldRefreshToken: string,
): Promise<IServiceResponse<ITokenPair>> => {
  try {
    if (!oldRefreshToken) {
      return errorResponse("Refresh token is required", 401);
    }

    const payload = verifyRefreshToken(oldRefreshToken);

    if (!payload) {
      return errorResponse("Refresh token is invalid or expired", 401);
    }

    const tokenHash = hashToken(oldRefreshToken);
    const storedToken = await findRefreshTokenRepository(tokenHash);

    if (!storedToken) {
      return errorResponse("Refresh token not found or already used", 401);
    }

    const user = await findUserById(payload.id);

    if (!user) {
      await deleteRefreshTokenRepository(tokenHash);
      return errorResponse("User not found", 404);
    }

    if (!user.is_active) {
      await deleteRefreshTokenRepository(tokenHash);
      return errorResponse("Please activate your account via email", 403);
    }

    await deleteRefreshTokenRepository(tokenHash);

    const { accessToken, refreshToken } = await createTokenPairService(
      user._id.toString(),
      user.email,
    );

    return successResponse("Refresh token successfully", 200, {
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error("REFRESH TOKEN ERROR:", error);

    return errorResponse("Internal server error", 500);
  }
};

export const loginUser = async (
  payload: ILoginPayload,
): Promise<IServiceResponse<{ accessToken: string; refreshToken: string }>> => {
  try {
    const email = normalizeEmail(payload.email);

    const user = await findUserByEmail(email);

    if (!user) {
      return errorResponse("Email or password is invalid", 400);
    }
    if (!user.is_active) {
      return errorResponse("Please activate your account via email", 403);
    }

    const match = await comparePassword(payload.password, user.password);

    if (!match) {
      return errorResponse("Email or password is invalid", 400);
    }

    const { accessToken, refreshToken } = await createTokenPairService(
      user._id.toString(),
      user.email,
    );

    return successResponse(`Welcome ${user.full_name}`, 200, {
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return errorResponse("Internal server error", 500);
  }
};

export const registerUser = async (
  payload: IRegisterPayload,
): Promise<IServiceResponse> => {
  try {
    const email = normalizeEmail(payload.email);
    const existing = await findUserByEmail(email);
    if (existing) {
      return errorResponse("Email already registered", 409);
    }

    const hashedPassword = await hashPassword(payload.password);

    const activationCode = crypto.randomBytes(32).toString("hex");

    const activationLink = `${VERIFICATION_HOST}/api/auth/activate?code=${activationCode}`;

    await sendRegistrationEmail({
      fullName: payload.fullName,
      email: payload.email,
      activationLink: activationLink,
    });

    await createUser({
      full_name: payload.fullName,
      email: payload.email,
      password: hashedPassword,
      activationCode: activationCode,
      is_active: false,
    });

    return successResponse(
      "Registered successfully. Check your email to activate account.",
      201,
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return errorResponse("Internal server error", 500);
  }
};

export const activateUser = async (
  code: string,
): Promise<IServiceResponse<{ redirectUrl: string }>> => {
  const user = await findUserByActivation(code);

  if (!user) {
    return errorResponse("Invalid activation code", 400, {
      redirectUrl: `${CLIENT_HOST}/login?status=error&message=${encodeURIComponent("Invalid activation token")}`,
    });
  }

  await updateUserActivation(user._id.toString());

  return successResponse("Account activated successfully", 200, {
    redirectUrl: `${CLIENT_HOST}/login?status=success&message=${encodeURIComponent("Account activated successfully")}`,
  });
};

export const reActivateUser = async (
  code: string,
): Promise<IServiceResponse<{ redirectUrl: string }>> => {
  const user = await findUserByActivation(code);

  if (!user) {
    return errorResponse("Invalid activation code", 400, {
      redirectUrl: `${CLIENT_HOST}/login?status=error&message=${encodeURIComponent("Invalid activation account")}`,
    });
  }

  const pendingEmail = user.pending_mail;

  if (!pendingEmail) {
    return errorResponse("No email change request found", 400, {
      redirectUrl: `${CLIENT_HOST}/login?status=error&message=${encodeURIComponent(
        "No email change request found",
      )}`,
    });
  }

  await updateUserReactivation(user._id.toString(), pendingEmail);

  return successResponse("Account activated successfully", 200, {
    redirectUrl: `${CLIENT_HOST}/login?status=success&message=${encodeURIComponent("Account activated successfully")}`,
  });
};

export const changePassword = async (
  id: string,
  payload: IChangePasswordPayload,
): Promise<IServiceResponse<{ requireRelogin: boolean }>> => {
  try {
    const validatedId = validationId(id);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const user = await findUserById(validatedId.value);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const isMatch = await comparePassword(
      payload.currentPassword,
      user.password,
    );
    if (!isMatch) {
      return errorResponse("Current password is incorrect", 400);
    }

    const isSamePassword = await comparePassword(
      payload.newPassword,
      user.password,
    );
    if (isSamePassword) {
      return errorResponse(
        "New password cannot be the same as current password",
        400,
      );
    }

    const hashedPassword = await hashPassword(payload.newPassword);
    await updateUserPassword(validatedId.value, hashedPassword);

    return successResponse("Password changed successfully", 201, {
      requireRelogin: true,
    });
  } catch (error: any) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return errorResponse("Internal server error", 500);
  }
};

export const forgotPassword = async (
  payload: IForgotPasswordPayload,
): Promise<IServiceResponse> => {
  try {
    const email = normalizeEmail(payload.email);

    const user = await findUserByEmail(email);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await updateForgotPassword(user._id.toString(), resetToken);

    const resetLink = `${CLIENT_HOST}/reset-password?token=${resetToken}`;

    await sendForgotPasswordEmail({
      fullName: user.full_name,
      email: user.email,
      resetLink: resetLink,
    });

    return successResponse("Reset password email sent", 201);
  } catch (error: any) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return errorResponse("Internal server error", 500);
  }
};

export const resetPassword = async (
  payload: IResetPasswordPayload,
): Promise<IServiceResponse> => {
  try {
    const newPassword = payload.newPassword.trim();

    const user = await findUserByToken(payload.token.trim());

    if (!user) {
      return errorResponse("Invalid reset token", 400);
    }

    if (
      !user.reset_password_expired ||
      user.reset_password_expired < new Date()
    ) {
      await cleatResetPasswordToken(user._id.toString());
      return errorResponse("Reset password expired", 400);
    }

    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return errorResponse(
        "New password cannot be the same as current password",
        400,
      );
    }
    const hashedPassword = await hashPassword(newPassword);

    await updataResetPassword(user._id.toString(), hashedPassword);

    return successResponse("Password reset successfully", 201);
  } catch (error: any) {
    console.error("RESET PASSWORD ERROR:", error);

    return errorResponse("Internal server error", 500);
  }
};
