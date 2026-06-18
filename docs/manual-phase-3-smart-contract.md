# Manual Phase 3: Create the Smart Contract

This guide is for doing Phase 3 manually.

You will create the certificate smart contract yourself, copy the code step by step, and run the commands manually.

## 1. Where Did `Counter.sol` and `Counter.t.sol` Come From?

When you ran:

```bash
npx hardhat --init
```

Hardhat created example files for you.

These files are not from your certificate project idea. They are starter example files from the Hardhat template.

Current example files:

```text
contracts/Counter.sol
contracts/Counter.t.sol
test/Counter.ts
ignition/modules/Counter.ts
```

Meaning:

```text
contracts/Counter.sol
```

This is a simple example smart contract. It has a number called `x` and functions to increase it.

```text
contracts/Counter.t.sol
```

This is a Solidity test file for `Counter.sol`.

```text
test/Counter.ts
```

This is a TypeScript test file for `Counter.sol`.

```text
ignition/modules/Counter.ts
```

This is a Hardhat Ignition deployment module for the example counter contract.

You can keep them while learning. Later, when your own certificate contract works, you can delete or ignore the counter example.

## 2. Create Your Certificate Contract File

Run this command:

```bash
touch contracts/CertificateRegistry.sol
```

Open the file:

```bash
code contracts/CertificateRegistry.sol
```

## 3. Add License and Solidity Version

Copy this first:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
```

Meaning:

```text
// SPDX-License-Identifier: UNLICENSED
```

This tells tools the license of your contract.

```text
pragma solidity ^0.8.28;
```

This tells Hardhat which Solidity compiler version can compile your contract.

## 4. Create the Contract

Add this below the first two lines:

```solidity
contract CertificateRegistry {

}
```

Meaning:

```text
contract CertificateRegistry
```

This creates a smart contract named `CertificateRegistry`.

A smart contract is like a program that will be stored on blockchain.

At this point your file should look like this:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract CertificateRegistry {

}
```

## 5. Compile First

Because Hardhat v3 needs Node 22 or newer, run:

```bash
source ~/.nvm/nvm.sh
nvm use 22
npx hardhat compile
```

If it compiles, continue.

## 6. Add Certificate Data Structure

Inside the contract braces, add:

```solidity
  struct Certificate {
    bytes32 certificateHash;
    address issuer;
    uint256 issuedAt;
    bool isRevoked;
    bool exists;
  }
```

Your file should look like this:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract CertificateRegistry {
  struct Certificate {
    bytes32 certificateHash;
    address issuer;
    uint256 issuedAt;
    bool isRevoked;
    bool exists;
  }
}
```

Meaning:

```text
struct Certificate
```

Creates a custom data type for one certificate.

```text
bytes32 certificateHash
```

Stores the certificate hash. A hash is usually 32 bytes, so `bytes32` is suitable.

```text
address issuer
```

Stores the wallet address of the university or issuer.

```text
uint256 issuedAt
```

Stores the time when the certificate was issued.

```text
bool isRevoked
```

Stores whether the certificate has been revoked.

```text
bool exists
```

Helps the contract know if a certificate ID really exists.

Now compile again:

```bash
npx hardhat compile
```

## 7. Add Main Storage Variables

Add this below the `struct`:

```solidity
  address public admin;

  mapping(address => bool) public authorizedIssuers;
  mapping(bytes32 => Certificate) private certificates;
```

Your contract should now look like this:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract CertificateRegistry {
  struct Certificate {
    bytes32 certificateHash;
    address issuer;
    uint256 issuedAt;
    bool isRevoked;
    bool exists;
  }

  address public admin;

  mapping(address => bool) public authorizedIssuers;
  mapping(bytes32 => Certificate) private certificates;
}
```

Meaning:

```text
address public admin
```

Stores the admin wallet address.

```text
mapping(address => bool) public authorizedIssuers
```

Stores whether a wallet address is an approved certificate issuer.

Example idea:

```text
authorizedIssuers[0xUniversityWallet] = true
```

```text
mapping(bytes32 => Certificate) private certificates
```

Stores certificates by certificate ID.

Example idea:

```text
certificates[certificateId] = Certificate(...)
```

Compile again:

```bash
npx hardhat compile
```

## 8. Add Events

Add this below the mappings:

```solidity
  event IssuerAuthorized(address indexed issuer);
  event IssuerRemoved(address indexed issuer);
  event CertificateIssued(bytes32 indexed certificateId, bytes32 certificateHash, address indexed issuer);
  event CertificateRevoked(bytes32 indexed certificateId, address indexed revokedBy);
```

Meaning:

