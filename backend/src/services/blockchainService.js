import { ethers } from "ethers";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ABI lives in the root project artifacts folder
const ABI_PATH = resolve(
  __dirname,
  "../../../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json"
);

let _service = null;

export async function getBlockchainService() {
  if (_service) return _service;

  const rpcUrl = env.blockchainNetwork === "sepolia" ? env.sepoliaRpcUrl : env.localRpcUrl;
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const { abi } = JSON.parse(readFileSync(ABI_PATH, "utf8"));

  let contract;
  if (env.privateKey) {
    const wallet = new ethers.Wallet(env.privateKey, provider);
    contract = new ethers.Contract(env.contractAddress, abi, wallet);
  } else {
    // Use the first signer from the local node (Hardhat dev mode)
    const signer = await provider.getSigner(0);
    contract = new ethers.Contract(env.contractAddress, abi, signer);
  }

  _service = {
    async authorizeIssuer(address) {
      const tx = await contract.authorizeIssuer(address);
      return tx.wait();
    },

    async removeIssuer(address) {
      const tx = await contract.removeIssuer(address);
      return tx.wait();
    },

    async issueCertificate(certificateId, certificateHash) {
      const tx = await contract.issueCertificate(certificateId, certificateHash);
      const receipt = await tx.wait();
      return receipt.hash;
    },

    async revokeCertificate(certificateId) {
      const tx = await contract.revokeCertificate(certificateId);
      return tx.wait();
    },

    async verifyCertificate(certificateId, certificateHash) {
      return contract.verifyCertificate(certificateId, certificateHash);
    },

    async getCertificate(certificateId) {
      return contract.getCertificate(certificateId);
    },
  };

  return _service;
}
