import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.model";
import {
  ILoginPayload,
  IRegisterPayload,
  ILoginResponse,
  IRedirectResponse,
  IChangePasswordPayload,
  IForgotPasswordPayload,
  IResetPasswordPayload,
} from "../interfaces/auth.interface";
import { IServiceResult } from "../interfaces/common.interface";
import { createAccessToken } from "../utils/tokens";
import { sendMail, renderMailHtml } from "../utils/mail/mail";
import {
  sendMailForgotPassword,
  renderForgotPasswordMailHtml,
} from "../utils/mail/forgotPasswordMail";
import { CLIENT_HOST, EMAIL_SMTP_USER, VERIFICATION_HOST } from "../utils/env";
import validationId from "../helpers/validationId.helper";

export const loginUser = async (
  payload: ILoginPayload,
): Promise<ILoginResponse> => {
  try {
    const email = payload.email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return {
        error: true,
        code: 400,
        token: null,
        message: "Email or password is invalid",
      };
    }
    if (!user.is_active) {
      return {
        error: true,
        code: 403,
        token: null,
        message: "Please activate your account via email",
      };
    }

    const match = await bcrypt.compare(payload.password, user.password);

    if (!match) {
      return {
        error: true,
        token: null,
        code: 400,
        message: "Email or password is invalid",
      };
    }

    const accessToken = createAccessToken({
      id: user._id.toString(),
      email: user.email,
    });
    user.reset_password_token = null;
    user.reset_password_expired = null;
    user.save();

    return {
      error: false,
      code: 201,
      token: accessToken,
      message: `Welcome ${user.full_name}`,
    };
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return {
      error: true,
      code: 500,
      token: null,
      message: "Internal server error",
    };
  }
};

export const registerUser = async (
  payload: IRegisterPayload,
): Promise<IServiceResult> => {
  try {
    const existing = await User.findOne({ email: payload.email });
    if (existing) {
      return { error: true, code: 409, message: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const activationCode = crypto.randomBytes(32).toString("hex");

    const activationLink = `${VERIFICATION_HOST}/api/auth/activate?code=${activationCode}`;

    const contentMail = await renderMailHtml("registration-success.ejs", {
      full_name: payload.fullName,
      email: payload.email,
      createdAt: new Date(),
      activationLink: activationLink,
    });

    await sendMail({
      from: EMAIL_SMTP_USER,
      to: payload.email,
      subject: "Aktifkan Akun Anda",
      html: contentMail,
    });

    const user = new User({
      full_name: payload.fullName,
      email: payload.email,
      password: hashedPassword,
      activationCode: activationCode,
      is_active: false,
    });

    await user.save();

    return {
      error: false,
      code: 201,
      message: "Registered successfully. Check your email to activate account.",
    };
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return {
      error: true,
      code: 500,
      message: "Internal server error",
    };
  }
};

export const activateUser = async (
  code: string,
): Promise<IRedirectResponse> => {
  const user = await User.findOne({ activationCode: code });

  if (!user) {
    return {
      error: true,
      code: 400,
      redirectUrl: `${CLIENT_HOST}/login?status=error&message=${encodeURIComponent("Invalid activation token")}`,
      message: "Invalid activation code",
    };
  }

  user.is_active = true;
  user.activationCode = null;
  await user.save();

  return {
    error: false,
    code: 200,
    redirectUrl: `${CLIENT_HOST}/login?status=success&message=${encodeURIComponent("Account activated successfully")}`,
    message: "Account activated successfully",
  };
};

export const reActivateUser = async (
  code: string,
): Promise<IRedirectResponse> => {
  const user = await User.findOne({ activationCode: code });

  if (!user) {
    return {
      error: true,
      code: 400,
      redirectUrl: `${CLIENT_HOST}/login?status=error&message=${encodeURIComponent("Invalid activation account")}`,
      message: "Invalid activation code",
    };
  }
  user.is_active = true;
  user.email = user.pending_mail;
  user.pending_mail = null;
  user.activationCode = null;
  await user.save();

  return {
    error: false,
    code: 200,
    redirectUrl: `${CLIENT_HOST}/login?status=success&message=${encodeURIComponent("Account activated successfully")}`,
    message: "Account activated successfully",
  };
};

export const changePassword = async (
  id: string,
  payload: IChangePasswordPayload,
): Promise<IServiceResult> => {
  try {
    const validatedId = validationId(id);
    if (!validatedId.valid) {
      return {
        error: true,
        code: 400,
        message: validatedId.message,
      };
    }

    const currentPassword = payload?.currentPassword?.trim();
    const newPassword = payload?.newPassword?.trim();

    const user = await User.findById(validatedId.value);
    if (!user) {
      return {
        error: true,
        code: 404,
        message: "User not found",
      };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return {
        error: true,
        code: 400,
        message: "Current password is incorrect",
      };
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return {
        error: true,
        code: 400,
        message: "New password cannot be the same as current password",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.refreshToken = null;
    await user.save();

    return {
      error: false,
      code: 201,
      message: "Password changed successfully",
      data: {
        requireRelogin: true,
      },
    };
  } catch (error: any) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return {
      error: true,
      code: 500,
      message: "Internal server error",
    };
  }
};

export const forgotPassword = async (
  payload: IForgotPasswordPayload,
): Promise<IServiceResult> => {
  try {
    const email = payload.email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return {
        error: true,
        code: 404,
        message: "User not found",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.reset_password_token = resetToken;
    user.reset_password_expired = new Date(Date.now() + 1000 * 60 * 5);

    await user.save();

    const resetLink = `${CLIENT_HOST}/reset-password?token=${resetToken}`;
    const contentMail = await renderForgotPasswordMailHtml(
      "forgot-password-success.ejs",
      { full_name: user.full_name, resetLink },
    );
    await sendMailForgotPassword({
      from: EMAIL_SMTP_USER,
      to: user.email,
      subject: "Reset Your Password",
      html: contentMail,
    });

    return {
      error: false,
      code: 200,
      message: "Reset password email sent",
    };
  } catch (error: any) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return {
      error: true,
      code: 500,
      message: "Internal server error",
    };
  }
};

export const resetPassword = async (
  payload: IResetPasswordPayload,
): Promise<IServiceResult> => {
  try {
    const token = payload.token.trim();
    const newPassword = payload.newPassword.trim();

    const user = await User.findOne({ reset_password_token: token });
    if (!user) {
      return {
        error: true,
        code: 400,
        message: "Invalid reset token",
      };
    }

    if (
      !user.reset_password_expired ||
      user.reset_password_expired < new Date()
    ) {
      user.reset_password_token = null;
      user.reset_password_expired = null;
      await user.save();
      return {
        error: true,
        code: 400,
        message: "Reset token expired",
      };
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return {
        error: true,
        code: 400,
        message: "New password cannot be the same as current password",
      };
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.reset_password_token = null;
    user.reset_password_expired = null;
    user.refreshToken = null;

    await user.save();

    return {
      error: false,
      code: 201,
      message: "Password reset successfully",
    };
  } catch (error: any) {
    console.error("RESET PASSWORD ERROR:", error);

    return {
      error: true,
      code: 500,
      message: "Internal server error",
    };
  }
};
