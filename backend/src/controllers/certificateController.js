import { v4 as uuidv4 } from "uuid";
import { ethers } from "ethers";
import prisma from "../utils/prisma.js";
import { computeCertificateHash } from "../utils/hashService.js";
import { getBlockchainService } from "../services/blockchainService.js";
import { generateQRCode } from "../services/qrService.js";
import { generateCertificatePDF } from "../services/pdfService.js";
import { env } from "../config/env.js";

export async function issueCertificate(req, res) {
  const { studentName, studentEmail, studentId, programName, degreeName, graduationDate } = req.body;
  if (!studentName || !studentEmail || !studentId || !programName || !degreeName || !graduationDate) {
    return res.status(400).json({ error: "All certificate fields are required" });
  }

  const issuer = req.user;

  // Check issuer is approved via university record
  const university = await prisma.university.findFirst({ where: { userId: issuer.id, isApproved: true } });
  if (!university && issuer.role !== "ADMIN") {
    return res.status(403).json({ error: "Issuer is not approved" });
  }

  const certificateId = uuidv4();
  const issuerWallet = issuer.walletAddress || env.contractAddress;

  const certHash = computeCertificateHash({
    certificateId,
    studentName,
    studentId,
    programName,
    degreeName,
    graduationDate,
    issuerWalletAddress: issuerWallet,
  });

  // Convert UUID to bytes32 for blockchain
  const certIdBytes32 = ethers.id(certificateId);

  let blockchainTxHash = null;
  try {
    const bc = await getBlockchainService();
    blockchainTxHash = await bc.issueCertificate(certIdBytes32, certHash);
  } catch (err) {
    return res.status(500).json({ error: "Blockchain transaction failed: " + err.message });
  }

  const frontendUrl = env.frontendUrl;
  const verifyUrl = `${frontendUrl}/verify/${certificateId}`;
  const qrDataUrl = await generateQRCode(verifyUrl);

  const cert = await prisma.certificate.create({
    data: {
      certificateId,
      studentName,
      studentEmail,
      studentId,
      programName,
      degreeName,
      graduationDate: new Date(graduationDate),
      issuerId: issuer.id,
      universityId: university?.id || null,
      certificateHash: certHash,
      blockchainTxHash,
      status: "ISSUED",
    },
  });

  const pdfUrl = await generateCertificatePDF(
    { ...cert, universityName: university?.name },
    qrDataUrl
  );

  const updated = await prisma.certificate.update({
    where: { id: cert.id },
    data: { pdfUrl },
  });

  res.status(201).json(updated);
}

export async function listCertificates(req, res) {
  const where = req.user.role === "ADMIN" ? {} : { issuerId: req.user.id };
  const certs = await prisma.certificate.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(certs);
}

export async function getCertificate(req, res) {
  const cert = await prisma.certificate.findUnique({
    where: { certificateId: req.params.certificateId },
    include: { issuer: { select: { name: true, email: true } }, university: true },
  });
  if (!cert) return res.status(404).json({ error: "Certificate not found" });
  res.json(cert);
}

export async function revokeCertificate(req, res) {
  const cert = await prisma.certificate.findUnique({ where: { certificateId: req.params.certificateId } });
  if (!cert) return res.status(404).json({ error: "Certificate not found" });
  if (cert.status === "REVOKED") return res.status(400).json({ error: "Already revoked" });

  const certIdBytes32 = ethers.id(cert.certificateId);
  try {
    const bc = await getBlockchainService();
    await bc.revokeCertificate(certIdBytes32);
  } catch (err) {
    return res.status(500).json({ error: "Blockchain revocation failed: " + err.message });
  }

  const updated = await prisma.certificate.update({
    where: { id: cert.id },
    data: { status: "REVOKED", revokedAt: new Date() },
  });

  res.json(updated);
}
