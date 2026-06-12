import User from "../src/models/user.model";
import bcrypt from "bcrypt";
import { createAccessToken } from "../src/utils/tokens";

export const createUserActive = async () => {
  return await User.create({
    full_name: "John Doe",
    email: "john@example.com",
    password: await bcrypt.hash("@Jhone123", 10),
    is_active: true,
  });
};

export const createUserInactive = async () => {
  return await User.create({
    full_name: "John Doe",
    email: "john@example.com",
    password: await bcrypt.hash("@Jhone123", 10),
    is_active: false,
  });
};

export const loginUser = async () => {
  const user = await createUserActive();
  const token = createAccessToken({
    id: user._id.toString(),
    email: user.email,
  });

  return {
    user,
    token,
  };
};
