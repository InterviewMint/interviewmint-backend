import { Router } from "express";
import { CompanyController } from "../controllers/index.controller.js";

const router = Router();
const companyController = new CompanyController();

router.route("/add-new").post(companyController.addNewCompany);
export default router;
