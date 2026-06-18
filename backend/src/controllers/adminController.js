import prisma from "../utils/prisma.js";
import { getBlockchainService } from "../services/blockchainService.js";

export async function listIssuers(req, res) {
  const issuers = await prisma.user.findMany({
    where: { role: "ISSUER" },
    include: { university: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(issuers.map(({ passwordHash, ...u }) => u));
}

export async function approveIssuer(req, res) {
  const id = Number(req.params.id);
  const issuer = await prisma.user.findUnique({ where: { id }, include: { university: true } });
  if (!issuer || issuer.role !== "ISSUER") return res.status(404).json({ error: "Issuer not found" });

  // Authorize issuer on blockchain if they have a wallet address
  if (issuer.walletAddress) {
    try {
      const bc = await getBlockchainService();
      await bc.authorizeIssuer(issuer.walletAddress);
    } catch (err) {
      console.warn("Blockchain authorize failed (may already be authorized):", err.message);
    }
  }

  // Update or create university record as approved
  if (issuer.university) {
    await prisma.university.update({ where: { id: issuer.university.id }, data: { isApproved: true } });
  } else if (issuer.walletAddress) {
    await prisma.university.upsert({
      where: { walletAddress: issuer.walletAddress },
      update: { isApproved: true },
      create: {
        name: issuer.name,
        email: issuer.email,
        walletAddress: issuer.walletAddress,
        isApproved: true,
        userId: issuer.id,
      },
    });
  }

  res.json({ message: "Issuer approved" });
}

export async function removeIssuer(req, res) {
  const id = Number(req.params.id);
  const issuer = await prisma.user.findUnique({ where: { id }, include: { university: true } });
  if (!issuer || issuer.role !== "ISSUER") return res.status(404).json({ error: "Issuer not found" });

  if (issuer.walletAddress) {
    try {
      const bc = await getBlockchainService();
      await bc.removeIssuer(issuer.walletAddress);
    } catch (err) {
      console.warn("Blockchain remove failed:", err.message);
    }
  }

  if (issuer.university) {
    await prisma.university.update({ where: { id: issuer.university.id }, data: { isApproved: false } });
  }

  res.json({ message: "Issuer removed" });
}
