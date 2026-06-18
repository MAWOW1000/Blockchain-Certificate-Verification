import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "BLOCKCHAIN_NETWORK",
  "LOCAL_RPC_URL",
  "CONTRACT_ADDRESS",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  blockchainNetwork: process.env.BLOCKCHAIN_NETWORK,
  localRpcUrl: process.env.LOCAL_RPC_URL,
  sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL || "",
  privateKey: process.env.PRIVATE_KEY || "",
  contractAddress: process.env.CONTRACT_ADDRESS,
};
