# Blockchain-Based Academic Certificate Verification

## 1. Project Goal

Build a web application where an authorized university can issue academic certificates, store certificate proof on an Ethereum blockchain, and allow students or employers to verify whether a certificate is real, unchanged, and not revoked.

The project will use a local Ethereum blockchain during development. After the system works locally, the same smart contract will be deployed to the Sepolia Ethereum testnet for a public demo.

## 2. Main Concept

The full certificate file should not be stored directly on the blockchain because blockchain storage is expensive and not suitable for large files.

Instead, the system stores only a certificate hash on the blockchain.

Flow:

1. University creates a certificate.
2. System generates a PDF certificate.
3. System creates a hash from the certificate data or file.
4. The certificate hash is stored on blockchain.
5. The certificate metadata is stored in PostgreSQL.
6. Student receives the certificate with a QR code.
7. Employer verifies the certificate using certificate ID, QR code, or uploaded file.
8. System compares the submitted certificate hash with the blockchain hash.

If both hashes match and the certificate is not revoked, the certificate is valid.

## 3. Technology Stack

Frontend:

- React.js
- Vite
- Tailwind CSS
- Ethers.js

Backend:

- Node.js
- Express.js
- Prisma ORM
- JWT authentication

Database:

- PostgreSQL

Blockchain:

- Solidity
- Hardhat
- Local Hardhat network for development
- Sepolia testnet for public deployment

Wallet and blockchain access:

- MetaMask
- Alchemy, Infura, or another Sepolia RPC provider

Deployment:

- Frontend: Vercel free tier
- Backend: Render free tier
- Database: Neon free tier or Supabase free tier
- Temporary database option: Render PostgreSQL free tier, but free databases expire after 30 days
- Smart contract: Sepolia testnet

## 4. Why Use Local Ethereum First

During development, use Hardhat local blockchain because it is fast, free, and easy to reset.

Benefits:

- No real money needed.
- No testnet faucet needed.
- Faster testing.
- Easy to create test accounts.
- Easy to redeploy contract many times.

Local development command example:

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

After the local version works, deploy the same contract to Sepolia.

Sepolia deployment command example:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

The main code does not need to be rewritten. Only environment variables and network configuration change.

## 5. Local vs Sepolia Configuration

Local environment:

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/certificate_db
BLOCKCHAIN_NETWORK=localhost
LOCAL_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=local_contract_address_after_deploy
```

Sepolia environment:

```env
NODE_ENV=production
DATABASE_URL=hosted_postgresql_url
BLOCKCHAIN_NETWORK=sepolia
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=sepolia_contract_address_after_deploy
```

Important:

- Do not upload `.env` files to GitHub.
- Do not share private keys.
- Use a test wallet only for Sepolia.
- Use Sepolia ETH from a faucet, not real ETH.

## 6. System Roles

Admin:

- Logs in to the system.
- Approves universities or issuers.
- Removes unauthorized issuers.
- Can view all certificates.

University or Issuer:

- Logs in to the system.
- Creates academic certificates.
- Issues certificate proof to blockchain.
- Can revoke a certificate.

Student:

- Receives certificate PDF.
- Can view own certificates.
- Can share certificate ID or QR code.

Verifier or Employer:

- Does not need an account.
- Searches by certificate ID or scans QR code.
- Can upload certificate file for hash verification.
- Sees certificate status: valid, invalid, or revoked.

## 7. Core Features

Required features:

1. Admin login.
2. Issuer login.
3. Admin approves issuer wallet address.
4. Issuer creates certificate.
5. Backend generates certificate hash.
6. Smart contract stores certificate hash.
7. PostgreSQL stores certificate metadata.
8. Certificate PDF is generated.
9. QR code is added to certificate.
10. Public verification page checks blockchain record.
11. Issuer can revoke a certificate.
12. Verifier can detect modified or fake certificates.

Optional features:

1. Student account and dashboard.
2. Email notification.
3. IPFS file storage.
4. Verification history.
5. Certificate search filters.
6. Multi-university support.

## 8. Smart Contract Design

Contract name:

```text
CertificateRegistry.sol
```

Certificate data stored on blockchain:

```text
certificateId
certificateHash
issuerAddress
issuedAt
isRevoked
```

Recommended: store only minimum data on blockchain. Keep personal details like student name, email, and course in PostgreSQL to reduce privacy risk and blockchain cost.

Main functions:

```text
authorizeIssuer(address issuer)
removeIssuer(address issuer)
issueCertificate(bytes32 certificateId, bytes32 certificateHash)
revokeCertificate(bytes32 certificateId)
verifyCertificate(bytes32 certificateId, bytes32 certificateHash)
getCertificate(bytes32 certificateId)
```

Rules:

- Only admin can authorize issuers.
- Only authorized issuers can issue certificates.
- Only the original issuer or admin can revoke a certificate.
- A revoked certificate should not verify as valid.
- A certificate ID should not be issued twice.

## 9. PostgreSQL Database Design

PostgreSQL stores application data that is useful for login, searching, dashboards, and display.

Suggested tables:

```text
users
universities
certificates
verification_logs
```

users:

```text
id
name
email
password_hash
role
wallet_address
created_at
```

universities:

```text
id
name
email
wallet_address
is_approved
created_at
```

certificates:

```text
id
certificate_id
student_name
student_email
student_id
program_name
degree_name
graduation_date
issuer_id
certificate_hash
blockchain_tx_hash
status
pdf_url
created_at
revoked_at
```

verification_logs:

```text
id
certificate_id
verifier_ip
result
verified_at
```

## 10. Backend API Plan

Authentication:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Admin:

```text
GET   /api/admin/issuers
POST  /api/admin/issuers/:id/approve
POST  /api/admin/issuers/:id/remove
```

Certificates:

```text
POST /api/certificates
GET  /api/certificates
GET  /api/certificates/:certificateId
POST /api/certificates/:certificateId/revoke
```

Verification:

```text
GET  /api/verify/:certificateId
POST /api/verify/upload
```

The backend will:

- Validate user permissions.
- Generate certificate ID.
- Generate certificate hash.
- Call smart contract functions.
- Save metadata to PostgreSQL.
- Generate PDF and QR code.
- Return verification result.

## 11. Frontend Page Plan

Public pages:

```text
/login
/register
/verify
/certificate/:certificateId
```

Admin pages:

```text
/admin/dashboard
/admin/issuers
/admin/certificates
```

Issuer pages:

```text
/issuer/dashboard
/issuer/issue-certificate
/issuer/certificates
/issuer/certificates/:certificateId
```

Student pages, optional:

```text
/student/dashboard
/student/certificates
```

## 12. Project Folder Structure

```text
Blockchain-Certificate-Verification/
  contracts/
    CertificateRegistry.sol

  backend/
    src/
      controllers/
      routes/
      services/
      middleware/
      utils/
      prisma/
    package.json
    .env.example

  frontend/
    src/
      pages/
      components/
      services/
      hooks/
    package.json
    .env.example

  scripts/
    deploy.js

  test/
    CertificateRegistry.test.js

  docs/
    architecture.md
    demo-script.md
