import { Router } from "express";
import { UserController } from "../controllers/index.controller.js";
import { validateBody } from "../middlewares/validateDto.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  setUserType,
  requireUserType,
} from "../middlewares/role.middleware.js";
import { UserType } from "../generated/prisma/client.js";
import {
  UserRegistrationSchema,
  UserLoginEmailSchema,
  UpdateUserProfileSchema,
  VerifyEmailSchema,
  UserGoogleAuthSchema,
  UserRefreshTokenSchema,
} from "../dto/user.dto.js";

// Using CandidateController for shared auth logic until company-specific logic diverges
const router = Router();
const controller = new UserController();

router
  .route("/register")
  .post(
    setUserType(UserType.COMPANY_ADMIN),
    validateBody(UserRegistrationSchema),
    controller.registerEmail,
  );

router
  .route("/verify-email")
  .post(validateBody(VerifyEmailSchema), controller.verifyEmail);

router
  .route("/login")
  .post(validateBody(UserLoginEmailSchema), controller.loginEmail);

router
  .route("/google")
  .post(
    validateBody(UserGoogleAuthSchema),
    controller.googleAuth,
    setUserType(UserType.COMPANY_ADMIN),
    validateBody(UserGoogleAuthSchema),
    controller.googleAuth,
  );

router
  .route("/refresh")
  .post(validateBody(UserRefreshTokenSchema), controller.refreshToken);

router
  .route("/me")
  .get(
    authMiddleware,
    requireUserType(UserType.COMPANY_ADMIN),
    controller.getUserDetails,
  )
  .put(
    authMiddleware,
    requireUserType(UserType.COMPANY_ADMIN),
    validateBody(UpdateUserProfileSchema),
    controller.updateUserProfile,
  );

router
  .route("/logout")
  .post(
    authMiddleware,
    requireUserType(UserType.COMPANY_ADMIN),
    controller.logoutUser,
  );

export default router;

/**
 * @swagger
 * tags:
 *   - name: Companies
 *     description: Company authentication and profile management
 */
/**
 * @swagger
 * /companies/register:
 *   post:
 *     tags: [Companies]
 *     summary: Register a company admin via email & password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               fullName: { type: string }
 *     responses:
 *       201:
 *         description: Registration initiated; verification email sent.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponseBasic' }
 *       409:
 *         description: Email already in use.
 */
/**
 * @swagger
 * /companies/verify-email:
 *   post:
 *     tags: [Companies]
 *     summary: Verify company admin email using token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Email verified, auth tokens issued.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponseAuth' }
 *       400:
 *         description: Invalid or expired token.
 */
/**
 * @swagger
 * /companies/login:
 *   post:
 *     tags: [Companies]
 *     summary: Login company admin with email & password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponseAuth' }
 *       401:
 *         description: Invalid credentials or unverified email.
 */
/**
 * @swagger
 * /companies/google:
 *   post:
 *     tags: [Companies]
 *     summary: Authenticate company admin using Google ID token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken: { type: string }
 *     responses:
 *       200:
 *         description: Google authentication successful.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponseAuth' }
 *       400:
 *         description: Invalid Google token.
 */
/**
 * @swagger
 * /companies/refresh:
 *   post:
 *     tags: [Companies]
 *     summary: Refresh access & refresh tokens for company admin.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponseAuth' }
 *       401:
 *         description: Invalid or missing refresh token.
 */
/**
 * @swagger
 * /companies/me:
 *   get:
 *     tags: [Companies]
 *     summary: Get authenticated company admin details.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User details fetched.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponseUser' }
 *       401:
 *         description: Not authenticated.
 *       404:
 *         description: User not found.
 *   put:
 *     tags: [Companies]
 *     summary: Update authenticated company admin profile (partial update).
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               phone: { type: string }
 *               resumeUrl: { type: string }
 *               linkedInUrl: { type: string }
 *               githubUrl: { type: string }
 *               portfolioUrl: { type: string }
 *               twitterUrl: { type: string }
 *               profile: { type: object }
 *               languagePreference: { type: string }
 *               notificationPrefs: { type: object, additionalProperties: { type: boolean } }
 *               featureFlags: { type: object, additionalProperties: { } }
 *     responses:
 *       200:
 *         description: User profile updated.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponseUser' }
 *       401:
 *         description: Not authenticated.
 */
/**
 * @swagger
 * /companies/logout:
 *   post:
 *     tags: [Companies]
 *     summary: Logout authenticated company admin.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponseBasic' }
 *       401:
 *         description: Not authenticated.
 */
