import mongoose from "mongoose";
import User from "../models/user.model";
import crypto from "crypto";
import streamifier from "streamifier";
import cloudinary from "../utils/cloudinary";
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
      requireRelogin: false,
      code: 200,
      data: {
        fullName: userFindId.full_name,
        email: userFindId.email,
        profilePicture: userFindId.profile_picture,
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
        code: 404,
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

    const isEmailChanged = email !== user.email;

    user.full_name = fullName;

    if (isEmailChanged) {
      const emailChangeCode = crypto.randomBytes(32).toString("hex");

      const verificationLink = `${VERIFICATION_HOST}/api/auth/reactivate?code=${emailChangeCode}`;

      user.pending_mail = email;

      user.activationCode = emailChangeCode;

      user.is_active = false;

      user.refreshToken = null;

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
      message: isEmailChanged
        ? "Verification email sent to your new email address"
        : "Update profile successfully",
      requireRelogin: isEmailChanged,
      code: 201,
      data: {
        fullName: user.full_name,
        email: isEmailChanged ? email : user.email,
        profilePicture: user.profile_picture,
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

export const updateProfilePicture = async (
  id: string,
  file?: Express.Multer.File,
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
    if (!file) {
      return {
        error: true,
        code: 400,
        message: "Profile picture is required",
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

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "task-master/profile",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });

    user.profile_picture = uploadResult.secure_url;

    await user.save();

    return {
      message: "Profile picture updated successfully",
      code: 201,
      requireRelogin: false,
      data: {
        fullName: user.full_name,
        email: user.email,
        profilePicture: user.profile_picture,
      },
    };
  } catch (error: any) {
    console.error("UPDATE PROFILE PICTURE ERROR:", error);
    return {
      error: true,
      code: 500,
      message: "Internal server error",
    };
  }
};
