import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import userRouter from "./routes/user.route.js"
import jobRouter from "./routes/job.route.js"
import collageRoute from "./routes/collage.route.js"
import companyRoute from "./routes/company.route.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/collages", collageRoute);
app.use("/api/v1/companies", companyRoute);


export { app };