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
      message: "Fetch profile successfully",
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
    // =========================
    // VALIDATE ID
    // =========================
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

    // =========================
    // FIND USER
    // =========================
    const user = await User.findById(normalizedId);

    if (!user) {
      return {
        error: true,
        code: 404,
        message: "User not found",
      };
    }

    // =========================
    // NORMALIZE PAYLOAD
    // =========================
    const fullName = payload.fullName.trim();

    const email = payload.email.trim().toLowerCase();

    if (!fullName || !email) {
      return {
        error: true,
        code: 400,
        message: "Full name and email are required",
      };
    }

    // =========================
    // CHECK EMAIL DUPLICATE
    // =========================
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

    // =========================
    // CHECK EMAIL CHANGED
    // =========================
    const isEmailChanged = email !== user.email;

    // =========================
    // UPDATE FULL NAME
    // =========================
    user.full_name = fullName;

    // =========================
    // EMAIL CHANGE FLOW
    // =========================
    if (isEmailChanged) {
      const emailChangeCode = crypto.randomBytes(32).toString("hex");

      const verificationLink = `${VERIFICATION_HOST}/api/auth/activate?code=${emailChangeCode}`;

      // save pending email
      user.pending_mail = email;

      // verification code
      user.activationCode = emailChangeCode;

      // require re-activation
      user.is_active = false;

      // invalidate refresh token
      user.refreshToken = null;

      // render mail template
      const contentMail = await renderVerifyMailHtml("reverify-success.ejs", {
        full_name: user.full_name,

        current_email: user.email,

        new_email: email,

        verificationLink,
      });

      // send email
      await sendMail({
        from: EMAIL_SMTP_USER,

        to: email,

        subject: "Verify Your New Email Address",

        html: contentMail,
      });
    }

    // =========================
    // SAVE USER
    // =========================
    await user.save();

    // =========================
    // RESPONSE
    // =========================
    return {
      message: isEmailChanged
        ? "Verification email sent to your new email address"
        : "Update profile successfully",

      requireRelogin: isEmailChanged,

      data: {
        fullName: user.full_name,

        email: isEmailChanged ? email : user.email,
      },
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
