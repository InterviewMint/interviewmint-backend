import express from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { statusCodes } from "./constants.js";

export const errorHandler = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  let statusCode =
    err?.statusCode || err?.code || statusCodes.INTERNAL_SERVER_ERROR;
  let message = err?.message || "Internal Server Error";

  // Common framework / validation adjustments
  if (err?.name === "ValidationError") statusCode = statusCodes.BAD_REQUEST;
  if (err?.name === "UnauthorizedError") statusCode = statusCodes.UNAUTHORIZED;
  if (err?.name === "ForbiddenError") statusCode = statusCodes.FORBIDDEN;
  if (err?.name === "NotFoundError") statusCode = statusCodes.NOT_FOUND;

  // Basic logging (omit stack in production responses)
  if (process.env.NODE_ENV !== "production") {
    console.error("[Error]", {
      message: err?.message,
      stack: err?.stack,
    });
  }

  // Ensure a single JSON response
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, null, message));
};
