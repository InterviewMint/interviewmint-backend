import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/token.js";
import { sendVerificationEmail } from "../utils/email.js";
import {
  buildAuthResponse,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { User, AuthProvider, UserType } from "../generated/prisma/client.js";
import { googleClient } from "../utils/googleClient.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  UserEmailRegistrationDto,
  VerifyUserEmailDto,
  UserLoginEmailDto,
  UserGoogleAuthDto,
  UserRefreshTokenDto,
  UpdateUserProfileDto,
} from "../dto/index.dto.js";
import { statusCodes } from "../utils/constants.js";

const emailExpiryMinutes = parseInt(
  process.env.EMAIL_VERIFY_EXPIRY_MINUTES || "30",
  10,
);

class UserController {
  /// This method handles candidate registration via email
  registerEmail = asyncHandler(
    async (
      req: Request<{}, {}, UserEmailRegistrationDto>,
      res: Response,
      next: NextFunction,
    ) => {
      const { email, fullName, password } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });

      if (existing && existing.emailVerified) {
        throw new ApiError(statusCodes.CONFLICT, "Email already in use");
      }

      const passwordHash = await hashPassword(password);
      const verificationToken = generateToken();
      const expiresAt = new Date(Date.now() + emailExpiryMinutes * 60 * 1000);

      const requestedUserType = req.userTypeOverride;
      let user;
      if (
        existing &&
        !existing.emailVerified &&
        existing.authProvider === AuthProvider.EMAIL
      ) {
        user = await prisma.user.update({
          where: { email },
          data: {
            passwordHash: passwordHash,
            ...(fullName !== undefined && { fullName: fullName }),
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpiresAt: expiresAt,
            authProvider: AuthProvider.EMAIL,
            userType: requestedUserType!,
            updatedAt: new Date(),
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            fullName: fullName ?? "User",
            authProvider: AuthProvider.EMAIL,
            emailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpiresAt: expiresAt,
            userType: requestedUserType!,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      await sendVerificationEmail({
        to: email,
        name: user.fullName,
        token: verificationToken,
      });

      res
        .status(statusCodes.CREATED)
        .json(
          new ApiResponse(
            statusCodes.CREATED,
            null,
            "Registration successful. Please verify your email.",
          ),
        );
      return;
    },
  );

  /// This method handles candidate email verification
  verifyEmail = asyncHandler(
    async (
      req: Request<{}, {}, VerifyUserEmailDto>,
      res: Response,
      next: NextFunction,
    ) => {
      const { token } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationTokenExpiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new ApiError(
          statusCodes.BAD_REQUEST,
          "Invalid or expired verification token",
        );
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationTokenExpiresAt: null,
          updatedAt: new Date(),
        },
      });

      const authResponse = buildAuthResponse(updated);

      res.cookie("refreshToken", authResponse.refreshToken);
      res.cookie("accessToken", authResponse.accessToken);

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            authResponse,
            "Email verified successfully.",
          ),
        );
      return;
    },
  );

  /// This method handles candidate login via email
  loginEmail = asyncHandler(
    async (
      req: Request<{}, {}, UserLoginEmailDto>,
      res: Response,
      next: NextFunction,
    ) => {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new ApiError(statusCodes.UNAUTHORIZED, "Invalid credentials");
      }

      if (!user.emailVerified) {
        throw new ApiError(
          statusCodes.UNAUTHORIZED,
          "Email not verified. Please verify your email before logging in.",
        );
      }

      const passwordMatch = await comparePassword(password, user.passwordHash!);

      if (!passwordMatch) {
        throw new ApiError(statusCodes.UNAUTHORIZED, "Invalid credentials");
      }

      const authResponse = buildAuthResponse(user);

      res.cookie("refreshToken", authResponse.refreshToken);
      res.cookie("accessToken", authResponse.accessToken);

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, authResponse, "Login successful."),
        );
      return;
    },
  );

  googleAuth = asyncHandler(
    async (
      req: Request<{}, {}, UserGoogleAuthDto>,
      res: Response,
      next: NextFunction,
    ) => {
      const { idToken } = req.body;

      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new ApiError(
          statusCodes.INTERNAL_SERVER_ERROR,
          "Google Client ID not configured",
        );
      }

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        throw new ApiError(statusCodes.BAD_REQUEST, "Invalid Google token");
      }

      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name ?? payload.given_name ?? null;

      const requestedUserType = req.userTypeOverride;

      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { authProvider: AuthProvider.GOOGLE, providerId: googleId },
            { email },
          ],
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            fullName: name ?? "Google User",
            authProvider: AuthProvider.GOOGLE,
            userType: requestedUserType!,
            providerId: googleId,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } else {
        if (!user.providerId || user.authProvider !== AuthProvider.GOOGLE) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              authProvider: AuthProvider.GOOGLE,
              providerId: googleId,
              emailVerified: true,
              updatedAt: new Date(),
            },
          });
        }
      }

      const authResponse = buildAuthResponse(user);

      res.cookie("refreshToken", authResponse.refreshToken);
      res.cookie("accessToken", authResponse.accessToken);

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            authResponse,
            "Google authentication successful.",
          ),
        );
      return;
    },
  );

  refreshToken = asyncHandler(
    async (
      req: Request<{}, {}, UserRefreshTokenDto>,
      res: Response,
      next: NextFunction,
    ) => {
      const { refreshToken } = req.body || req.cookies["refreshToken"];

      if (!refreshToken) {
        throw new ApiError(statusCodes.UNAUTHORIZED, "Not authenticated");
      }

      const { tokenVersion, userId } = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.tokenVersion !== tokenVersion) {
        throw new ApiError(statusCodes.UNAUTHORIZED, "Invalid refresh token");
      }

      const authResponse = buildAuthResponse(user);

      res.cookie("refreshToken", authResponse.refreshToken);
      res.cookie("accessToken", authResponse.accessToken);

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            authResponse,
            "Token refreshed successfully.",
          ),
        );
      return;
    },
  );
  logoutUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const token =
        req.headers["authorization"]?.split(" ")[1] ||
        req.cookies["accessToken"];

      if (!token) {
        throw new ApiError(statusCodes.UNAUTHORIZED, "Not authenticated");
      }

      const { userId, tokenVersion } = verifyAccessToken(token);

      if (!userId || !tokenVersion) {
        throw new ApiError(statusCodes.UNAUTHORIZED, "Invalid token");
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          tokenVersion: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, null, "Logged out successfully."),
        );
      return;
    },
  );

  /// This method retrieves the authenticated user's details
  getUserDetails = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const auth = req.auth;
      if (!auth?.userId) {
        throw new ApiError(statusCodes.UNAUTHORIZED, "Not authenticated");
      }
      const user = await prisma.user.findUnique({ where: { id: auth.userId } });

      if (!user) {
        throw new ApiError(statusCodes.NOT_FOUND, "User not found");
      }

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, user, "User details fetched."));
      return;
    },
  );
  updateUserProfile = asyncHandler(
    async (
      req: Request<{}, {}, UpdateUserProfileDto>,
      res: Response,
      next: NextFunction,
    ) => {
      const auth = req.auth;
      if (!auth?.userId) {
        throw new ApiError(statusCodes.UNAUTHORIZED, "Not authenticated");
      }
      const updateData = req.body;

      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined),
      );

      const updatedUser = await prisma.user.update({
        where: { id: auth.userId },
        data: {
          ...filteredUpdateData,
          updatedAt: new Date(),
        },
      });

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            updatedUser,
            "User profile updated successfully.",
          ),
        );
      return;
    },
  );
}

export default UserController;
