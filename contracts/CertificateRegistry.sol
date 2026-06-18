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
