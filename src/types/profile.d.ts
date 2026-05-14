export interface IProfileServiceResult {
  error?: boolean;
  code?: number;
  message?: string;
  requireRelogin?: boolean;
  data?: unknown;
}

export interface IUpdateProfilePayload {
  fullName: string;
  email: string;
}
