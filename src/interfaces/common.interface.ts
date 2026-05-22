export interface IServiceResult<T = unknown> {
  error: boolean;
  code: number;
  message: string;
  data?: T;
}

export interface IServiceParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  query?: string;
}
