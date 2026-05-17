import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";
import User, { IUser } from "../models/user.model";
import { IProfileServiceResult, IChangePasswordPayload } from "../types/auth";
import { createAccessToken, AccessPayload } from "../utils/tokens";
import { RegisterPayload } from "../types/auth";
import { validateRegister } from "../helpers/auth.helper";
import { sendMail, renderMailHtml } from "../utils/mail/mail";
import { CLIENT_HOST, EMAIL_SMTP_USER, VERIFICATION_HOST } from "../utils/env";

export const registerUser = async (
  payload: RegisterPayload,
): Promise<IProfileServiceResult> => {
  try {
    const existing = await User.findOne({ email: payload.email });
    if (existing) {
      return { error: true, code: 409, message: "Email already registered" };
    }

    const resultValidation = validateRegister(payload);
    if (!resultValidation.valid) {
      return { error: true, code: 400, message: resultValidation.message };
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

export const loginUser = async (
  email: string,
  password: string,
): Promise<IProfileServiceResult> => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return { error: true, code: 400, message: "Invalid email" };
    }
    if (!user.is_active) {
      return {
        error: true,
        code: 403,
        message: "Please activate your account via email",
      };
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return { error: true, code: 400, message: "Invalid password" };
    }

    const payload: AccessPayload = {
      id: user._id.toString(),
      email: user.email,
    };

    const accessToken = createAccessToken(payload);

    return {
      token: accessToken,
      data: user,
      message: `Welcome back ${user.full_name}`,
    };
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const activateUser = async (
  code: string,
): Promise<IProfileServiceResult> => {
  const user = await User.findOne({ activationCode: code });

  if (!user) {
    return { error: true, code: 400, message: "Invalid activation code" };
  }

  user.is_active = true;
  user.activationCode = null;
  await user.save();

  return { message: "Account activated successfully" };
};

export const reActivateUser = async (
  code: string,
): Promise<IProfileServiceResult> => {
  const user = await User.findOne({ activationCode: code });

  if (!user) {
    return { error: true, code: 400, message: "Invalid activation code" };
  }
  user.is_active = true;
  user.email = user.pending_mail;
  user.pending_mail = null;
  user.activationCode = null;
  await user.save();

  return { message: "Account activated successfully" };
};

export const changePassword = async (
  id: string,
  payload: IChangePasswordPayload,
): Promise<IProfileServiceResult> => {
  try {
    const normalizedId = String(id ?? "").trim();
    if (!normalizedId) {
      return {
        error: true,
        code: 400,
        message: "Id is required",
      };
    }
    if (!mongoose.isValidObjectId(normalizedId)) {
      return {
        error: true,
        code: 400,
        message: "Invalid id format",
      };
    }

    const currentPassword = payload?.currentPassword?.trim();
    const newPassword = payload?.newPassword?.trim();
    const confirmPassword = payload?.confirmPassword?.trim();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        error: true,
        code: 400,
        message: "All fileds are required",
      };
    }
    if (newPassword !== confirmPassword) {
      return {
        error: true,
        code: 400,
        message: "Confirm password does not match",
      };
    }

    const user = await User.findById(normalizedId);
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
      code: 201,
      message: "Password changed successfully",
      requireRelogin: true,
      data: {
        fullName: user.full_name,
        email: user.email,
        profilePicture: user.profile_picture,
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
