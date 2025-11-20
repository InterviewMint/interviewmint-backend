import { PrismaClient } from "../generated/prisma/client.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString || typeof rawConnectionString !== "string") {
  throw new Error(
    "Missing or invalid DATABASE_URL environment variable. It must be a non-empty string.",
  );
}

try {
  const parsed = new URL(rawConnectionString);
  if (!parsed.password || typeof parsed.password !== "string") {
    console.warn(
      "Warning: DATABASE_URL has no password part or password is not a string.",
    );
  }
} catch (e) {
  console.warn("Could not parse DATABASE_URL as URL for validation.");
}

const pool = new Pool({ connectionString: rawConnectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

// Optional: graceful shutdown helper
export async function shutdownPrisma() {
  try {
    await prisma.$disconnect();
  } finally {
    await pool.end().catch(() => void 0);
  }
}
