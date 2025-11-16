import User, { IUser } from "../models/user.model";

export const getAllUser = async (): Promise<IUser[]> => {
  return await User.find().select("-password");
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id).select("-password");
};
