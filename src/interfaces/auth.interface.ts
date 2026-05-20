import { JwtPayload } from "jsonwebtoken";
import { IServiceResult } from "./common.interface";

export interface ILoginResponse extends IServiceResult {
  token: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IAccessPayload extends JwtPayload {
  id: string;
  email: string;
}

export interface IRegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IRedirectResponse extends IServiceResult {
  redirectUrl: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
