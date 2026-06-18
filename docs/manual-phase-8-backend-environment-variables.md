# Manual Phase 8: Add Backend Environment Variables

This guide explains how to add backend environment variables for the Blockchain-Based Academic Certificate Verification project.

Phase 8 goal:

```text
Create safe backend configuration files so the Express backend can connect to PostgreSQL, JWT auth, and the local smart contract.
```

In this phase, you will:

1. Understand why `.env` is needed.
2. Create `backend/.env`.
3. Create `backend/.env.example`.
4. Add database, server, JWT, CORS, and blockchain values.
5. Make sure `.env` is ignored by Git.
6. Add a backend config helper.
7. Test that the backend can read environment variables.

Prisma models and database tables will be created in Phase 9.

## 1. Why We Need Environment Variables

Environment variables store configuration outside the source code.

They are used for values that change between local development and deployment.

Examples:

```text
backend port
database URL
JWT secret
frontend URL
local blockchain RPC URL
deployed smart contract address
Sepolia RPC URL
private key for blockchain transactions
```

Important:

```text
Do not hardcode secrets in JavaScript files.
Do not commit real .env files to GitHub.
Commit only .env.example.
```

## 2. Make Sure Previous Phases Are Complete

Before Phase 8, you should have:

```text
local PostgreSQL database from Phase 6
backend folder from Phase 7
backend/package.json
backend/src/server.js
backend/prisma/schema.prisma
local deployed contract address from Phase 5
```

Check:

```bash
ls backend
```

You should see:

```text
package.json
src
prisma
```

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

## 4. Create `backend/.env`

Run:

```bash
touch .env
```

Open it:

```bash
code .env
```

Add:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://certificate_user:certificate_password@localhost:5432/certificate_db

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d

BLOCKCHAIN_NETWORK=localhost
LOCAL_RPC_URL=http://127.0.0.1:8545
SEPOLIA_RPC_URL=
PRIVATE_KEY=
CONTRACT_ADDRESS=your_local_contract_address
```

Replace:

```text
your_local_contract_address
```

with the address from Phase 5.

Example:

```env
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 5. Meaning of Each Environment Variable

```text
NODE_ENV
```

Tells the backend whether it is running in development or production.

```text
PORT
```

The port used by the Express backend.

Example:

```text
http://localhost:5000
```

```text
FRONTEND_URL
```

The frontend URL allowed by CORS.

Local Vite usually uses:

```text
http://localhost:5173
```

```text
DATABASE_URL
```

PostgreSQL connection string used by Prisma.

```text
JWT_SECRET
```

Secret key used to sign and verify JWT login tokens.

Use a long random value.

```text
JWT_EXPIRES_IN
```

How long a login token remains valid.

Example:

```text
7d
```

```text
BLOCKCHAIN_NETWORK
```

Which blockchain environment the backend should use.

Local development:

```text
localhost
```

Later deployment:

```text
sepolia
```

```text
LOCAL_RPC_URL
```

RPC URL for the local Hardhat node.

Default:

```text
http://127.0.0.1:8545
```

```text
SEPOLIA_RPC_URL
```

RPC URL for Sepolia testnet.

Leave empty during local development.

```text
PRIVATE_KEY
```

Wallet private key used by the backend to sign blockchain transactions.

During local development, this can stay empty until the backend starts issuing certificates on-chain.

For Sepolia, use a test wallet only.

```text
CONTRACT_ADDRESS
```

Address of the deployed `CertificateRegistry` smart contract.

## 6. Create `backend/.env.example`

Run:

```bash
touch .env.example
```

Open it:

```bash
code .env.example
```

Add:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=7d

BLOCKCHAIN_NETWORK=localhost
LOCAL_RPC_URL=http://127.0.0.1:8545
SEPOLIA_RPC_URL=
PRIVATE_KEY=
CONTRACT_ADDRESS=
```

Meaning:

```text
.env.example
```

Shows other developers which variables are required.

It does not contain real secrets.

## 7. Check `.env` Is Ignored by Git

Open:

```bash
code .gitignore
```

Make sure it contains:

```text
.env
```

Check:

```bash
git status --short
```

You should not see:

```text
backend/.env
```

You should see:

```text
backend/.env.example
```

because `.env.example` is safe to commit.

## 8. Add a Config Folder

From inside `backend`, run:

```bash
mkdir -p src/config
```

Create:

```bash
touch src/config/env.js
```

Open it:

```bash
code src/config/env.js
```

Add:

```js
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "BLOCKCHAIN_NETWORK",
  "LOCAL_RPC_URL",
  "CONTRACT_ADDRESS",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  blockchainNetwork: process.env.BLOCKCHAIN_NETWORK,
  localRpcUrl: process.env.LOCAL_RPC_URL,
  sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL || "",
  privateKey: process.env.PRIVATE_KEY || "",
  contractAddress: process.env.CONTRACT_ADDRESS,
};
```

Meaning:

```text
requiredEnvVars
```

Lists variables the backend needs before it can start safely.

```text
throw new Error
```

Stops the backend immediately if an important value is missing.

This is better than starting the server and failing later.

## 9. Use the Config Helper in `server.js`

Open:

```bash
code src/server.js
```

Replace:

```js
import dotenv from "dotenv";

