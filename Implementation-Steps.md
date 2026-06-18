# Detailed Implementation Steps

This guide explains how to build the Blockchain-Based Academic Certificate Verification project step by step.

The recommended order is:

1. Build and test everything locally.
2. Use Hardhat local Ethereum for blockchain development.
3. Use local PostgreSQL for database development.
4. Deploy the smart contract to Sepolia.
5. Deploy the database, backend, and frontend.

## Phase 1: Prepare Tools

Install these tools first:

```text
Node.js
npm
Git
PostgreSQL
MetaMask browser extension
VS Code
```

Check installation:

```bash
node -v
npm -v
git --version
psql --version
```

Create the main project folders:

```bash
mkdir contracts backend frontend scripts test docs
```

Recommended final structure:

```text
Blockchain-Certificate-Verification/
  contracts/
  backend/
  frontend/
  scripts/
  test/
  docs/
  Plan.md
  Implementation-Steps.md
```

## Phase 2: Create Hardhat Blockchain Project

Install Hardhat and blockchain packages in the root folder:

```bash
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npm install ethers
```

Initialize Hardhat:

```bash
npx hardhat init
```

Choose a JavaScript project.

After setup, your project should include:

```text
contracts/
scripts/
test/
hardhat.config.js
```

## Phase 3: Create Smart Contract

Create:

```text
contracts/CertificateRegistry.sol
```

Contract responsibilities:

1. Store certificate hash.
2. Store issuer wallet address.
3. Store issued date.
4. Store revoked status.
5. Allow admin to approve issuers.
6. Allow approved issuers to issue certificates.
7. Allow certificate verification.
8. Allow certificate revocation.

Important blockchain rule:

```text
Store only hash and minimum metadata on-chain.
Do not store full student personal data on-chain.
```

Suggested contract functions:

```text
authorizeIssuer(address issuer)
removeIssuer(address issuer)
issueCertificate(bytes32 certificateId, bytes32 certificateHash)
revokeCertificate(bytes32 certificateId)
verifyCertificate(bytes32 certificateId, bytes32 certificateHash)
getCertificate(bytes32 certificateId)
```

## Phase 4: Test Smart Contract Locally

Create test file:

```text
test/CertificateRegistry.test.js
```

Test these cases:

1. Admin can authorize issuer.
2. Non-admin cannot authorize issuer.
3. Authorized issuer can issue certificate.
4. Unauthorized issuer cannot issue certificate.
5. Certificate can be verified with correct hash.
6. Certificate fails verification with wrong hash.
7. Certificate can be revoked.
8. Revoked certificate is not valid.
9. Duplicate certificate ID is rejected.

Run tests:

```bash
npx hardhat test
```

## Phase 5: Deploy Contract Locally

Create deployment script:

```text
scripts/deploy.js
```

Start local Ethereum blockchain:

```bash
npx hardhat node
```

Open another terminal and deploy:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address.

Example:

```text
CertificateRegistry deployed to: 0x123...
```

This address will be used by the backend.

## Phase 6: Create Local PostgreSQL Database

Detailed manual:

```text
docs/manual-phase-6-local-postgresql-database.md
```

Create local database:

```bash
createdb certificate_db
```

If using `psql`:

```bash
psql postgres
CREATE DATABASE certificate_db;
\q
```

Local database URL example:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/certificate_db
```

Recommended local development URL:

```env
DATABASE_URL=postgresql://certificate_user:certificate_password@localhost:5432/certificate_db
```

Test the connection:

```bash
psql "postgresql://certificate_user:certificate_password@localhost:5432/certificate_db"
```

## Phase 7: Create Backend

Go to backend folder:

```bash
cd backend
npm init -y
```

Install packages:

```bash
npm install express cors dotenv bcrypt jsonwebtoken prisma @prisma/client ethers multer qrcode pdfkit
npm install --save-dev nodemon
```

Initialize Prisma:

```bash
npx prisma init
```

Create backend folders:

```bash
mkdir -p src/controllers src/routes src/services src/middleware src/utils
```

Recommended backend structure:

```text
backend/
  prisma/
    schema.prisma
  src/
    server.js
    controllers/
    routes/
    services/
    middleware/
    utils/
  .env
  .env.example
  package.json
```

## Phase 8: Add Backend Environment Variables

Detailed manual:

```text
docs/manual-phase-8-backend-environment-variables.md
```

Create:

```text
backend/.env
```

Local development example:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://certificate_user:certificate_password@localhost:5432/certificate_db
JWT_SECRET=change_this_secret_to_a_long_random_value
JWT_EXPIRES_IN=7d
BLOCKCHAIN_NETWORK=localhost
LOCAL_RPC_URL=http://127.0.0.1:8545
SEPOLIA_RPC_URL=
PRIVATE_KEY=
CONTRACT_ADDRESS=your_local_contract_address
```

