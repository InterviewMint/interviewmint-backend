import userRouter from "./user.route.js";
import jobRouter from "./job.route.js";
import collageRoute from "./collage.route.js";
import companyRoute from "./company.route.js";

import { Router } from "express";

const router = Router();

router.use("/users", userRouter);
router.use("/jobs", jobRouter);
router.use("/collages", collageRoute);
router.use("/companies", companyRoute);

export default router;
