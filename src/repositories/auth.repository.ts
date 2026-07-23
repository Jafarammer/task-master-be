import User, { IUser } from "../models/user.model";

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
