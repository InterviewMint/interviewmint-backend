import { Router } from "express";
import { addNewCompany } from "../controllers/index.controller.js";

const router = Router();

router.route("/add-new").post(addNewCompany);

export default router;
