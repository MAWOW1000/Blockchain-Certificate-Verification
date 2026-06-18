import express from "express";
import cors from "cors";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import certificateRoutes from "./routes/certificates.js";
import verificationRoutes from "./routes/verification.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Serve generated PDFs
app.use("/uploads", express.static(resolve(__dirname, "../uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "certificate-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/verify", verificationRoutes);

app.listen(env.port, () => {
  console.log(`Backend running on port ${env.port}`);
});
