import User, { IUser } from "../models/user.model";
import {
  IProfileRepositoryResult,
  IUpdateProfileResult,
} from "../interfaces/profile.interface";

export const findUserProfileById = async (
  id: string,
): Promise<IProfileRepositoryResult | null> => {
  return User.findById(id)
    .select("full_name email profile_picture -_id")
    .lean<IProfileRepositoryResult>()
    .exec();
};

export const findUserProfileForUpdate = async (
  id: string,
): Promise<IProfileRepositoryResult | null> => {
  const user = await User.findById(id)
    .select(
      "_id full_name email profile_picture pending_mail activationCode is_active refreshToken",
    )
    .lean()
    .exec();

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    full_name: user.full_name,
    email: user.email,
    profile_picture: user.profile_picture ?? null,
  };
};

export const findUserByEmailExceptId = async (
  email: string,
  userId: string,
): Promise<boolean> => {
  const user = await User.exists({
    email,
    _id: {
      $ne: userId,
    },
  });

  return Boolean(user);
};

export const updateUserProfileById = async (
  id: string,
  payload: IUpdateProfileResult,
): Promise<IProfileRepositoryResult | null> => {
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      $set: payload,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .select("_id full_name email profile_picture")
    .lean()
    .exec();

  if (!updatedUser) {
    return null;
  }

  return {
    id: updatedUser._id.toString(),
    full_name: updatedUser.full_name,
    email: updatedUser.email,
    profile_picture: updatedUser.profile_picture ?? null,
  };
};

export const updateProfilePictureById = async (
  id: string,
  profilePicture: string,
): Promise<IUser | null> => {
  return User.findByIdAndUpdate(
    id,
    {
      $set: {
        profile_picture: profilePicture,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );
};
