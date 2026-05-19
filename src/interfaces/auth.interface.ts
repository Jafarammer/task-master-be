import { JwtPayload } from "jsonwebtoken";

export interface IAuthResultService {
  token?: string;
  error?: boolean;
  code?: number;
  message?: string;
  data?: unknown;
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
