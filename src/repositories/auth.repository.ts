import User, { IUser } from "../models/user.model";
import { IRepositoryPayload } from "../interfaces/auth.interface";

export const findUserById = async (id: string): Promise<IUser | null> => {
  return User.findOne({ _id: id });
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email });
};

export const findUserByActivation = async (
  activationCode: string,
): Promise<IUser | null> => {
  return User.findOne({ activationCode });
};

export const findUserByToken = async (token: string): Promise<IUser | null> => {
  return User.findOne({ reset_password_token: token });
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

export const updateUserActivation = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $set: {
      is_active: true,
      activationCode: null,
    },
  });
};

export const updateUserReactivation = async (
  userId: string,
  pendingMail: string,
): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    is_active: true,
    email: pendingMail,
    pending_mail: null,
    activationCode: null,
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

export const updateUserPassword = async (
  id: string,
  hashedPassword: string,
): Promise<void> => {
  await User.findByIdAndUpdate(id, {
    $set: {
      password: hashedPassword,
      refreshToken: null,
    },
  });
};

export const updateForgotPassword = async (
  userId: string,
  token: string,
): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $set: {
      reset_password_token: token,
      reset_password_expired: new Date(Date.now() + 1000 * 60 * 5),
    },
  });
};

export const updataResetPassword = async (
  id: string,
  hashedPassword: string,
): Promise<void> => {
  await User.findByIdAndUpdate(id, {
    $set: {
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expired: null,
      refreshToken: null,
    },
  });
};
