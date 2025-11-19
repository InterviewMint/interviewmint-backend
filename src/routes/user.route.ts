import { Router } from "express";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
// TODO: Add rate limiting to prevent brute force attacks (e.g., express-rate-limit)
router.route("/login").post(loginUser);
router.route("/register").post(registerUser);

// Protected routes (require authentication)
// TODO: For production, add CSRF protection if using cookie-based auth (e.g., csurf middleware)
router.route("/profile").get(verifyJWT, getUserProfile);
router.route("/profile").put(verifyJWT, updateUserProfile);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
