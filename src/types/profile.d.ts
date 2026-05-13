export interface IProfileServiceResult {
  error?: boolean;
  code?: number;
  message?: string;
  data?: unknown;
}

export interface IUpdateProfilePayload {
  fullName: string;
  email: string;
}
