import { IServiceResult } from "../interfaces/common.interface";

export const successResponse = <T = unknown>(
  message: string,
  code = 200,
  data?: T,
): IServiceResult<T> => {
  return {
    error: false,
    code,
    message,
    data,
  };
};

export const errorResponse = <T = unknown>(
  message: string,
  code = 400,
  data?: T,
): IServiceResult<T> => {
  return {
    error: true,
    code,
    message,
    data,
  };
};
