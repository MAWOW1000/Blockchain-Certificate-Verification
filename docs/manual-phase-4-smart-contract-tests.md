# Manual Phase 4: Test the Smart Contract

This guide explains how to manually create tests for `CertificateRegistry.sol`.

Phase 4 goal:

```text
Prove that the smart contract works correctly before connecting it to backend/frontend.
```

You will write TypeScript tests using:

```text
Mocha
Chai
Ethers.js
Hardhat network
```

Your Hardhat template already uses this style in:

```text
test/Counter.ts
```

## 1. Why Do We Need Tests?

Smart contracts are difficult to change after deployment.

Testing helps you check:

1. Admin permissions work.
2. Issuer permissions work.
3. Certificates can be issued.
4. Fake hashes fail verification.
5. Certificates can be revoked.
6. Unauthorized users cannot do protected actions.
7. Duplicate certificate IDs are rejected.

For your project, tests are very important because blockchain transactions cost gas on real/test networks.

## 2. Make Sure Phase 3 Exists First

Before Phase 4, you must already have this file:

```text
contracts/CertificateRegistry.sol
```

Check:

```bash
ls contracts
```

You should see:

```text
CertificateRegistry.sol
Counter.sol
Counter.t.sol
```

If `CertificateRegistry.sol` does not exist, finish Phase 3 first.

## 3. Create Test File

Run:

```bash
touch test/CertificateRegistry.ts
```

Open it:

```bash
code test/CertificateRegistry.ts
```

## 4. Add Imports

Copy this first:

```ts
import { expect } from "chai";
import { network } from "hardhat";
```

Meaning:

```text
expect
```

Comes from Chai. It is used to check test results.

Example:

```ts
expect(value).to.equal(expectedValue);
```

```text
network
```

Comes from Hardhat. It lets the test create a local test blockchain environment.

## 5. Create Ethers Connection

Add this below the imports:

```ts
const { ethers } = await network.create();
```

Meaning:

```text
network.create()
```

Creates a temporary Hardhat blockchain network for tests.

```text
ethers
```

Lets your test deploy and call smart contracts.

## 6. Create Test Group

Add:

```ts
describe("CertificateRegistry", function () {

});
```

Meaning:

```text
describe
```

Groups related tests together.

```text
"CertificateRegistry"
```

The name of this test group.

## 7. Create Helper Function for Deployment

Inside `describe`, add:

```ts
  async function deployCertificateRegistry() {
    const [admin, issuer, otherUser] = await ethers.getSigners();
    const registry = await ethers.deployContract("CertificateRegistry");

    return { registry, admin, issuer, otherUser };
  }
```

Meaning:

```text
async function
```

Creates an asynchronous function because blockchain actions take time.

```text
ethers.getSigners()
```

Gets test wallet accounts from Hardhat.

```text
admin
```

The first wallet. It deploys the contract, so it becomes admin.

```text
issuer
```

The second wallet. We use it as a university issuer.

```text
otherUser
```

The third wallet. We use it to test unauthorized actions.

```text
ethers.deployContract("CertificateRegistry")
```

Deploys your smart contract to the local test blockchain.

```text
return { registry, admin, issuer, otherUser }
```

Returns the deployed contract and test wallets.

## 8. Create Test Data Helpers

Inside `describe`, below the deploy helper, add:

```ts
  function getTestCertificateId() {
    return ethers.id("CERT-001");
  }

  function getTestCertificateHash() {
    return ethers.keccak256(ethers.toUtf8Bytes("student-name|course-name|2026"));
  }
```

Meaning:

```text
ethers.id("CERT-001")
```

Converts the text `"CERT-001"` into a `bytes32` hash.

```text
ethers.toUtf8Bytes(...)
```

Converts text into bytes.

```text
ethers.keccak256(...)
```

Creates a blockchain-style hash.

In your real backend, certificate hashes will be generated from certificate data or files.

## 9. Test Admin Is Set Correctly

Inside `describe`, add:

