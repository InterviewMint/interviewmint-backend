import { Request, Response, NextFunction } from "express";
import { JwtPayload, verifyAccessToken } from "../utils/jwt.js";
import { statusCodes } from "../utils/constants.js";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../utils/prisma.js";

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const bearer = req.headers["authorization"];
    const token = bearer?.startsWith("Bearer ")
      ? bearer.slice(7)
      : req.cookies["accessToken"];

    if (!token) {
      throw new ApiError(statusCodes.UNAUTHORIZED, "Not authenticated");
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (e) {
      throw new ApiError(statusCodes.UNAUTHORIZED, "Invalid or expired token");
    }

    req.auth = {
      userId: payload.userId,
      tokenVersion: payload.tokenVersion,
      userType: payload.userType,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}
