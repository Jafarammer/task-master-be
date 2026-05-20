import { JwtPayload } from "jsonwebtoken";

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
