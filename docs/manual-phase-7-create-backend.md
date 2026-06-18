# Manual Phase 7: Create the Backend

This guide explains how to create the backend for the Blockchain-Based Academic Certificate Verification project.

Phase 7 goal:

```text
Create a Node.js + Express backend project that can later connect to PostgreSQL and the smart contract.
```

In this phase, you will:

1. Initialize the backend project.
2. Install backend packages.
3. Create the backend folder structure.
4. Create a simple Express server.
5. Add a health check API.
6. Run the backend locally.

Database models and Prisma schema will be handled in a later phase.

## 1. What the Backend Does

The backend is the middle layer between:

```text
Frontend
PostgreSQL database
Ethereum smart contract
Certificate PDF/QR generation
```

In this project, the backend will later handle:

```text
login/register
admin approval
certificate creation
certificate hashing
smart contract calls
PostgreSQL data storage
PDF generation
QR code generation
certificate verification
```

## 2. Go to the Backend Folder

From the project root, run:

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

## 3. Initialize Backend `package.json`

Run:

```bash
npm init -y
```

Meaning:

```text
npm init
```

Creates a `package.json` file.

```text
-y
```

Accepts default answers automatically.

The `package.json` file stores:

```text
project name
version
scripts
dependencies
development dependencies
```

## 4. Install Backend Packages

Run:

```bash
npm install express cors dotenv bcrypt jsonwebtoken prisma @prisma/client ethers multer qrcode pdfkit uuid
```

Meaning of each package:

```text
express
```

Web server framework. Used to create APIs like `/api/auth/login`.

```text
cors
```

Allows your frontend to call your backend from a different URL or port.

Example:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

```text
dotenv
```

Loads environment variables from `.env`.

Example:

```text
PORT=5000
DATABASE_URL=...
```

```text
bcrypt
```

Hashes user passwords before saving them to PostgreSQL.

Never save plain text passwords.

```text
jsonwebtoken
```

Creates and verifies JWT login tokens.

Used for authentication.

```text
prisma
```

Prisma CLI tool. Used to create migrations and manage database schema.

```text
@prisma/client
```

Prisma client library. Used by backend code to query PostgreSQL.

```text
ethers
```

Lets the backend connect to Ethereum, local Hardhat, and Sepolia.

Used to call smart contract functions.

```text
multer
```

Handles file uploads.

Used later when a verifier uploads a certificate file.

```text
qrcode
```

Generates QR codes for certificate verification links.

```text
pdfkit
```

Generates certificate PDF files.

```text
uuid
```

Generates unique certificate IDs.

## 5. Install Development Package

Run:

```bash
npm install --save-dev nodemon
```

Meaning:

```text
nodemon
```

Automatically restarts the backend server when you edit files.

This is useful during development.

## 6. Update `package.json`

Open:

```bash
code package.json
```

Find the default scripts:

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

Replace them with:

```json
"scripts": {
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev"
}
```

Also add:

```json
"type": "module"
```

