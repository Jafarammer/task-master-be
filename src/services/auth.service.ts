import crypto from "crypto";
import User from "../models/user.model";
import {
  ILoginPayload,
  IRegisterPayload,
  IChangePasswordPayload,
  IForgotPasswordPayload,
  IResetPasswordPayload,
} from "../interfaces/auth.interface";
import { IServiceResponse } from "../interfaces/common.interface";
import { createAccessToken } from "../utils/tokens";
import sendRegistrationEmail from "../mail/sendRegistrationEmail";
import sendForgotPasswordEmail from "../mail/sendForgotPasswordEmail";
import { CLIENT_HOST, VERIFICATION_HOST } from "../utils/env";
import validationId from "../helpers/validationId.helper";
import {
  comparePassword,
  hashPassword,
  normalizeEmail,
} from "../helpers/auth.helper";
import { successResponse, errorResponse } from "../helpers/response.helper";

export const loginUser = async (
  payload: ILoginPayload,
): Promise<IServiceResponse<{ token: string }>> => {
  try {
    const email = normalizeEmail(payload.email);

    const user = await User.findOne({ email });

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

    const accessToken = createAccessToken({
      id: user._id.toString(),
      email: user.email,
    });
    user.reset_password_token = null;
    user.reset_password_expired = null;
    user.save();

    return successResponse(`Welcome ${user.full_name}`, 200, {
      token: accessToken,
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
    const existing = await User.findOne({ email: email });
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

    const user = new User({
      full_name: payload.fullName,
      email: payload.email,
      password: hashedPassword,
      activationCode: activationCode,
      is_active: false,
    });

    await user.save();

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
  const user = await User.findOne({ activationCode: code });

  if (!user) {
    return errorResponse("Invalid activation code", 400, {
      redirectUrl: `${CLIENT_HOST}/login?status=error&message=${encodeURIComponent("Invalid activation token")}`,
    });
  }

  user.is_active = true;
  user.activationCode = null;
  await user.save();

  return successResponse("Account activated successfully", 200, {
    redirectUrl: `${CLIENT_HOST}/login?status=success&message=${encodeURIComponent("Account activated successfully")}`,
  });
};

export const reActivateUser = async (
  code: string,
): Promise<IServiceResponse<{ redirectUrl: string }>> => {
  const user = await User.findOne({ activationCode: code });

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

  user.is_active = true;
  user.email = pendingEmail;
  user.pending_mail = null;
  user.activationCode = null;
  await user.save();

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

    const user = await User.findById(validatedId.value);
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
    user.password = hashedPassword;
    user.refreshToken = null;
    await user.save();

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

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.reset_password_token = resetToken;
    user.reset_password_expired = new Date(Date.now() + 1000 * 60 * 5);

    await user.save();

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

    const user = await User.findOne({
      reset_password_token: payload.token.trim(),
    });
    if (!user) {
      return errorResponse("Invalid reset token", 400);
    }

    if (
      !user.reset_password_expired ||
      user.reset_password_expired < new Date()
    ) {
      user.reset_password_token = null;
      user.reset_password_expired = null;
      await user.save();
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
    user.password = hashedPassword;
    user.reset_password_token = null;
    user.reset_password_expired = null;
    user.refreshToken = null;

    await user.save();

    return successResponse("Password reset successfully", 201);
  } catch (error: any) {
    console.error("RESET PASSWORD ERROR:", error);

    return errorResponse("Internal server error", 500);
  }
};