Create:

```text
backend/.env.example
```

Example:

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

Do not commit real `.env` values.

## Phase 9: Create Prisma Database Schema

Detailed manual:

```text
docs/manual-phase-9-prisma-database-schema.md
```

Edit:

```text
backend/prisma/schema.prisma
```

Create these models:

```text
User
University
Certificate
VerificationLog
```

Minimum fields:

User:

```text
id
name
email
passwordHash
role
walletAddress
createdAt
```

University:

```text
id
name
email
walletAddress
isApproved
createdAt
```

Certificate:

```text
id
certificateId
studentName
studentEmail
studentId
programName
degreeName
graduationDate
issuerId
certificateHash
blockchainTxHash
status
pdfUrl
createdAt
revokedAt
```

VerificationLog:

```text
id
certificateId
verifierIp
result
verifiedAt
```

Run migration:

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name init
npx prisma generate
```

Open Prisma Studio to check database:

```bash
npx prisma studio
```

## Phase 10: Build Backend API

Create authentication APIs:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Create admin APIs:

```text
GET  /api/admin/issuers
POST /api/admin/issuers/:id/approve
POST /api/admin/issuers/:id/remove
```

Create certificate APIs:

```text
POST /api/certificates
GET  /api/certificates
GET  /api/certificates/:certificateId
POST /api/certificates/:certificateId/revoke
```

Create verification APIs:

```text
GET  /api/verify/:certificateId
POST /api/verify/upload
```

Backend services to create:

```text
authService
certificateService
blockchainService
pdfService
qrService
hashService
```

## Phase 11: Backend Blockchain Connection

Create:

```text
backend/src/services/blockchainService.js
```

This service should:

1. Read RPC URL from `.env`.
2. Connect to local Hardhat or Sepolia.
3. Load contract ABI.
4. Use contract address from `.env`.
5. Call `issueCertificate`.
6. Call `verifyCertificate`.
7. Call `revokeCertificate`.

For local development:

```text
RPC URL = http://127.0.0.1:8545
Network = localhost
```

For Sepolia:

```text
RPC URL = Alchemy or Infura Sepolia URL
Network = sepolia
```

Only configuration should change. The backend logic should stay the same.

## Phase 12: Certificate Issuing Flow

When issuer submits certificate form:

1. Backend checks issuer login.
2. Backend checks issuer is approved.
3. Backend creates a unique `certificateId`.
4. Backend creates certificate data.
5. Backend creates certificate hash.
6. Backend calls smart contract `issueCertificate`.
7. Blockchain returns transaction hash.
8. Backend stores metadata in PostgreSQL.
9. Backend generates QR code.
10. Backend generates PDF certificate.
11. Backend returns certificate data to frontend.

Certificate ID can be generated using UUID.

Certificate hash should be generated from stable certificate data, for example:

```text
certificateId
studentName
studentId
programName
degreeName
graduationDate
issuerWalletAddress
```

## Phase 13: Certificate Verification Flow

Verifier searches by certificate ID:

1. Frontend sends certificate ID to backend.
2. Backend reads certificate metadata from PostgreSQL.
3. Backend reads blockchain record.
4. Backend compares status.
5. Backend returns result.

Possible results:

```text
Valid
Invalid
Revoked
Not found
```

Verifier uploads certificate file:

1. Backend receives uploaded certificate.
2. Backend calculates uploaded file hash.
3. Backend compares it with blockchain hash.
4. Backend returns valid or invalid result.

## Phase 14: Create Frontend

Go to frontend folder:

```bash
cd ../frontend
npm create vite@latest . -- --template react
npm install
```

Install packages:

```bash
npm install axios react-router-dom ethers
```

Optional UI packages:

```bash
npm install lucide-react
```

Create frontend folders:

```bash
mkdir -p src/pages src/components src/services src/hooks
```

Recommended frontend structure:

```text
frontend/
  src/
    pages/
      Login.jsx
      Register.jsx
      Verify.jsx
      AdminDashboard.jsx
      IssuerDashboard.jsx
      IssueCertificate.jsx
      CertificateDetails.jsx
    components/
    services/
      api.js
    hooks/
    App.jsx
    main.jsx
  .env
  .env.example
  package.json
```

## Phase 15: Frontend Environment Variables

Create:

```text
frontend/.env
```

Local example:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CONTRACT_ADDRESS=your_local_contract_address
```

Production example:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_CONTRACT_ADDRESS=your_sepolia_contract_address
```

## Phase 16: Build Frontend Pages

Build pages in this order:

1. Login page.
2. Register page.
3. Admin dashboard.
4. Issuer dashboard.
5. Issue certificate form.
6. Certificate list page.
7. Certificate details page.
8. Public verify page.

Minimum public verification page should allow:

1. Enter certificate ID.
2. Show certificate status.
3. Show issuer name.
4. Show student name.
5. Show program name.
6. Show issue date.
7. Show revoked status if revoked.

## Phase 17: Local Full-System Test

Run local blockchain:

```bash
npx hardhat node
```

Deploy contract locally:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Run backend:

```bash
cd backend
npm run dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

