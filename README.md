# CertChain — Blockchain Certificate Verification

A full-stack system for issuing and verifying academic certificates, with certificate
hashes anchored on the Ethereum (Sepolia) blockchain. Universities issue tamper-proof
certificates; anyone can verify authenticity by certificate ID.

## 🔗 Live Demo

> _Deployment in progress — link will be added here once live._

**Demo admin login:**

| Field    | Value            |
| -------- | ---------------- |
| Email    | `admin@test.com` |
| Password | `admin123`       |

> ⚠️ This is a public demo account. The password can be changed from the admin panel.

## Architecture

| Layer        | Tech                                          |
| ------------ | --------------------------------------------- |
| Smart contract | Solidity (`CertificateRegistry.sol`), Hardhat 3 |
| Blockchain   | Ethereum Sepolia testnet                      |
| Backend      | Node.js, Express, Prisma ORM                  |
| Database     | PostgreSQL (Neon)                             |
| Frontend     | React + Vite                                  |
| Hosting      | Backend → Render · Frontend → Vercel          |

The blockchain stores only the certificate **hash** and minimal metadata — no personal
student data is written on-chain. Full metadata lives in PostgreSQL.

## Local Development

```bash
# 1. Local blockchain
npx hardhat node

# 2. Deploy contract (new terminal)
npx hardhat run scripts/deploy.ts --network localhost

# 3. Backend (new terminal)
cd backend
npm install
npm run prisma:generate
npm run dev

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173.

## Core Flow

1. Register (first user becomes admin) → admin approves issuers
2. Approved issuer issues a certificate → hash recorded on-chain, metadata in DB, PDF + QR generated
3. Anyone verifies by certificate ID → status cross-checked against the blockchain
4. Issuer/admin can revoke → verification then shows `REVOKED`

## Deployment

Deployment is automated via `render.yaml` (backend) and `frontend/vercel.json` (frontend).
See [Implementation-Steps.md](Implementation-Steps.md) phases 18–22 for the full guide.
