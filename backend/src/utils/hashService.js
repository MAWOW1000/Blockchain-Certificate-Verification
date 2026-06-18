import { ethers } from "ethers";

export function computeCertificateHash({
  certificateId,
  studentName,
  studentId,
  programName,
  degreeName,
  graduationDate,
  issuerWalletAddress,
}) {
  const data = [certificateId, studentName, studentId, programName, degreeName, graduationDate, issuerWalletAddress].join("|");
  return ethers.keccak256(ethers.toUtf8Bytes(data));
}

export function hashToBytes32(hexHash) {
  // ethers.keccak256 returns 0x-prefixed 32-byte hex — already bytes32 compatible
  return hexHash;
}
