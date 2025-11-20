import { Router } from "express";
import { JobController } from "../controllers/index.controller.js";

const router = Router();
const jobController = new JobController();

router.route("/job").post(jobController.findJob);
router.route("/add-new").post(jobController.addNewJob);

export default router;
