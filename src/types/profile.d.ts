interface IProfileResponse {
  fullName: string;
  email: string;
}

export interface IProfileServiceResult {
  error?: boolean;
  code?: number;
  message?: string;
  data?: IProfileResponse;
}
