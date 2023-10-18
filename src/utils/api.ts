import { Response, ResponseError } from "../types";

export const generateResponse = <T>(
  data: T,
  error?: ResponseError
): Response<T> => {
  return {
    data,
    error: error?.error,
  };
};