dotenv.config();
```

with:

```js
import { env } from "./config/env.js";
```

Then replace:

```js
const port = process.env.PORT || 5000;
```

with:

```js
const port = env.port;
```

Later, CORS can use:

```js
app.use(cors({
  origin: env.frontendUrl,
}));
```

For now, if the backend is still simple, this is also acceptable:

```js
app.use(cors());
```

## 10. Test the Backend

Run:

```bash
npm run dev
```

Expected result:

```text
Backend running on port 5000
```

Open another terminal and run:

```bash
curl http://localhost:5000/api/health
```

Expected result:

```json
{
  "status": "ok",
  "service": "certificate-backend"
}
```

## 11. Test Missing Environment Variable Behavior

Temporarily remove or rename:

```env
JWT_SECRET=replace_with_a_long_random_secret
```

Run:

```bash
npm run dev
```

Expected error:

```text
Missing required environment variable: JWT_SECRET
```

Add `JWT_SECRET` back before continuing.

## 12. Local vs Sepolia Values

Local development:

```env
BLOCKCHAIN_NETWORK=localhost
LOCAL_RPC_URL=http://127.0.0.1:8545
SEPOLIA_RPC_URL=
PRIVATE_KEY=
CONTRACT_ADDRESS=local_contract_address
```

Sepolia later:

```env
BLOCKCHAIN_NETWORK=sepolia
LOCAL_RPC_URL=http://127.0.0.1:8545
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
PRIVATE_KEY=your_test_wallet_private_key
CONTRACT_ADDRESS=sepolia_contract_address
```

Important:

```text
Never use a wallet with real funds for this project.
Never commit PRIVATE_KEY.
Never paste PRIVATE_KEY into screenshots or public chats.
```

## 13. Common Problem: Missing Required Environment Variable

If you see:

```text
Missing required environment variable: DATABASE_URL
```

Check:

```bash
ls -a
```

Make sure you are inside:

```text
backend
```

and that this file exists:

```text
.env
```

Then check that `.env` contains:

```env
DATABASE_URL=postgresql://certificate_user:certificate_password@localhost:5432/certificate_db
```

## 14. Common Problem: Wrong Contract Address

If `CONTRACT_ADDRESS` is wrong, the backend may fail later when calling the smart contract.

Check the local deployment output from Phase 5.

You can also check:

```bash
cat ../ignition/deployments/chain-31337/deployed_addresses.json
```

Expected shape:

```json
{
  "CertificateRegistryModule#CertificateRegistry": "0x..."
}
```

Copy that address into:

```env
CONTRACT_ADDRESS=0x...
```

## 15. Common Problem: Backend Port Already Used

If you see:

```text
address already in use
```

Change:

```env
PORT=5001
```

Then run:

```bash
npm run dev
```

Test:

```bash
curl http://localhost:5001/api/health
```

## 16. Common Problem: Frontend Cannot Call Backend

If the frontend cannot call the backend later, check:

```env
FRONTEND_URL=http://localhost:5173
```

Also check CORS in `src/server.js`:

```js
app.use(cors({
  origin: env.frontendUrl,
}));
```

If you use cookies later, CORS will also need credentials configuration.

For JWT Bearer token APIs, credentials are usually not required.

## 17. What Not To Do in Phase 8

Do not create Prisma models yet.

Do not create database tables manually.

Do not connect the smart contract service yet.

Do not add login/register routes yet.

Phase 8 is only about configuration.

## 18. Phase 8 Completion Checklist

Phase 8 is complete when:

```text
backend/.env exists
backend/.env.example exists
backend/.gitignore ignores .env
DATABASE_URL points to certificate_db
JWT_SECRET is set in .env
LOCAL_RPC_URL is set
CONTRACT_ADDRESS contains the local deployed contract address
src/config/env.js exists
npm run dev starts successfully
GET /api/health still works
backend/.env is not shown in git status
```

Next phase:

```text
Phase 9: Create Prisma PostgreSQL database schema
```
