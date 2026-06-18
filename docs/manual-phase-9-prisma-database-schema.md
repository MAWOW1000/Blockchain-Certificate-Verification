# Manual Phase 9: Create the Prisma Database Schema

This guide explains how to create the PostgreSQL database schema with Prisma for the Blockchain-Based Academic Certificate Verification project.

Phase 9 goal:

```text
Define the database tables for users, universities, certificates, and verification logs, then create them in PostgreSQL with Prisma migration.
```

In this phase, you will:

1. Review the data that belongs in PostgreSQL.
2. Edit `backend/prisma/schema.prisma`.
3. Add enums for user roles, certificate status, and verification results.
4. Add Prisma models.
5. Format and validate the schema.
6. Run the first database migration.
7. Generate Prisma Client.
8. Open Prisma Studio and inspect the database.

Backend APIs will be created in Phase 10.

## 1. What PostgreSQL Stores

The blockchain stores proof.

PostgreSQL stores application data.

For this project, PostgreSQL will store:

```text
users
universities
certificate metadata
certificate PDF path
blockchain transaction hash
verification logs
```

Important blockchain rule:

```text
Do not store full student personal data on-chain.
Store student and certificate metadata in PostgreSQL.
Store only certificate ID, hash, issuer, timestamp, and revoke status on-chain.
```

## 2. Make Sure Previous Phases Are Complete

Before Phase 9, you should have:

```text
local PostgreSQL database from Phase 6
backend project from Phase 7
backend environment variables from Phase 8
backend/prisma/schema.prisma
backend/prisma.config.ts
backend/.env with DATABASE_URL
```

Check:

```bash
ls backend/prisma
```

You should see:

```text
schema.prisma
```

Check:

```bash
ls backend
```

You should see:

```text
prisma.config.ts
```

In this project, Prisma reads `DATABASE_URL` from `prisma.config.ts`.

## 3. Go to the Backend Folder

Run:

```bash
cd backend
```

Check your location:

```bash
pwd
```

You should be inside:

```text
Blockchain-Certificate-Verification/backend
```

## 4. Check the Database URL

Open:

```bash
code .env
```

Make sure it contains:

```env
DATABASE_URL=postgresql://certificate_user:certificate_password@localhost:5432/certificate_db
```

Test PostgreSQL connection:

```bash
psql "postgresql://certificate_user:certificate_password@localhost:5432/certificate_db"
```

If it works, exit:

```sql
\q
```

## 5. Open Prisma Schema

Open:

```bash
code prisma/schema.prisma
```

Current shape should be similar to:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Keep this part.

Do not add `url = env("DATABASE_URL")` if this project already has `prisma.config.ts` with:

```ts
datasource: {
  url: process.env["DATABASE_URL"],
}
```

## 6. Add Enums

Below the `datasource db` block, add:

```prisma
enum UserRole {
  ADMIN
  ISSUER
  STUDENT
}

enum CertificateStatus {
  ISSUED
  REVOKED
}

enum VerificationResult {
  VALID
  INVALID
  REVOKED
  NOT_FOUND
}
```

Meaning:

```text
UserRole
```

Controls what a user can do.

```text
CertificateStatus
```

Tracks whether a certificate is still active or revoked.

```text
VerificationResult
```

Stores the result shown to a verifier.

## 7. Add `User` Model

Add:

```prisma
model User {
  id                 Int           @id @default(autoincrement())
  name               String
  email              String        @unique
  passwordHash       String
  role               UserRole      @default(ISSUER)
  walletAddress      String?       @unique
  university         University?
  issuedCertificates Certificate[] @relation("IssuerCertificates")
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
}
```

Meaning:

```text
email @unique
```

Prevents duplicate accounts with the same email.

```text
passwordHash
```

Stores the bcrypt password hash.

Never store plain text passwords.

```text
walletAddress
```

Stores the issuer Ethereum wallet address.

It is optional because not every user must have a wallet immediately.

## 8. Add `University` Model

Add:

```prisma
model University {
  id             Int           @id @default(autoincrement())
  name           String
  email          String        @unique
  walletAddress  String        @unique
  isApproved     Boolean       @default(false)
  userId         Int?          @unique
  user           User?         @relation(fields: [userId], references: [id])
  certificates   Certificate[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}
```

Meaning:

```text
isApproved
```

Admin approval status.

Only approved universities or issuers should be allowed to issue certificates later.

```text
userId
```

Optionally connects a university profile to a login account.

## 9. Add `Certificate` Model

Add:

```prisma
model Certificate {
  id               Int               @id @default(autoincrement())
  certificateId    String            @unique
  studentName      String
  studentEmail     String
  studentId        String
  programName      String
  degreeName       String
  graduationDate   DateTime
  issuerId         Int
  issuer           User              @relation("IssuerCertificates", fields: [issuerId], references: [id])
  universityId     Int?
  university       University?       @relation(fields: [universityId], references: [id])
  certificateHash  String
  blockchainTxHash String?
  status           CertificateStatus @default(ISSUED)
  pdfUrl           String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  revokedAt        DateTime?

  @@index([issuerId])
  @@index([universityId])
  @@index([studentEmail])
  @@index([status])
}
```

Meaning:

```text
certificateId
```

Public certificate identifier.

This ID is also used by the smart contract.

```text
certificateHash
```

Hash of the certificate data or file.

This value is compared with the blockchain hash during verification.

```text
blockchainTxHash
```

Transaction hash returned after issuing the certificate on-chain.

```text
pdfUrl
```

Path or URL to the generated certificate PDF.

## 10. Add `VerificationLog` Model

Add:

```prisma
model VerificationLog {
  id            Int                @id @default(autoincrement())
  certificateId String
  verifierIp    String?
  result        VerificationResult
  verifiedAt    DateTime           @default(now())

  @@index([certificateId])
  @@index([result])
  @@index([verifiedAt])
}
```

Meaning:

```text
certificateId
```

The certificate ID that someone tried to verify.

This remains a plain string so the system can log invalid or not-found certificate IDs too.

```text
verifierIp
```

Optional IP address of the verifier.

```text
result
```

Stores whether the check was valid, invalid, revoked, or not found.

## 11. Full `schema.prisma` Example

Your final file should look like this:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum UserRole {
  ADMIN
  ISSUER
  STUDENT
}

enum CertificateStatus {
  ISSUED
  REVOKED
}

enum VerificationResult {
  VALID
  INVALID
  REVOKED
  NOT_FOUND
}

model User {
  id                 Int           @id @default(autoincrement())
  name               String
  email              String        @unique
  passwordHash       String
  role               UserRole      @default(ISSUER)
  walletAddress      String?       @unique
  university         University?
  issuedCertificates Certificate[] @relation("IssuerCertificates")
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
}

