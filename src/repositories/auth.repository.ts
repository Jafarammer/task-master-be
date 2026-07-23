import User, { IUser } from "../models/user.model";
import { IRepositoryPayload } from "../interfaces/auth.interface";

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email });
};

export const cleatResetPasswordToken = async (
  userId: string,
): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $set: {
      reset_password_token: null,
      reset_password_expired: null,
    },
  });
};

export const createUser = async (
  payload: IRepositoryPayload,
): Promise<IUser> => {
  return User.create({
    full_name: payload.full_name,
    email: payload.email,
    password: payload.password,
    activationCode: payload.activationCode,
    is_active: payload.is_active,
  });
};