Test complete local flow:

1. Register admin.
2. Register issuer.
3. Admin approves issuer.
4. Issuer creates certificate.
5. Certificate hash is stored on local blockchain.
6. Certificate metadata is stored in PostgreSQL.
7. Certificate PDF is generated.
8. Verification page shows valid.
9. Revoke certificate.
10. Verification page shows revoked.

## Phase 18: Prepare Sepolia Deployment

Create a new MetaMask wallet only for this project.

Add Sepolia network in MetaMask.

Get Sepolia test ETH from a faucet.

Create an RPC provider:

```text
Alchemy
Infura
QuickNode
```

Add Sepolia settings to:

```text
hardhat.config.js
```

Example environment:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
PRIVATE_KEY=your_test_wallet_private_key
```

Important:

```text
Use a test wallet.
Never share the private key.
Never commit the private key to GitHub.
```

## Phase 19: Deploy Smart Contract to Sepolia

Run:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the Sepolia contract address.

Update backend production environment:

```env
BLOCKCHAIN_NETWORK=sepolia
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
PRIVATE_KEY=your_test_wallet_private_key
CONTRACT_ADDRESS=your_sepolia_contract_address
```

Update frontend production environment:

```env
VITE_CONTRACT_ADDRESS=your_sepolia_contract_address
```

## Phase 20: Deploy PostgreSQL Database

Recommended free database options:

```text
Neon PostgreSQL
Supabase PostgreSQL
```

Create a database and copy the database URL.

Production database URL example:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

Run Prisma migration on production database:

```bash
cd backend
npx prisma migrate deploy
```

## Phase 21: Deploy Backend to Render

Push code to GitHub.

In Render:

1. Create new Web Service.
2. Connect GitHub repository.
3. Select backend folder as root directory if needed.
4. Add build command.
5. Add start command.
6. Add environment variables.

Build command example:

```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

Start command example:

```bash
npm start
```

Backend production environment variables:

```env
PORT=5000
DATABASE_URL=your_hosted_postgresql_url
JWT_SECRET=your_secure_secret
BLOCKCHAIN_NETWORK=sepolia
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_test_wallet_private_key
CONTRACT_ADDRESS=your_sepolia_contract_address
```

After deployment, copy backend URL:

```text
https://your-backend.onrender.com
```

## Phase 22: Deploy Frontend to Vercel

In Vercel:

1. Import GitHub repository.
2. Select frontend folder as root directory.
3. Add environment variables.
4. Deploy.

Frontend production environment:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_CONTRACT_ADDRESS=your_sepolia_contract_address
```

After deployment, copy frontend URL:

```text
https://your-project.vercel.app
```

## Phase 23: Public Demo Test

Test the deployed version:

1. Open frontend Vercel URL.
2. Register or log in as admin.
3. Register or create issuer.
4. Approve issuer.
5. Issue a certificate.
6. Confirm transaction on Sepolia.
7. Verify certificate by certificate ID.
8. Verify certificate using QR code.
9. Revoke certificate.
10. Verify again and confirm revoked status.

Check the transaction on Sepolia block explorer:

```text
https://sepolia.etherscan.io/
```

## Phase 24: Final Report Content

Your report should include:

1. Problem statement.
2. Objectives.
3. Scope.
4. Blockchain explanation.
5. Why certificate hash is stored instead of PDF.
6. System architecture.
7. Database design.
8. Smart contract design.
9. Screenshots.
10. Testing results.
11. Deployment explanation.
12. Limitations.
13. Future improvements.

## Phase 25: Final Presentation Demo Script

Use this demo flow:

1. Explain fake certificate problem.
2. Explain blockchain solution.
3. Show admin login.
4. Show issuer approval.
5. Show issuer creating certificate.
6. Show blockchain transaction.
7. Show certificate PDF with QR code.
8. Show verification page.
9. Show valid result.
10. Modify certificate data or file.
11. Show invalid result.
12. Revoke certificate.
13. Show revoked result.

## Recommended Build Order Summary

Follow this order:

```text
1. Smart contract
2. Smart contract tests
3. Local contract deployment
4. PostgreSQL schema
5. Backend APIs
6. Backend blockchain service
7. Certificate PDF and QR code
8. Frontend pages
9. Local full test
10. Sepolia contract deployment
11. Hosted PostgreSQL deployment
12. Render backend deployment
13. Vercel frontend deployment
14. Final demo and report
```

This order keeps the project manageable and avoids deployment problems before the local version works.
