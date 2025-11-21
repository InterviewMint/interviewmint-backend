import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserType } from "../generated/prisma/client.js";
import { ApiError } from "../utils/ApiError.js";
import { statusCodes } from "../utils/constants.js";

// Extend Request type
declare global {
  namespace Express {
    interface Request {
      userTypeOverride?: UserType;
    }
  }
}

// Middleware to set the userType for registration endpoints
export function setUserType(userType: UserType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.userTypeOverride = userType;
    next();
  };
}

// Middleware to enforce that the authenticated user matches expected role
export function requireUserType(expected: UserType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const auth = req.auth;
    if (!auth) {
      return next(new ApiError(statusCodes.UNAUTHORIZED, "Not authenticated"));
    }
    if (auth.userType !== expected) {
      return next(new ApiError(statusCodes.FORBIDDEN, "Forbidden"));
    }
    next();
  };
}
