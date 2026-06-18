# Manual Phase 5: Deploy the Contract Locally

This guide explains how to deploy `CertificateRegistry.sol` to a local Hardhat blockchain.

Phase 5 goal:

```text
Run a local Ethereum blockchain on your machine and deploy your certificate smart contract to it.
```

This is still free. No Sepolia, no real ETH, and no testnet ETH are needed yet.

## 1. What Local Deployment Means

When you deploy locally:

```text
Your computer runs a fake local Ethereum network.
Hardhat gives you test wallet accounts.
Hardhat gives those accounts fake ETH.
You deploy your contract to this local network.
You get a contract address.
```

This is useful because you can test many times without spending money.

## 2. Make Sure Previous Phases Are Complete

Before Phase 5, you should have:

```text
contracts/CertificateRegistry.sol
test/CertificateRegistry.ts
```

Compile:

```bash
source ~/.nvm/nvm.sh
nvm use 22
npx hardhat compile
```

Run tests:

```bash
npx hardhat test
```

Only continue when compile and tests pass.

## 3. Why Use Hardhat Ignition?

Your Hardhat template created this file:

```text
ignition/modules/Counter.ts
```

That file is a deployment module for the example `Counter` contract.

For your project, you will create a similar file:

```text
ignition/modules/CertificateRegistry.ts
```

Hardhat Ignition helps deploy contracts in a structured way.

## 4. Create the Deployment Module

Run:

```bash
touch ignition/modules/CertificateRegistry.ts
```

Open it:

```bash
code ignition/modules/CertificateRegistry.ts
```

## 5. Add Import

Copy this:

```ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
```

Meaning:

```text
buildModule
```

Creates a deployment module.

A deployment module tells Hardhat:

```text
which contract to deploy
which constructor arguments to use
what deployed contract to return
```

## 6. Create the Deployment Module

Add this below the import:

```ts
export default buildModule("CertificateRegistryModule", (m) => {
  const certificateRegistry = m.contract("CertificateRegistry");

  return { certificateRegistry };
});
```

Meaning:

```text
export default
```

Makes this module available to Hardhat.

```text
buildModule("CertificateRegistryModule", ...)
```

Creates a module named `CertificateRegistryModule`.

```text
(m) => { ... }
```

`m` is the module builder object.

```text
m.contract("CertificateRegistry")
```

Tells Hardhat to deploy the contract named `CertificateRegistry`.

This name must match:

```solidity
contract CertificateRegistry {
```

```text
return { certificateRegistry }
```

Returns the deployed contract object.

## 7. Final Complete Deployment Module

Your file should look like this:

```ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CertificateRegistryModule", (m) => {
  const certificateRegistry = m.contract("CertificateRegistry");

  return { certificateRegistry };
});
```

## 8. Start the Local Hardhat Blockchain

Open Terminal 1.

Run:

```bash
source ~/.nvm/nvm.sh
nvm use 22
npx hardhat node
```

Expected output:

```text
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
Accounts
========
Account #0: 0x...
Private Key: 0x...
```

Important:

```text
Keep this terminal open.
Do not close it while testing local deployment.
```

This terminal is now your local Ethereum blockchain.

## 9. About the Local Accounts

Hardhat shows test accounts like:

```text
Account #0
Account #1
Account #2
```

These accounts are fake local wallets.

They have fake local ETH.

Use them only for local testing.

Do not use Hardhat private keys on mainnet.

## 10. Deploy to Localhost

Open Terminal 2.

Run:

```bash
source ~/.nvm/nvm.sh
nvm use 22
npx hardhat ignition deploy ignition/modules/CertificateRegistry.ts --network localhost
```

If successful, Hardhat will print deployment information.

You should see a deployed contract address like:

```text
CertificateRegistryModule#CertificateRegistry - 0x123456...
```

This address is important.

You will use it later in:

```text
backend/.env
frontend/.env
```

## 11. What Happens During Deployment?

When you run the deploy command:

```text
Hardhat reads your deployment module.
Hardhat compiles the contract if needed.
Hardhat sends a deployment transaction.
The local blockchain mines the transaction.
The contract gets a local address.
```

The deployer wallet becomes the `admin` because your contract constructor has:

```solidity
admin = msg.sender;
```

So:

```text
The account that deploys the contract becomes admin.
```

## 12. Save the Local Contract Address

Create a note file:

