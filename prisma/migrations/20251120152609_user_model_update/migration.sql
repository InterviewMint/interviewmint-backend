/*
  Warnings:

  - The values [PASSWORD] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.
  - The values [STUDENT] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[emailVerificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthProvider_new" AS ENUM ('EMAIL', 'GOOGLE', 'GITHUB', 'MICROSOFT', 'SSO');
ALTER TABLE "public"."User" ALTER COLUMN "authProvider" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "authProvider" TYPE "AuthProvider_new" USING ("authProvider"::text::"AuthProvider_new");
ALTER TYPE "AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "public"."AuthProvider_old";
ALTER TABLE "User" ALTER COLUMN "authProvider" SET DEFAULT 'EMAIL';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('CANDIDATE', 'RECRUITER', 'COMPANY_ADMIN', 'COLLEGE_ADMIN', 'TPO', 'SUPER_ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "public"."UserType_old";
ALTER TABLE "User" ALTER COLUMN "userType" SET DEFAULT 'CANDIDATE';
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "linkedInUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "twitterUrl" TEXT,
ALTER COLUMN "authProvider" SET DEFAULT 'EMAIL',
ALTER COLUMN "userType" SET DEFAULT 'CANDIDATE';

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE INDEX "User_emailVerified_createdAt_idx" ON "User"("emailVerified", "createdAt");
