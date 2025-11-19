import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken, type JWTPayload } from "../utils/jwt.util.js";
import { UserRole } from "../models/user.model.js";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT token from cookies or Authorization header
 */
export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    const token = req.cookies?.accessToken || 
                  req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request - No token provided");
    }

    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      throw new ApiError(401, "Invalid or expired token");
    }

    // Attach user info to request
    req.user = decodedToken;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Unauthorized request"
      });
    }
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not authenticated"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden - Required role(s): ${roles.join(", ")}`
      });
    }

    next();
  };
};
