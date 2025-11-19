import { Router } from "express";
import { addNewCollage } from "../controllers/collage.controller.js";

const router = Router();

router.route("/add-new").post(addNewCollage);

export default router;