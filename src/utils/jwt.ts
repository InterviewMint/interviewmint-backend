import jwt from "jsonwebtoken";
import type { User } from "../generated/prisma/client.js";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT secrets are not set in env");
}

export type JwtPayload = {
  userId: string;
  tokenVersion: number;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
}

export function buildAuthResponse(user: User, payload: JwtPayload) {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const response: AuthResponse = { user, accessToken, refreshToken };
  return response;
}