```

## 13. Implementation Milestones

Milestone 1: Project setup

1. Create Hardhat project.
2. Create React frontend.
3. Create Express backend.
4. Create PostgreSQL database.
5. Configure Prisma.
6. Add `.env.example` files.

Milestone 2: Smart contract

1. Write `CertificateRegistry.sol`.
2. Add admin and issuer permissions.
3. Add certificate issue function.
4. Add certificate verify function.
5. Add certificate revoke function.
6. Write smart contract tests.

Milestone 3: Backend

1. Add authentication with JWT.
2. Add Prisma models.
3. Add issuer approval APIs.
4. Add certificate creation API.
5. Add blockchain service using Ethers.js.
6. Add verification APIs.

Milestone 4: Certificate generation

1. Generate certificate PDF.
2. Generate QR code.
3. Add verification link to QR code.
4. Store PDF path or hosted URL in PostgreSQL.

Milestone 5: Frontend

1. Build login/register pages.
2. Build admin dashboard.
3. Build issuer dashboard.
4. Build certificate issue form.
5. Build public verification page.
6. Display valid, invalid, and revoked states.

Milestone 6: Local testing

1. Run local Hardhat blockchain.
2. Deploy contract locally.
3. Issue a certificate.
4. Verify the certificate.
5. Modify certificate data and verify again.
6. Revoke certificate and verify again.

Milestone 7: Sepolia deployment

1. Create test wallet.
2. Get Sepolia ETH from faucet.
3. Create Sepolia RPC URL using Alchemy or Infura.
4. Add Sepolia config to Hardhat.
5. Deploy smart contract to Sepolia.
6. Update backend `CONTRACT_ADDRESS`.
7. Test issuing and verifying on Sepolia.

Milestone 8: App deployment

1. Deploy PostgreSQL database using Neon or Supabase.
2. Deploy backend to Render.
3. Deploy frontend to Vercel.
4. Add production environment variables.
5. Test the full public demo.

Milestone 9: Documentation and presentation

1. Write problem statement.
2. Explain why blockchain is used.
3. Explain why only hashes are stored on-chain.
4. Add architecture diagram.
5. Add database diagram.
6. Add smart contract explanation.
7. Add screenshots.
8. Add testing results.
9. Prepare final demo script.

## 14. Free Deployment Strategy

This project can be developed and demonstrated for free if it uses test infrastructure.

Free parts:

- Hardhat local blockchain is free.
- Sepolia testnet is free in real money, but needs test ETH.
- Vercel frontend hosting has a free tier.
- Render backend hosting has a free tier.
- PostgreSQL can be hosted on Neon or Supabase free tier.
- Render PostgreSQL can also be used for short demos, but the free database expires after 30 days.

Not free:

- Ethereum mainnet deployment.
- Ethereum mainnet certificate issuing.
- Paid hosting plans.
- Heavy production usage.

For this academic project, Sepolia is enough. Ethereum mainnet is not necessary.

## 15. Final Demo Scenario

Use this flow during presentation:

1. Admin logs in.
2. Admin approves a university issuer.
3. University logs in.
4. University issues a certificate for a student.
5. System stores certificate hash on blockchain.
6. System saves certificate metadata in PostgreSQL.
7. System generates certificate PDF with QR code.
8. Student or employer opens the verification page.
9. Verifier enters certificate ID or scans QR code.
10. System shows certificate is valid.
11. Change the certificate file or certificate data.
12. Verify again.
13. System shows invalid because the hash does not match.
14. Revoke the original certificate.
15. Verify again.
16. System shows revoked.

This demo clearly shows blockchain immutability, certificate authenticity, and tamper detection.
