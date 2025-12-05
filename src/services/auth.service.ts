import bcrypt from "bcrypt";
import crypto from "crypto";
import User, { IUser } from "../models/user.model";
import { createAccessToken, AccessPayload } from "../utils/tokens";
import { RegisterPayload } from "../types/auth";
import { validateRegister } from "../helpers/auth.helper";
import { sendMail, renderMailHtml } from "../utils/mail/mail";
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";

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

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const activationCode = crypto.randomBytes(32).toString("hex");

    const user = new User({
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      password: hashedPassword,
      activationCode: activationCode,
      is_active: false,
    });

    await user.save();

    // const activationLink = `${CLIENT_HOST}/api/auth/activate?code=${activationCode}`; //ini untuk jika fe sudah ada tempalte activate
    const activationLink = `http://localhost:8000/api/auth/activate?code=${activationCode}`;

    const contentMail = await renderMailHtml("registration-success.ejs", {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      createdAt: user.createdAt,
      activationLink: activationLink,
    });

    await sendMail({
      from: EMAIL_SMTP_USER,
      to: payload.email,
      subject: "Aktifkan Akun Anda",
      html: contentMail,
    });

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
    if (!user.is_active) {
      return {
        error: true,
        code: 403,
        message: "Please activate your account via email",
      };
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

export const activateUser = async (code: string): Promise<IServiceResult> => {
  const user = await User.findOne({ activationCode: code });

  if (!user) {
    return { error: true, code: 400, message: "Invalid activation code" };
  }

  user.is_active = true;
  user.activationCode = "";
  await user.save();

  return { message: "Account activated successfully" };
};
