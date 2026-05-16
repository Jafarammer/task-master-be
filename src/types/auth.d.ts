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
  data?: unknown;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
