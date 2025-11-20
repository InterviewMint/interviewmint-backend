import { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { statusCodes } from "../utils/constants.js";

type Schema<T> = {
  parse: (data: unknown) => T;
};

export function validateBody<T>(schema: Schema<T>): RequestHandler {
  return asyncHandler(async (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new ApiError(statusCodes.BAD_REQUEST, "Fields validation failed", [
        errorMessage,
      ]);
    }
    next();
  });
}
