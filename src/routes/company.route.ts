import { Router } from "express";
import { addNewCompany } from "../controllers/company.controller.js";

const router = Router();

router.route("/add-new").post(addNewCompany);

export default router;