import { IServiceResponse } from "../interfaces/common.interface";

export const successResponse = <T = unknown>(
  message: string,
  code = 200,
  data?: T,
): IServiceResponse<T> => {
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
): IServiceResponse<T> => {
  return {
    error: true,
    code,
    message,
    data,
  };
};
