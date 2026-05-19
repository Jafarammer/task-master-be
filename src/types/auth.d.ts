export type RegisterField = {
  field: string;
  message: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export interface IProfileServiceResult {
  token?: string;
  error?: boolean;
  code?: number;
  message?: string;
  requireRelogin?: boolean;
  data?: unknown;
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

// new setup
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

export interface IAccessPayload {
  id: string;
  email: string;
}
