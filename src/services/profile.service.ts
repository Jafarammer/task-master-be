import User from "../models/user.model";
import crypto from "crypto";
import streamifier from "streamifier";
import cloudinary from "../utils/cloudinary";
import { IServiceResult } from "../interfaces/common.interface";
import { renderVerifyMailHtml, sendMail } from "../utils/mail/reverifyMail";
import { IUpdateProfilePayload } from "../interfaces/profile.interface";
import { EMAIL_SMTP_USER, VERIFICATION_HOST } from "../utils/env";
import { successResponse, errorResponse } from "../helpers/response.helper";
import validationId from "../helpers/validationId.helper";

export const getProfile = async (
  id: string,
): Promise<
  IServiceResult<{ fullName: string; email: string; profilePicture: string }>
> => {
  try {
    const validatedId = validationId(id);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const userFindId = await User.findById(validatedId.value)
      .select(
        "-password -_id -refreshToken -is_active -activationCode -createdAt -updatedAt",
      )
      .exec();

    if (!userFindId) {
      return errorResponse("User not found", 404);
    }

    return successResponse("Fetch profile successfully", 200, {
      fullName: userFindId.full_name,
      email: userFindId.email,
      profilePicture: userFindId.profile_picture,
    });
  } catch (error: any) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const updateProfile = async (
  id: string,
  payload: IUpdateProfilePayload,
): Promise<
  IServiceResult<{
    fullName: string;
    email: string;
    profilePicture: string;
    requireRelogin: boolean;
  }>
> => {
  try {
    const validatedId = validationId(id);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const user = await User.findById(validatedId.value);

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const existingEmail = await User.findOne({
      email: payload.email.trim(),
      _id: {
        $ne: user._id,
      },
    });

    if (existingEmail) {
      return errorResponse("Email already registered", 400);
    }

    const isEmailChanged = payload.email.trim() !== user.email;

    user.full_name = payload.fullName.trim();

    if (isEmailChanged) {
      const emailChangeCode = crypto.randomBytes(32).toString("hex");
      const verificationLink = `${VERIFICATION_HOST}/api/auth/reactivate?code=${emailChangeCode}`;

      user.pending_mail = payload.email.trim();
      user.activationCode = emailChangeCode;
      user.is_active = false;
      user.refreshToken = null;

      const contentMail = await renderVerifyMailHtml("reverify-success.ejs", {
        full_name: user.full_name,
        current_email: user.email,
        new_email: payload.email.trim(),
        verificationLink,
      });

      await sendMail({
        from: EMAIL_SMTP_USER,
        to: payload.email.trim(),
        subject: "Verify Your New Email Address",
        html: contentMail,
      });
    }

    await user.save();

    return successResponse(
      isEmailChanged
        ? "Verification email sent to your new email address"
        : "Update profile successfully",
      201,
      {
        fullName: user.full_name,
        email: user.email,
        profilePicture: user.profile_picture,
        requireRelogin: isEmailChanged,
      },
    );
  } catch (error: any) {
    console.error("UPDATE PROFILE ERROR:", error);
    return errorResponse("Internal server error", 500);
  }
};

export const updateProfilePicture = async (
  id: string,
  file?: Express.Multer.File,
): Promise<
  IServiceResult<{ fullName: string; email: string; profilePicture: string }>
> => {
  try {
    const validatedId = validationId(id);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    if (!file) {
      return errorResponse("Profile picture is required", 400);
    }

    const user = await User.findById(validatedId.value);
    if (!user) {
      return errorResponse("User not found", 404);
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

    return successResponse("Profile picture updated successfully", 201, {
      fullName: user.full_name,
      email: user.email,
      profilePicture: user.profile_picture,
    });
  } catch (error: any) {
    console.error("UPDATE PROFILE PICTURE ERROR:", error);
    return errorResponse("Internal server error", 500);
  }
};