```ts
  it("sets the deployer as admin", async function () {
    const { registry, admin } = await deployCertificateRegistry();

    expect(await registry.admin()).to.equal(admin.address);
  });
```

Meaning:

```text
it(...)
```

Defines one test case.

```text
registry.admin()
```

Reads the public `admin` variable from the contract.

```text
expect(...).to.equal(...)
```

Checks that the actual value equals the expected value.

Run tests:

```bash
source ~/.nvm/nvm.sh
nvm use 22
npx hardhat test
```

## 10. Test Admin Is Authorized Issuer by Default

Add:

```ts
  it("authorizes the admin as an issuer by default", async function () {
    const { registry, admin } = await deployCertificateRegistry();

    expect(await registry.authorizedIssuers(admin.address)).to.equal(true);
  });
```

Meaning:

The contract constructor should make the deployer:

```text
admin
authorized issuer
```

Run:

```bash
npx hardhat test
```

## 11. Test Admin Can Authorize Issuer

Add:

```ts
  it("allows admin to authorize an issuer", async function () {
    const { registry, issuer } = await deployCertificateRegistry();

    await expect(registry.authorizeIssuer(issuer.address))
      .to.emit(registry, "IssuerAuthorized")
      .withArgs(issuer.address);

    expect(await registry.authorizedIssuers(issuer.address)).to.equal(true);
  });
```

Meaning:

```text
registry.authorizeIssuer(issuer.address)
```

Calls the smart contract function to approve an issuer.

```text
to.emit(...)
```

Checks that the contract emitted an event.

```text
withArgs(...)
```

Checks the event data.

Run:

```bash
npx hardhat test
```

## 12. Test Non-Admin Cannot Authorize Issuer

Add:

```ts
  it("does not allow non-admin to authorize an issuer", async function () {
    const { registry, issuer, otherUser } = await deployCertificateRegistry();

    await expect(
      registry.connect(otherUser).authorizeIssuer(issuer.address),
    ).to.be.revertedWith("Only admin can do this");
  });
```

Meaning:

```text
registry.connect(otherUser)
```

Calls the contract using `otherUser` wallet instead of admin wallet.

```text
to.be.revertedWith(...)
```

Checks that the transaction failed with the expected error message.

Run:

```bash
npx hardhat test
```

## 13. Test Authorized Issuer Can Issue Certificate

Add:

```ts
  it("allows an authorized issuer to issue a certificate", async function () {
    const { registry, issuer } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.authorizeIssuer(issuer.address);

    await expect(registry.connect(issuer).issueCertificate(certificateId, certificateHash))
      .to.emit(registry, "CertificateIssued")
      .withArgs(certificateId, certificateHash, issuer.address);

    expect(await registry.verifyCertificate(certificateId, certificateHash)).to.equal(true);
  });
```

Meaning:

```text
authorizeIssuer
```

Admin approves the issuer first.

```text
connect(issuer)
```

The issuer wallet calls `issueCertificate`.

```text
verifyCertificate
```

Checks that the certificate is valid after issuing.

Run:

```bash
npx hardhat test
```

## 14. Test Unauthorized User Cannot Issue Certificate

Add:

```ts
  it("does not allow unauthorized users to issue certificates", async function () {
    const { registry, otherUser } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await expect(
      registry.connect(otherUser).issueCertificate(certificateId, certificateHash),
    ).to.be.revertedWith("Only authorized issuers can do this");
  });
```

Meaning:

An unapproved wallet should not be able to issue a certificate.

Run:

```bash
npx hardhat test
```

## 15. Test Wrong Hash Fails Verification

Add:

```ts
  it("returns false when certificate hash is wrong", async function () {
    const { registry } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();
    const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong-data"));

    await registry.issueCertificate(certificateId, certificateHash);

    expect(await registry.verifyCertificate(certificateId, wrongHash)).to.equal(false);
  });
```

Meaning:

This proves tampered or fake certificate data fails verification.

Run:

```bash
npx hardhat test
```

