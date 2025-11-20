import { configDotenv } from "dotenv";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

configDotenv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