Events are blockchain logs. Your backend or frontend can read these logs later.

```text
IssuerAuthorized
```

Logs when admin approves an issuer.

```text
IssuerRemoved
```

Logs when admin removes an issuer.

```text
CertificateIssued
```

Logs when a certificate is issued.

```text
CertificateRevoked
```

Logs when a certificate is revoked.

`indexed` means the value is easier to search/filter in blockchain logs.

Compile again:

```bash
npx hardhat compile
```

## 9. Add Permission Modifiers

Add this below the events:

```solidity
  modifier onlyAdmin() {
    require(msg.sender == admin, "Only admin can do this");
    _;
  }

  modifier onlyAuthorizedIssuer() {
    require(authorizedIssuers[msg.sender], "Only authorized issuers can do this");
    _;
  }
```

Meaning:

```text
modifier
```

A modifier is reusable permission logic.

```text
msg.sender
```

The wallet address that called the function.

```text
require(...)
```

Checks a condition. If the condition is false, the transaction fails.

```text
_;
```

Means continue running the function after the check passes.

Compile again:

```bash
npx hardhat compile
```

## 10. Add Constructor

Add this below the modifiers:

```solidity
  constructor() {
    admin = msg.sender;
    authorizedIssuers[msg.sender] = true;
    emit IssuerAuthorized(msg.sender);
  }
```

Meaning:

```text
constructor()
```

Runs only one time, when the contract is deployed.

```text
admin = msg.sender
```

The deployer becomes the admin.

```text
authorizedIssuers[msg.sender] = true
```

The admin is also allowed to issue certificates.

```text
emit IssuerAuthorized(msg.sender)
```

Writes an event log.

Compile again:

```bash
npx hardhat compile
```

## 11. Add Issuer Management Functions

Add this below the constructor:

```solidity
  function authorizeIssuer(address issuer) public onlyAdmin {
    require(issuer != address(0), "Invalid issuer address");
    authorizedIssuers[issuer] = true;
    emit IssuerAuthorized(issuer);
  }

  function removeIssuer(address issuer) public onlyAdmin {
    require(issuer != address(0), "Invalid issuer address");
    authorizedIssuers[issuer] = false;
    emit IssuerRemoved(issuer);
  }
```

Meaning:

```text
authorizeIssuer
```

Admin uses this to approve a university wallet.

```text
removeIssuer
```

Admin uses this to remove a university wallet.

```text
address(0)
```

The zero address. It is treated as an invalid wallet address.

Compile again:

```bash
npx hardhat compile
```

## 12. Add Certificate Issuing Function

Add this below the issuer functions:

```solidity
  function issueCertificate(bytes32 certificateId, bytes32 certificateHash) public onlyAuthorizedIssuer {
    require(certificateId != bytes32(0), "Invalid certificate ID");
    require(certificateHash != bytes32(0), "Invalid certificate hash");
    require(!certificates[certificateId].exists, "Certificate already exists");

    certificates[certificateId] = Certificate({
      certificateHash: certificateHash,
      issuer: msg.sender,
      issuedAt: block.timestamp,
      isRevoked: false,
      exists: true
    });

    emit CertificateIssued(certificateId, certificateHash, msg.sender);
  }
```

Meaning:

```text
issueCertificate
```

Stores a new certificate hash on blockchain.

```text
onlyAuthorizedIssuer
```

Only approved universities can call this function.

```text
block.timestamp
```

The current blockchain timestamp.

```text
isRevoked: false
```

New certificates are valid by default.

Compile again:

```bash
npx hardhat compile
```

## 13. Add Certificate Revoke Function

Add this below `issueCertificate`:

```solidity
  function revokeCertificate(bytes32 certificateId) public {
    Certificate storage certificate = certificates[certificateId];

    require(certificate.exists, "Certificate does not exist");
    require(msg.sender == admin || msg.sender == certificate.issuer, "Only admin or issuer can revoke");
    require(!certificate.isRevoked, "Certificate is already revoked");

    certificate.isRevoked = true;

    emit CertificateRevoked(certificateId, msg.sender);
  }
```

Meaning:

```text
Certificate storage certificate
```

Loads the certificate from blockchain storage.

```text
msg.sender == admin || msg.sender == certificate.issuer
```

Allows admin or the original issuer to revoke.

```text
certificate.isRevoked = true
```

Marks the certificate as revoked.

Compile again:

```bash
npx hardhat compile
```

## 14. Add Verification Function

Add this below `revokeCertificate`:

```solidity
  function verifyCertificate(bytes32 certificateId, bytes32 certificateHash) public view returns (bool) {
    Certificate storage certificate = certificates[certificateId];

    return certificate.exists && !certificate.isRevoked && certificate.certificateHash == certificateHash;
  }
```

