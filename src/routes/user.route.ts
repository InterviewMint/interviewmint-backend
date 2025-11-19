import { Router } from "express";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
} from "../controllers/index.controller.js";

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
 *       name: token
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         resumeUrl:
 *           type: string
 *         linkedInUrl:
 *           type: string
 *         githubUrl:
 *           type: string
 *         portfolioUrl:
 *           type: string
 *         twitterUrl:
 *           type: string
 *         userType:
 *           type: string
 *           enum: [STUDENT, RECRUITER, COMPANY_ADMIN, COLLEGE_ADMIN, TPO, SUPER_ADMIN]
 *         isActive:
 *           type: boolean
 *         onboardingStep:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const router = Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or phone already exists
 */
router.route("/register").post(registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user with credentials
 *     tags: [Users]
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
 *         description: Login successful (session cookie set)
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.route("/login").post(loginUser);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [Users]
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
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.route("/profile").get(getUserProfile).put(updateUserProfile);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout current user (clear auth cookie)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */
router.route("/logout").post(logoutUser);

export default router;
