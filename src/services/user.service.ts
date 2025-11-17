import mongoose from "mongoose";
import User, { IUser } from "../models/user.model";

interface IServiceResult {
  error?: boolean;
  code?: number;
  message?: string;
  data?: IUser | IUser[] | null;
}

export const getAllUser = async (): Promise<IServiceResult> => {
  try {
    const userFindAll = await User.find().select("-password").exec();
    return { data: userFindAll };
  } catch (error: any) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const getUserById = async (id: string): Promise<IServiceResult> => {
  try {
    const normalizedId = String(id ?? "").trim();
    if (!normalizedId) {
      return { error: true, code: 400, message: "Id is required" };
    }

    if (!mongoose.isValidObjectId(normalizedId)) {
      return { error: true, code: 400, message: "Invalid id format" };
    }

    const userFindId = await User.findById(normalizedId)
      .select("-password")
      .exec();
    if (!userFindId) {
      return { error: true, code: 404, message: "User not found" };
    }

    return { data: userFindId };
  } catch (error: any) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};
