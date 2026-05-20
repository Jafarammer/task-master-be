export interface IServiceResult<T = unknown> {
  error: boolean;
  code: number;
  message: string;
  data?: T;
}
