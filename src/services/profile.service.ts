import mongoose from "mongoose";
import User from "../models/user.model";
import crypto from "crypto";
import { renderVerifyMailHtml, sendMail } from "../utils/mail/reverifyMail";
import { IProfileServiceResult, IUpdateProfilePayload } from "../types/profile";
import { CLIENT_HOST, EMAIL_SMTP_USER, VERIFICATION_HOST } from "../utils/env";

export const getProfile = async (
  id: string,
): Promise<IProfileServiceResult> => {
  try {
    const normalizedId = String(id ?? "").trim();
    if (!normalizedId) {
      return { error: true, code: 400, message: "Id is required" };
    }

    if (!mongoose.isValidObjectId(normalizedId)) {
      return { error: true, code: 400, message: "Invalid id format" };
    }

    const userFindId = await User.findById(normalizedId)
      .select(
        "-password -_id -refreshToken -is_active -activationCode -createdAt -updatedAt",
      )
      .exec();

    if (!userFindId) {
      return { error: true, code: 404, message: "User not found" };
    }

    return {
      data: {
        fullName: userFindId.full_name,
        email: userFindId.email,
      },
    };
  } catch (error: any) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const updateProfile = async (
  id: string,
  payload: IUpdateProfilePayload,
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

    const user = await User.findById(normalizedId);

    if (!user) {
      return {
        error: true,
        code: 400,
        message: "User not found",
      };
    }

    const fullName = payload.fullName.trim();
    const email = payload.email.trim().toLowerCase();

    if (!fullName || !email) {
      return {
        error: true,
        code: 400,
        message: "Full name and email are required",
      };
    }

    const existingEmail = await User.findOne({
      email,
      _id: {
        $ne: user._id,
      },
    });

    if (existingEmail) {
      return {
        error: true,
        code: 409,
        message: "Email already registered",
      };
    }

    user.full_name = fullName;
    if (email !== user.email) {
      const emailChangeCode = crypto.randomBytes(32).toString("hex");
      const verificationLink = `${VERIFICATION_HOST}/api/auth/activate?code=${emailChangeCode}`;

      user.pending_mail = email;
      user.activationCode = emailChangeCode;
      user.is_active = false;

      const contentMail = await renderVerifyMailHtml("reverify-success.ejs", {
        full_name: user.full_name,
        current_email: user.email,
        new_email: email,
        verificationLink,
      });
      await sendMail({
        from: EMAIL_SMTP_USER,
        to: email,
        subject: "Verify Your New Email Address",
        html: contentMail,
      });
    }

    await user.save();

    return {
      message:
        email !== user.email
          ? "Verification email sent to your new email address"
          : "Update profile successfully",
    };
  } catch (error: any) {
    console.error("UPDATE PROFILE ERROR:", error);
    return {
      error: true,
      code: 500,
      message: "Internal server error",
    };
  }
};
