import { Router } from "express";
import { getUserProfile, loginUser, logoutUser, registerUser, updateUserProfile } from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/profile").get(getUserProfile);
router.route("/profile").put(updateUserProfile);
router.route("/logout").post(logoutUser);


export default router;