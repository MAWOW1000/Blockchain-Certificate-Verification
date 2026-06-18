import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../utils/prisma.js";

export async function register(req, res) {
  const { name, email, password, role, walletAddress } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);

  // First registered user becomes ADMIN
  const count = await prisma.user.count();
  const assignedRole = count === 0 ? "ADMIN" : (role === "ISSUER" ? "ISSUER" : "STUDENT");

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: assignedRole, walletAddress: walletAddress || null },
  });

  const token = jwt.sign({ userId: user.id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  res.status(201).json({ token, user: sanitize(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  res.json({ token, user: sanitize(user) });
}

export async function me(req, res) {
  res.json(sanitize(req.user));
}

function sanitize(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}
