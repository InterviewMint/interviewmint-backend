import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import { swaggerSpec, swaggerUiMiddleware } from "./docs/swagger.js";

app.use(
  "/docs",
  swaggerUiMiddleware.serve,
  swaggerUiMiddleware.setup(swaggerSpec),
);

import appRouter from "./routes/index.route.js";
import { errorHandler } from "./utils/errorHandler.js";

app.use("/api/v1", appRouter);

app.use(errorHandler);

export { app };
