import bcrypt from "bcrypt";
import User, { IUser } from "../models/user.model";
import { createAccessToken, AccessPayload } from "../utils/tokens";

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<IUser> => {
  const existing = await User.findOne({ email: email });
  if (existing) throw new Error("Email already registered");

  const hashedPassord = await bcrypt.hash(password, 10);
  const user = new User({
    first_name: firstName,
    last_name: lastName,
    email: email,
    password: hashedPassord,
  });

  await user.save();

  return user;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ accessToken: string; user: IUser }> => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("Invalid email");

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw new Error("Invalid password");

  const payload: AccessPayload = {
    id: user._id.toString(),
    email: user.email,
  };

  const accessToken = createAccessToken(payload);

  return { accessToken, user };
};
