import { Router } from "express";
import { CollageController } from "../controllers/index.controller.js";

const router = Router();
const collageController = new CollageController();

router.route("/add-new").post(collageController.addNewCollage);
export default router;