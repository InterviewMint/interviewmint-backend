import { Router } from "express";
import { addNewCollage } from "../controllers/index.controller.js";

const router = Router();

router.route("/add-new").post(addNewCollage);

export default router;