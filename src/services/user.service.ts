import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model";

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
