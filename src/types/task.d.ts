export interface ITaskServiceResult {
  error?: boolean;
  code?: number;
  message?: string;
  data?: unknown;
  pagination?: object;
}