## 16. Test Duplicate Certificate ID Is Rejected

Add:

```ts
  it("does not allow duplicate certificate IDs", async function () {
    const { registry } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.issueCertificate(certificateId, certificateHash);

    await expect(registry.issueCertificate(certificateId, certificateHash)).to.be.revertedWith(
      "Certificate already exists",
    );
  });
```

Meaning:

The same certificate ID should not be issued twice.

Run:

```bash
npx hardhat test
```

## 17. Test Certificate Can Be Revoked

Add:

```ts
  it("allows the issuer to revoke a certificate", async function () {
    const { registry, issuer } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.authorizeIssuer(issuer.address);
    await registry.connect(issuer).issueCertificate(certificateId, certificateHash);

    await expect(registry.connect(issuer).revokeCertificate(certificateId))
      .to.emit(registry, "CertificateRevoked")
      .withArgs(certificateId, issuer.address);

    expect(await registry.verifyCertificate(certificateId, certificateHash)).to.equal(false);
  });
```

Meaning:

After revocation, the certificate should no longer verify as valid.

Run:

```bash
npx hardhat test
```

## 18. Test Unauthorized User Cannot Revoke Certificate

Add:

```ts
  it("does not allow unrelated users to revoke a certificate", async function () {
    const { registry, otherUser } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.issueCertificate(certificateId, certificateHash);

    await expect(
      registry.connect(otherUser).revokeCertificate(certificateId),
    ).to.be.revertedWith("Only admin or issuer can revoke");
  });
```

Meaning:

Only admin or the original issuer can revoke.

Run:

```bash
npx hardhat test
```

## 19. Test getCertificate

Add:

```ts
  it("returns certificate details", async function () {
    const { registry, admin } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.issueCertificate(certificateId, certificateHash);

    const certificate = await registry.getCertificate(certificateId);

    expect(certificate.certificateHash).to.equal(certificateHash);
    expect(certificate.issuer).to.equal(admin.address);
    expect(certificate.issuedAt).to.be.greaterThan(0n);
    expect(certificate.isRevoked).to.equal(false);
  });
```

Meaning:

This checks that stored certificate details can be read correctly.

Run:

```bash
npx hardhat test
```

## 20. Final Complete Test File

After adding all parts, `test/CertificateRegistry.ts` should look like this:

