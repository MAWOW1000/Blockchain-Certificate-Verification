import { network } from "hardhat";

const { ethers } = await network.create();

const [deployer] = await ethers.getSigners();
console.log("Deploying with account:", deployer.address);

const registry = await ethers.deployContract("CertificateRegistry");
await registry.waitForDeployment();

console.log("CertificateRegistry deployed to:", await registry.getAddress());
