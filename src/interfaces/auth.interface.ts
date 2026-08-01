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

export interface IRepositoryPayload {
  full_name: string;
  email: string;
  password: string;
  activationCode: string;
  is_active: boolean;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  id: string;
  email: string;
  type: "access";
  jti: string;
}

export interface RefreshTokenPayload {
  id: string;
  tokenId: string;
  type: "refresh";
}

export interface CreateRefreshTokenParams {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}