```ts
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("CertificateRegistry", function () {
  async function deployCertificateRegistry() {
    const [admin, issuer, otherUser] = await ethers.getSigners();
    const registry = await ethers.deployContract("CertificateRegistry");

    return { registry, admin, issuer, otherUser };
  }

  function getTestCertificateId() {
    return ethers.id("CERT-001");
  }

  function getTestCertificateHash() {
    return ethers.keccak256(ethers.toUtf8Bytes("student-name|course-name|2026"));
  }

  it("sets the deployer as admin", async function () {
    const { registry, admin } = await deployCertificateRegistry();

    expect(await registry.admin()).to.equal(admin.address);
  });

  it("authorizes the admin as an issuer by default", async function () {
    const { registry, admin } = await deployCertificateRegistry();

    expect(await registry.authorizedIssuers(admin.address)).to.equal(true);
  });

  it("allows admin to authorize an issuer", async function () {
    const { registry, issuer } = await deployCertificateRegistry();

    await expect(registry.authorizeIssuer(issuer.address))
      .to.emit(registry, "IssuerAuthorized")
      .withArgs(issuer.address);

    expect(await registry.authorizedIssuers(issuer.address)).to.equal(true);
  });

  it("does not allow non-admin to authorize an issuer", async function () {
    const { registry, issuer, otherUser } = await deployCertificateRegistry();

    await expect(
      registry.connect(otherUser).authorizeIssuer(issuer.address),
    ).to.be.revertedWith("Only admin can do this");
  });

  it("allows an authorized issuer to issue a certificate", async function () {
    const { registry, issuer } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.authorizeIssuer(issuer.address);

    await expect(registry.connect(issuer).issueCertificate(certificateId, certificateHash))
      .to.emit(registry, "CertificateIssued")
      .withArgs(certificateId, certificateHash, issuer.address);

    expect(await registry.verifyCertificate(certificateId, certificateHash)).to.equal(true);
  });

  it("does not allow unauthorized users to issue certificates", async function () {
    const { registry, otherUser } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await expect(
      registry.connect(otherUser).issueCertificate(certificateId, certificateHash),
    ).to.be.revertedWith("Only authorized issuers can do this");
  });

  it("returns false when certificate hash is wrong", async function () {
    const { registry } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();
    const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong-data"));

    await registry.issueCertificate(certificateId, certificateHash);

    expect(await registry.verifyCertificate(certificateId, wrongHash)).to.equal(false);
  });

  it("does not allow duplicate certificate IDs", async function () {
    const { registry } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.issueCertificate(certificateId, certificateHash);

    await expect(registry.issueCertificate(certificateId, certificateHash)).to.be.revertedWith(
      "Certificate already exists",
    );
  });

  it("allows the issuer to revoke a certificate", async function () {
    const { registry, issuer } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.authorizeIssuer(issuer.address);
    await registry.connect(issuer).issueCertificate(certificateId, certificateHash);

    await expect(registry.connect(issuer).revokeCertificate(certificateId))
      .to.emit(registry, "CertificateRevoked")
      .withArgs(certificateId, issuer.address);

    expect(await registry.verifyCertificate(certificateId, certificateHash)).to.equal(false);
  });

  it("does not allow unrelated users to revoke a certificate", async function () {
    const { registry, otherUser } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.issueCertificate(certificateId, certificateHash);

    await expect(
      registry.connect(otherUser).revokeCertificate(certificateId),
    ).to.be.revertedWith("Only admin or issuer can revoke");
  });

  it("returns certificate details", async function () {
    const { registry, admin } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.issueCertificate(certificateId, certificateHash);

    const certificate = await registry.getCertificate(certificateId);

    expect(certificate.certificateHash).to.equal(certificateHash);
    expect(certificate.issuer).to.equal(admin.address);
    expect(certificate.issuedAt).to.be.greaterThan(0n);
    expect(certificate.isRevoked).to.equal(false);
  });
});
```

## 21. Run All Tests

Run:

```bash
source ~/.nvm/nvm.sh
nvm use 22
npx hardhat test
```

Expected result:

```text
CertificateRegistry
  ✔ sets the deployer as admin
  ✔ authorizes the admin as an issuer by default
  ✔ allows admin to authorize an issuer
  ✔ does not allow non-admin to authorize an issuer
  ✔ allows an authorized issuer to issue a certificate
  ✔ does not allow unauthorized users to issue certificates
  ✔ returns false when certificate hash is wrong
  ✔ does not allow duplicate certificate IDs
  ✔ allows the issuer to revoke a certificate
  ✔ does not allow unrelated users to revoke a certificate
  ✔ returns certificate details
```

## 22. Common Errors

### Error: Contract not found

Problem:

```text
CertificateRegistry.sol does not exist or does not compile.
```

Fix:

```bash
npx hardhat compile
```

### Error: Node.js version unsupported

Problem:

```text
Hardhat v3 needs Node 22.13.0 or newer.
```

Fix:

```bash
source ~/.nvm/nvm.sh
nvm use 22
```

### Error: revertedWith message does not match

Problem:

The error message in your test is different from the message in your Solidity `require`.

Fix:

Make sure the test message exactly matches the contract message.

Example:

```solidity
require(msg.sender == admin, "Only admin can do this");
```

Test must use:

```ts
.to.be.revertedWith("Only admin can do this")
```

## 23. Phase 4 Completion Checklist

Phase 4 is complete when:

```text
CertificateRegistry.ts test file exists
all permission tests pass
all issue certificate tests pass
all verification tests pass
all revoke tests pass
npx hardhat test succeeds
```

Next phase:

```text
Phase 5: Deploy contract locally
```
