import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  userStore,
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
  type User,
} from "../models/user.model.js";
import { generateAccessToken } from "../utils/jwt.util.js";

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Register a new user
 * POST /api/v1/users/register
 */
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validationResult = registerUserSchema.safeParse(req.body);

  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation failed",
      validationResult.error.issues.map((e: any) => e.message),
    );
  }

  const { email, password, name, role } = validationResult.data;

  // Check if user already exists
  const existingUser = await userStore.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Create user
  const user = await userStore.create({ email, password, name, role });

  // Generate access token
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  // Set cookie and send response
  res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        { user: userWithoutPassword, accessToken },
        "User registered successfully",
      ),
    );
});

/**
 * Login user
 * POST /api/v1/users/login
 */
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validationResult = loginUserSchema.safeParse(req.body);

  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation failed",
      validationResult.error.issues.map((e: any) => e.message),
    );
  }

  const { email, password } = validationResult.data;

  // Find user by email
  const user = await userStore.findByEmail(email);
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await userStore.comparePassword(
    password,
    user.password,
  );
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate access token
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  // Set cookie and send response
  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: userWithoutPassword, accessToken },
        "Login successful",
      ),
    );
});

/**
 * Get user profile
 * GET /api/v1/users/profile
 * Requires authentication
 */
const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // User info is attached by auth middleware
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  // Fetch full user details
  const user = await userStore.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userWithoutPassword,
        "User profile fetched successfully",
      ),
    );
});

/**
 * Update user profile
 * PUT /api/v1/users/profile
 * Requires authentication
 */
const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // User info is attached by auth middleware
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  // Validate request body
  const validationResult = updateUserSchema.safeParse(req.body);

  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation failed",
      validationResult.error.issues.map((e: any) => e.message),
    );
  }

  // Update user
  const updatedUser = await userStore.update(
    req.user.id,
    validationResult.data,
  );
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = updatedUser;

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userWithoutPassword,
        "User profile updated successfully",
      ),
    );
});

/**
 * Logout user
 * POST /api/v1/users/logout
 */
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  // Clear the access token cookie
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, null, "Logout successful"));
});

export {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
};
