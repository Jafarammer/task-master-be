import crypto from "crypto";
import { IServiceResponse } from "../interfaces/common.interface";
import sendReverifyEmail from "../mail/sendReverifyEmail";
import {
  IUpdateProfilePayload,
  IResultDataProfile,
  IUpdateProfileResult,
} from "../interfaces/profile.interface";
import {
  findUserProfileById,
  findUserProfileForUpdate,
  findUserByEmailExceptId,
  updateUserProfileById,
  updateProfilePictureById,
} from "../repositories/profile.repository";
import { findUserById } from "../repositories/auth.repository";
import { uploadImageToCloudinary } from "../utils/uploadImage";
import { VERIFICATION_HOST } from "../utils/env";
import { successResponse, errorResponse } from "../helpers/response.helper";
import validationId from "../helpers/validationId.helper";
import { normalizeEmail } from "../helpers/auth.helper";

export const getProfile = async (
  id: string,
): Promise<IServiceResponse<IResultDataProfile>> => {
  try {
    const validatedId = validationId(id);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const userProfile = await findUserProfileById(validatedId.value);

    if (!userProfile) {
      return errorResponse("User not found", 404);
    }

    return successResponse("Fetch profile successfully", 200, {
      fullName: userProfile.full_name,
      email: userProfile.email,
      profilePicture: userProfile.profile_picture ?? null,
    });
  } catch (error: any) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const updateProfile = async (
  id: string,
  payload: IUpdateProfilePayload,
): Promise<IServiceResponse<IResultDataProfile>> => {
  try {
    const validatedId = validationId(id);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const user = await findUserProfileForUpdate(validatedId.value);

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const fullName = payload.fullName.trim();
    const email = normalizeEmail(payload.email);

    const existingEmail = await findUserByEmailExceptId(email, user.id);

    if (existingEmail) {
      return errorResponse("Email already registered", 400);
    }

    const isEmailChanged = email !== user.email;

    const updatePayload: IUpdateProfileResult = {
      full_name: fullName,
    };

    if (isEmailChanged) {
      const emailChangeCode = crypto.randomBytes(32).toString("hex");
      const verificationLink = `${VERIFICATION_HOST}/api/auth/reactivate?code=${emailChangeCode}`;

      updatePayload.pending_mail = email;
      updatePayload.activationCode = emailChangeCode;
      updatePayload.is_active = false;
      updatePayload.refreshToken = null;

      await sendReverifyEmail({
        fullName: fullName,
        currentEmail: user.email,
        newEmail: email,
        verificationLink: verificationLink,
      });
    }

    const updatedUser = await updateUserProfileById(user.id, updatePayload);

    if (!updatedUser) {
      return errorResponse("User not found", 404);
    }

    return successResponse(
      isEmailChanged
        ? "Verification email sent to your new email address"
        : "Update profile successfully",
      200,
      {
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        profilePicture: updatedUser.profile_picture ?? null,
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
): Promise<IServiceResponse<IResultDataProfile>> => {
  try {
    const validatedId = validationId(id);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    if (!file) {
      return errorResponse("Profile picture is required", 400);
    }

    const user = await findUserById(validatedId.value);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const uploadResult = await uploadImageToCloudinary(file);

    const updatedUser = await updateProfilePictureById(
      validatedId.value,
      uploadResult.secure_url,
    );

    if (!updatedUser) {
      return errorResponse("User not found", 404);
    }

    return successResponse("Profile picture updated successfully", 201, {
      fullName: updatedUser.full_name,
      email: updatedUser.email,
      profilePicture: updatedUser.profile_picture ?? null,
    });
  } catch (error: any) {
    console.error("UPDATE PROFILE PICTURE ERROR:", error);
    return errorResponse("Internal server error", 500);
  }
};