Meaning:

```text
view
```

The function only reads blockchain data. It does not change anything.

```text
returns (bool)
```

The function returns `true` or `false`.

It returns `true` only when:

```text
certificate exists
certificate is not revoked
certificate hash matches
```

Compile again:

```bash
npx hardhat compile
```

## 15. Add Get Certificate Function

Add this below `verifyCertificate`:

```solidity
  function getCertificate(
    bytes32 certificateId
  ) public view returns (bytes32 certificateHash, address issuer, uint256 issuedAt, bool isRevoked) {
    Certificate storage certificate = certificates[certificateId];

    require(certificate.exists, "Certificate does not exist");

    return (certificate.certificateHash, certificate.issuer, certificate.issuedAt, certificate.isRevoked);
  }
```

Meaning:

```text
getCertificate
```

Reads certificate information from blockchain.

It returns:

```text
certificateHash
issuer
issuedAt
isRevoked
```

Compile again:

```bash
npx hardhat compile
```

## 16. Final Complete Contract

After all steps, your full file should look like this:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract CertificateRegistry {
  struct Certificate {
    bytes32 certificateHash;
    address issuer;
    uint256 issuedAt;
    bool isRevoked;
    bool exists;
  }

  address public admin;

  mapping(address => bool) public authorizedIssuers;
  mapping(bytes32 => Certificate) private certificates;

  event IssuerAuthorized(address indexed issuer);
  event IssuerRemoved(address indexed issuer);
  event CertificateIssued(bytes32 indexed certificateId, bytes32 certificateHash, address indexed issuer);
  event CertificateRevoked(bytes32 indexed certificateId, address indexed revokedBy);

  modifier onlyAdmin() {
    require(msg.sender == admin, "Only admin can do this");
    _;
  }

  modifier onlyAuthorizedIssuer() {
    require(authorizedIssuers[msg.sender], "Only authorized issuers can do this");
    _;
  }

  constructor() {
    admin = msg.sender;
    authorizedIssuers[msg.sender] = true;
    emit IssuerAuthorized(msg.sender);
  }

  function authorizeIssuer(address issuer) public onlyAdmin {
    require(issuer != address(0), "Invalid issuer address");
    authorizedIssuers[issuer] = true;
    emit IssuerAuthorized(issuer);
  }

  function removeIssuer(address issuer) public onlyAdmin {
    require(issuer != address(0), "Invalid issuer address");
    authorizedIssuers[issuer] = false;
    emit IssuerRemoved(issuer);
  }

  function issueCertificate(bytes32 certificateId, bytes32 certificateHash) public onlyAuthorizedIssuer {
    require(certificateId != bytes32(0), "Invalid certificate ID");
    require(certificateHash != bytes32(0), "Invalid certificate hash");
    require(!certificates[certificateId].exists, "Certificate already exists");

    certificates[certificateId] = Certificate({
      certificateHash: certificateHash,
      issuer: msg.sender,
      issuedAt: block.timestamp,
      isRevoked: false,
      exists: true
    });

    emit CertificateIssued(certificateId, certificateHash, msg.sender);
  }

  function revokeCertificate(bytes32 certificateId) public {
    Certificate storage certificate = certificates[certificateId];

    require(certificate.exists, "Certificate does not exist");
    require(msg.sender == admin || msg.sender == certificate.issuer, "Only admin or issuer can revoke");
    require(!certificate.isRevoked, "Certificate is already revoked");

    certificate.isRevoked = true;

    emit CertificateRevoked(certificateId, msg.sender);
  }

  function verifyCertificate(bytes32 certificateId, bytes32 certificateHash) public view returns (bool) {
    Certificate storage certificate = certificates[certificateId];

    return certificate.exists && !certificate.isRevoked && certificate.certificateHash == certificateHash;
  }

  function getCertificate(
    bytes32 certificateId
  ) public view returns (bytes32 certificateHash, address issuer, uint256 issuedAt, bool isRevoked) {
    Certificate storage certificate = certificates[certificateId];

    require(certificate.exists, "Certificate does not exist");

    return (certificate.certificateHash, certificate.issuer, certificate.issuedAt, certificate.isRevoked);
  }
}
```

## 17. Final Compile

Run:

```bash
source ~/.nvm/nvm.sh
nvm use 22
npx hardhat compile
```

Expected result:

```text
Compiled Solidity files successfully
```

If compile succeeds, Phase 3 is complete.

Next phase:

```text
Phase 4: Write tests for CertificateRegistry.sol
```
