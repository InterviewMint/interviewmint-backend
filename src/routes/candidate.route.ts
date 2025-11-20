import { Router } from "express";
import { CandidateController } from "../controllers/index.controller.js";
import { validateBody } from "../middlewares/validateDto.js";
import {
  CandidateRegistrationSchema,
  CandidateLoginEmailSchema,
  UpdateCandidateProfileSchema,
  VerifyEmailSchema,
  CandidateGoogleAuthSchema,
  CandidateRefreshTokenSchema,
} from "../dto/candidate.dto.js";

const router = Router();
const candidateController = new CandidateController();

router
  .route("/register")
  .post(
    validateBody(CandidateRegistrationSchema),
    candidateController.registerEmail,
  );

router
  .route("/verify-email")
  .post(validateBody(VerifyEmailSchema), candidateController.verifyEmail);

router
  .route("/login")
  .post(
    validateBody(CandidateLoginEmailSchema),
    candidateController.loginEmail,
  );

router
  .route("/google")
  .post(
    validateBody(CandidateGoogleAuthSchema),
    candidateController.googleAuth,
  );

router
  .route("/refresh")
  .post(
    validateBody(CandidateRefreshTokenSchema),
    candidateController.refreshToken,
  );

router
  .route("/me")
  .get(candidateController.getUserDetails)
  .put(
    validateBody(UpdateCandidateProfileSchema),
    candidateController.updateUserProfile,
  );

router.route("/logout").post(candidateController.logoutUser);

export default router;

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User authentication and profile management
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         fullName: { type: string }
 *         email: { type: string, format: email }
 *         phone: { type: string }
 *         resumeUrl: { type: string }
 *         linkedInUrl: { type: string }
 *         githubUrl: { type: string }
 *         portfolioUrl: { type: string }
 *         twitterUrl: { type: string }
 *         userType:
 *           type: string
 *           enum: [STUDENT, RECRUITER, COMPANY_ADMIN, COLLEGE_ADMIN, TPO, SUPER_ADMIN]
 *         isActive: { type: boolean }
 *         onboardingStep: { type: integer }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     AuthData:
 *       type: object
 *       properties:
 *         user: { $ref: '#/components/schemas/User' }
 *         accessToken: { type: string }
 *         refreshToken: { type: string }
 *     ApiResponseAuth:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { $ref: '#/components/schemas/AuthData' }
 *     ApiResponseUser:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { $ref: '#/components/schemas/User' }
 *     ApiResponseBasic:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { type: 'null' }
 */
/**
 * @swagger
 * /candidates/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a candidate via email & password.
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
 * /candidates/verify-email:
 *   post:
 *     tags: [Users]
 *     summary: Verify candidate email using token.
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
 * /candidates/login:
 *   post:
 *     tags: [Users]
 *     summary: Login with email & password.
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
 * /candidates/google:
 *   post:
 *     tags: [Users]
 *     summary: Authenticate using Google ID token.
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
 * /candidates/refresh:
 *   post:
 *     tags: [Users]
 *     summary: Refresh access & refresh tokens.
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
 * /candidates/me:
 *   get:
 *     tags: [Users]
 *     summary: Get authenticated user details.
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
 *     tags: [Users]
 *     summary: Update authenticated user profile (partial update).
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
 */
