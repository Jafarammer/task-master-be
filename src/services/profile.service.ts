import mongoose from "mongoose";
import User from "../models/user.model";
import { IProfileServiceResult } from "../types/profile";

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
