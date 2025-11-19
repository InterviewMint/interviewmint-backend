import { Router } from "express";
import { addNewJob, findJob } from "../controllers/job.controller.js";

const router = Router();

router.route("/job").post(findJob);
router.route("/add-new").post(addNewJob);

export default router;
