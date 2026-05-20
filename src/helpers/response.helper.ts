import { IServiceResult } from "../interfaces/common.interface";

export const successResponse = <T = unknown>(
  message: string,
  data?: T,
  code = 200,
): IServiceResult<T> => {
  return {
    error: false,
    code,
    message,
    data,
  };
};

export const errorResponse = (message: string, code = 400): IServiceResult => {
  return {
    error: true,
    message,
    code,
  };
};