model University {
  id             Int           @id @default(autoincrement())
  name           String
  email          String        @unique
  walletAddress  String        @unique
  isApproved     Boolean       @default(false)
  userId         Int?          @unique
  user           User?         @relation(fields: [userId], references: [id])
  certificates   Certificate[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model Certificate {
  id               Int               @id @default(autoincrement())
  certificateId    String            @unique
  studentName      String
  studentEmail     String
  studentId        String
  programName      String
  degreeName       String
  graduationDate   DateTime
  issuerId         Int
  issuer           User              @relation("IssuerCertificates", fields: [issuerId], references: [id])
  universityId     Int?
  university       University?       @relation(fields: [universityId], references: [id])
  certificateHash  String
  blockchainTxHash String?
  status           CertificateStatus @default(ISSUED)
  pdfUrl           String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  revokedAt        DateTime?

  @@index([issuerId])
  @@index([universityId])
  @@index([studentEmail])
  @@index([status])
}

model VerificationLog {
  id            Int                @id @default(autoincrement())
  certificateId String
  verifierIp    String?
  result        VerificationResult
  verifiedAt    DateTime           @default(now())

  @@index([certificateId])
  @@index([result])
  @@index([verifiedAt])
}
```

## 12. Format the Prisma Schema

Run:

```bash
npx prisma format
```

Meaning:

```text
prisma format
```

Automatically formats `schema.prisma`.

## 13. Validate the Prisma Schema

Run:

```bash
npx prisma validate
```

Expected result:

```text
The schema at prisma/schema.prisma is valid
```

If validation fails, read the line number in the error and fix the schema.

## 14. Run the First Migration

Run:

```bash
npx prisma migrate dev --name init
```

Meaning:

```text
migrate dev
```

Creates SQL migration files and applies them to the local database.

```text
--name init
```

Names the migration.

After this command, Prisma should create:

```text
backend/prisma/migrations/
```

## 15. Generate Prisma Client

Run:

```bash
npx prisma generate
```

Meaning:

```text
Prisma Client
```

Generated JavaScript code used by the backend to query PostgreSQL.

In this project, generated Prisma code goes to:

```text
backend/src/generated/prisma
```

This folder is ignored by Git.

## 16. Open Prisma Studio

Run:

```bash
npx prisma studio
```

Open the shown URL in your browser.

Usually:

```text
http://localhost:5555
```

You should see these tables:

```text
User
University
Certificate
VerificationLog
```

Close Prisma Studio when finished.

## 17. Optional: Check Tables with psql

Run:

```bash
psql "postgresql://certificate_user:certificate_password@localhost:5432/certificate_db"
```

Inside `psql`, run:

```sql
\dt
```

You should see tables created by Prisma.

Exit:

```sql
\q
```

## 18. Optional: Reset Local Database During Development

If you need to reset local data, run:

```bash
npx prisma migrate reset
```

This deletes local table data and reapplies migrations.

Use this only during local development.

Do not use this on production or a shared database.

## 19. Common Problem: DATABASE_URL Not Found

If you see:

```text
Environment variable not found: DATABASE_URL
```

Check that:

```text
backend/.env exists
DATABASE_URL is inside backend/.env
you are running Prisma commands from the backend folder
```

Then run again:

```bash
npx prisma validate
```

## 20. Common Problem: Cannot Connect to Database

If you see:

```text
Can't reach database server at localhost:5432
```

Start PostgreSQL:

```bash
sudo service postgresql start
```

Test connection:

```bash
psql "postgresql://certificate_user:certificate_password@localhost:5432/certificate_db"
```

Then rerun migration:

```bash
npx prisma migrate dev --name init
```

## 21. Common Problem: Permission Denied for Schema public

If you see:

```text
permission denied for schema public
```

Open PostgreSQL as admin:

```bash
sudo -u postgres psql
```

Run:

```sql
\c certificate_db
GRANT ALL ON SCHEMA public TO certificate_user;
\q
```

Then rerun:

```bash
npx prisma migrate dev --name init
```

## 22. Common Problem: Migration Already Exists

If you already ran the migration and changed the schema during local development, use:

```bash
npx prisma migrate dev
```

If your local database is messy and you do not need the data:

```bash
npx prisma migrate reset
```

Remember:

```text
migrate reset deletes local data.
```

## 23. What Not To Do in Phase 9

Do not create API routes yet.

Do not write authentication logic yet.

Do not connect smart contract calls yet.

Do not manually create tables in PostgreSQL.

Let Prisma create and manage the database schema.

## 24. Phase 9 Completion Checklist

Phase 9 is complete when:

```text
backend/prisma/schema.prisma contains User model
backend/prisma/schema.prisma contains University model
backend/prisma/schema.prisma contains Certificate model
backend/prisma/schema.prisma contains VerificationLog model
UserRole enum exists
CertificateStatus enum exists
VerificationResult enum exists
npx prisma format succeeds
npx prisma validate succeeds
npx prisma migrate dev --name init succeeds
npx prisma generate succeeds
Prisma Studio opens successfully
User, University, Certificate, and VerificationLog tables are visible
```

Next phase:

```text
Phase 10: Build backend API
```