```bash
touch docs/local-deployment-notes.md
```

Open:

```bash
code docs/local-deployment-notes.md
```

Write:

```md
# Local Deployment Notes

Network: localhost
RPC URL: http://127.0.0.1:8545
Contract: CertificateRegistry
Contract address: paste_your_contract_address_here
Deployed date: write_date_here
```

Later, your backend `.env` will use:

```env
LOCAL_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=paste_your_contract_address_here
```

## 13. Optional: Create a Local Environment Example

Create:

```bash
touch .env.example
```

Add:

```env
LOCAL_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=
SEPOLIA_RPC_URL=
SEPOLIA_PRIVATE_KEY=
```

Meaning:

```text
LOCAL_RPC_URL
```

The URL of your local Hardhat blockchain.

```text
CONTRACT_ADDRESS
```

The deployed certificate contract address.

```text
SEPOLIA_RPC_URL
```

Used later for public testnet deployment.

```text
SEPOLIA_PRIVATE_KEY
```

Used later for Sepolia deployment.

Do not put real secrets in `.env.example`.

## 14. Optional: Interact With Contract Using Hardhat Console

Keep Terminal 1 running:

```bash
npx hardhat node
```

Open Terminal 2:

```bash
source ~/.nvm/nvm.sh
nvm use 22
npx hardhat console --network localhost
```

Inside the console, get the contract:

```js
const { ethers } = await network.create();
```

Meaning:

```text
Hardhat v3 does not automatically create a global ethers variable in the console.
network.create() creates a network connection.
The ethers object comes from that network connection.
```

Then connect to your deployed contract:

```js
const registry = await ethers.getContractAt("CertificateRegistry", "paste_contract_address_here");
```

Important:

```text
Replace paste_contract_address_here with your real deployed contract address.
```

Example:

```js
const registry = await ethers.getContractAt(
  "CertificateRegistry",
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
);
```

Check admin:

```js
await registry.admin();
```

Create test values:

```js
const certificateId = ethers.id("CERT-001");
const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("student-name|course-name|2026"));
```

Issue certificate:

```js
await registry.issueCertificate(certificateId, certificateHash);
```

Verify certificate:

```js
await registry.verifyCertificate(certificateId, certificateHash);
```

Expected result:

```text
true
```

Revoke certificate:

```js
await registry.revokeCertificate(certificateId);
```

Verify again:

```js
await registry.verifyCertificate(certificateId, certificateHash);
```

Expected result:

```text
false
```

Exit console:

```js
.exit
```

## 15. Important Local Deployment Behavior

If you stop the Hardhat node:

```text
Local blockchain data is lost.
Local deployed contract is lost.
Local contract address will not work anymore.
```

If you restart:

```text
You must deploy again.
You will get a new local contract address.
```

This is normal.

Local deployment is only for development.

## 16. Common Errors

### Error: unsupported Node.js version

Problem:

```text
Hardhat v3 requires Node 22.13.0 or later.
```

Fix:

```bash
source ~/.nvm/nvm.sh
nvm use 22
```

### Error: localhost network not running

Problem:

```text
You tried to deploy to localhost, but Hardhat node is not running.
```

Fix:

Open Terminal 1 and run:

```bash
npx hardhat node
```

Then deploy again from Terminal 2.

### Error: contract not found

Problem:

```text
Hardhat cannot find CertificateRegistry.
```

Fix:

Check contract name:

```solidity
contract CertificateRegistry {
```

Check file:

```text
contracts/CertificateRegistry.sol
```

Compile:

```bash
npx hardhat compile
```

### Error: deployment already exists

Hardhat Ignition saves deployment state.

If you want to redeploy cleanly after changing the contract, you can remove local deployment state.

Be careful and only remove Ignition deployment files when you are sure.

Common local cleanup:

```bash
rm -rf ignition/deployments/chain-31337
```

Then deploy again:

```bash
npx hardhat ignition deploy ignition/modules/CertificateRegistry.ts --network localhost
```

## 17. Phase 5 Completion Checklist

Phase 5 is complete when:

```text
Hardhat local node runs successfully
CertificateRegistry deployment module exists
contract deploys to localhost
contract address is saved
admin can be read from the deployed contract
certificate can be issued locally
certificate can be verified locally
certificate can be revoked locally
```

Next phase:

```text
Phase 6: Create local PostgreSQL database
```
