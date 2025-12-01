import bcrypt from "bcrypt";
import User, { IUser } from "../models/user.model";
import { createAccessToken, AccessPayload } from "../utils/tokens";
import { RegisterPayload } from "../types/auth";
import { validateRegister } from "../helpers/auth.helper";

interface IServiceResult {
  token?: string;
  error?: boolean;
  code?: number;
  message?: string;
  data?: IUser | IUser[] | null;
}

export const registerUser = async (
  payload: RegisterPayload
): Promise<IServiceResult> => {
  try {
    const existing = await User.findOne({ email: payload.email });
    if (existing) {
      return { error: true, code: 409, message: "Email already registered" };
    }

    const resultValidation = validateRegister(payload);
    if (!resultValidation.valid) {
      return { error: true, code: 400, message: resultValidation.message };
    }

    const hashedPassord = await bcrypt.hash(payload.password, 10);
    const user = new User({
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      password: hashedPassord,
    });

    await user.save();

    return { message: "Registered successfully" };
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<IServiceResult> => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return { error: true, code: 400, message: "Invalid email" };
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return { error: true, code: 400, message: "Invalid password" };
    }

    const payload: AccessPayload = {
      id: user._id.toString(),
      email: user.email,
    };

    const accessToken = createAccessToken(payload);

    return {
      token: accessToken,
      data: user,
      message: `Welcome back ${user.first_name + " " + user.last_name}`,
    };
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};
