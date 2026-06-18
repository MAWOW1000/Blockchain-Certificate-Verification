import { ethers } from "ethers";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import prisma from "../utils/prisma.js";
import { getBlockchainService } from "../services/blockchainService.js";

export async function verifyCertificate(req, res) {
  const { certificateId } = req.params;
  const verifierIp = req.ip;

  const cert = await prisma.certificate.findUnique({
    where: { certificateId },
    include: {
      issuer: { select: { name: true, email: true } },
      university: { select: { name: true } },
    },
  });

  if (!cert) {
    await logVerification(certificateId, verifierIp, "NOT_FOUND");
    return res.json({ result: "NOT_FOUND" });
  }

  if (cert.status === "REVOKED") {
    await logVerification(certificateId, verifierIp, "REVOKED");
    return res.json({ result: "REVOKED", certificate: sanitizeCert(cert) });
  }

  // Cross-check with blockchain
  const certIdBytes32 = ethers.id(certificateId);
  let bcValid = false;
  try {
    const bc = await getBlockchainService();
    bcValid = await bc.verifyCertificate(certIdBytes32, cert.certificateHash);
  } catch (err) {
    console.error("Blockchain verify error:", err.message);
  }

  const result = bcValid ? "VALID" : "INVALID";
  await logVerification(certificateId, verifierIp, result);

  res.json({ result, certificate: sanitizeCert(cert) });
}

export async function verifyByUpload(req, res) {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileBuffer = readFileSync(req.file.path);
  const fileHash = "0x" + createHash("sha256").update(fileBuffer).digest("hex");

  // Find certificate matching this file hash (PDF hash stored separately would be ideal,
  // but here we check certificateHash which is the content hash, not PDF hash)
  const cert = await prisma.certificate.findFirst({ where: { certificateHash: fileHash } });

  if (!cert) {
    return res.json({ result: "INVALID", message: "No matching certificate found for this file" });
  }

  if (cert.status === "REVOKED") {
    return res.json({ result: "REVOKED", certificate: cert });
  }

  return res.json({ result: "VALID", certificate: cert });
}

async function logVerification(certificateId, verifierIp, result) {
  try {
    await prisma.verificationLog.create({
      data: { certificateId, verifierIp, result },
    });
  } catch {
    // non-critical
  }
}

function sanitizeCert(cert) {
  return {
    certificateId: cert.certificateId,
    studentName: cert.studentName,
    programName: cert.programName,
    degreeName: cert.degreeName,
    graduationDate: cert.graduationDate,
    status: cert.status,
    issuerName: cert.issuer?.name,
    universityName: cert.university?.name,
    blockchainTxHash: cert.blockchainTxHash,
    revokedAt: cert.revokedAt,
  };
}