Example `package.json` shape:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  }
}
```

Meaning:

```text
"type": "module"
```

Allows modern JavaScript imports:

```js
import express from "express";
```

Instead of older syntax:

```js
const express = require("express");
```

```text
"dev"
```

Runs backend using `nodemon`.

```text
"start"
```

Runs backend normally. This is useful for deployment.

```text
"prisma:generate"
```

Generates Prisma client.

```text
"prisma:migrate"
```

Runs local database migrations.

## 7. Create Backend Folder Structure

Run:

```bash
mkdir -p src/controllers src/routes src/services src/middleware src/utils src/uploads
```

Meaning:

```text
src/controllers
```

Functions that receive API requests and send responses.

```text
src/routes
```

Defines API endpoints like `/api/auth/login`.

```text
src/services
```

Business logic, such as blockchain calls, hashing, PDF generation.

```text
src/middleware
```

Reusable request checks, such as authentication.

```text
src/utils
```

Helper functions.

```text
src/uploads
```

Temporary location for uploaded files during development.

## 8. Create Main Server File

Run:

```bash
touch src/server.js
```

Open it:

```bash
code src/server.js
```

Copy this code:

```js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "certificate-backend",
  });
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
```

## 9. Explain `server.js` Line by Line

```js
import express from "express";
```

Imports Express so we can create an API server.

```js
import cors from "cors";
```

Imports CORS middleware so frontend can call backend.

```js
import dotenv from "dotenv";
```

Imports dotenv so backend can read `.env` variables.

```js
dotenv.config();
```

Loads variables from `.env` into `process.env`.

Example:

```text
process.env.PORT
```

```js
const app = express();
```

Creates the Express application.

This `app` is used to define middleware and API routes.

```js
const port = process.env.PORT || 5000;
```

Uses the `PORT` value from `.env`.

If no `PORT` is found, it uses `5000`.

```js
app.use(cors());
```

Enables CORS for API requests.

```js
app.use(express.json());
```

Allows the backend to read JSON request bodies.

Example request body:

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

```js
app.get("/api/health", (req, res) => {
```

Creates a GET API endpoint.

URL:

```text
GET /api/health
```

```js
res.json({
  status: "ok",
  service: "certificate-backend",
});
```

Sends JSON response to the browser/client.

```js
app.listen(port, () => {
```

Starts the backend server.

```js
console.log(`Backend running on port ${port}`);
```

Prints a message when the server starts.

## 10. Create `.env`

Run:

```bash
touch .env
```

Open:

```bash
code .env
```

Add:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/certificate_db
JWT_SECRET=change_this_secret
BLOCKCHAIN_NETWORK=localhost
LOCAL_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=your_local_contract_address
```

Meaning:

```text
PORT
```

The backend server port.

```text
DATABASE_URL
```

PostgreSQL connection string.

```text
JWT_SECRET
```

Secret text used to sign login tokens.

```text
BLOCKCHAIN_NETWORK
```

Current blockchain network.

For local development:

```text
localhost
```

```text
LOCAL_RPC_URL
```

Local Hardhat blockchain RPC URL.

```text
CONTRACT_ADDRESS
```

Your deployed local smart contract address from Phase 5.

Important:

```text
Do not commit .env to GitHub.
```

Your project `.gitignore` already ignores `.env`.

## 11. Create `.env.example`

Run:

```bash
touch .env.example
```

Open:

```bash
code .env.example
```

Add:

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=
BLOCKCHAIN_NETWORK=
LOCAL_RPC_URL=
SEPOLIA_RPC_URL=
SEPOLIA_PRIVATE_KEY=
CONTRACT_ADDRESS=
```

Meaning:

```text
.env.example
```

Shows other developers which environment variables are needed.

It should not contain real secrets.

## 12. Run the Backend

Run:

```bash
npm run dev
```

Expected output:

```text
Backend running on port 5000
```

Keep this terminal open while testing.

## 13. Test the Health API

Open your browser:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "certificate-backend"
}
```

Or test using terminal:

```bash
curl http://localhost:5000/api/health
```

Expected:

```json
{"status":"ok","service":"certificate-backend"}
```

## 14. Initialize Prisma

Run:

```bash
npx prisma init
```

This creates:

```text
prisma/schema.prisma
```

Meaning:

```text
schema.prisma
```

This file will define your PostgreSQL database tables later.

For now, do not create all models yet unless you are ready for the database phase.

## 15. Current Backend Structure

After this phase, your backend should look like this:

```text
backend/
  node_modules/
  prisma/
    schema.prisma
  src/
    controllers/
    middleware/
    routes/
    services/
    uploads/
    utils/
    server.js
  .env
  .env.example
  package.json
  package-lock.json
```

## 16. Common Errors

### Error: Cannot use import statement outside a module

Problem:

```text
package.json does not have "type": "module".
```

Fix:

Add this to `backend/package.json`:

```json
"type": "module"
```

### Error: nodemon command not found

Problem:

```text
nodemon was not installed.
```

Fix:

```bash
npm install --save-dev nodemon
```

### Error: address already in use

Problem:

```text
Port 5000 is already being used by another app.
```

Fix:

Change `.env`:

```env
PORT=5001
```

Then run again:

```bash
npm run dev
```

### Error: Cannot find module

Problem:

```text
Package was not installed.
```

Fix:

```bash
npm install
```

## 17. Phase 7 Completion Checklist

Phase 7 is complete when:

```text
backend/package.json exists
backend/src/server.js exists
backend/.env exists
backend/.env.example exists
backend/prisma/schema.prisma exists
npm run dev starts successfully
GET /api/health returns status ok
```

Next phase:

```text
Phase 8: Add backend environment variables and configuration
```

After that:

```text
Phase 9: Create Prisma PostgreSQL database schema
```
