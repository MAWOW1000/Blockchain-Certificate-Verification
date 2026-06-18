-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ISSUER', 'STUDENT');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('ISSUED', 'REVOKED');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('VALID', 'INVALID', 'REVOKED', 'NOT_FOUND');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ISSUER',
    "walletAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "certificateId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "degreeName" TEXT NOT NULL,
    "graduationDate" TIMESTAMP(3) NOT NULL,
    "issuerId" INTEGER NOT NULL,
    "universityId" INTEGER,
    "certificateHash" TEXT NOT NULL,
    "blockchainTxHash" TEXT,
    "status" "CertificateStatus" NOT NULL DEFAULT 'ISSUED',
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" SERIAL NOT NULL,
    "certificateId" TEXT NOT NULL,
    "verifierIp" TEXT,
    "result" "VerificationResult" NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "University_email_key" ON "University"("email");

-- CreateIndex
CREATE UNIQUE INDEX "University_walletAddress_key" ON "University"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "University_userId_key" ON "University"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateId_key" ON "Certificate"("certificateId");

-- CreateIndex
CREATE INDEX "Certificate_issuerId_idx" ON "Certificate"("issuerId");

-- CreateIndex
CREATE INDEX "Certificate_universityId_idx" ON "Certificate"("universityId");

-- CreateIndex
CREATE INDEX "Certificate_studentEmail_idx" ON "Certificate"("studentEmail");

-- CreateIndex
CREATE INDEX "Certificate_status_idx" ON "Certificate"("status");

-- CreateIndex
CREATE INDEX "VerificationLog_certificateId_idx" ON "VerificationLog"("certificateId");

-- CreateIndex
CREATE INDEX "VerificationLog_result_idx" ON "VerificationLog"("result");

-- CreateIndex
CREATE INDEX "VerificationLog_verifiedAt_idx" ON "VerificationLog"("verifiedAt");

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
