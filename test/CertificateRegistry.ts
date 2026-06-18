import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();


describe("CertificateRegistry", function () {
	async function deployCertificateRegistry() {
    		const [admin, issuer, otherUser] = await ethers.getSigners();
    		const registry = await ethers.deployContract("CertificateRegistry");

    	return { registry, admin, issuer, otherUser };
 	 }
	
	  function getTestCertificateId() {
    return ethers.id("CERT-001");
  }

  function getTestCertificateHash() {
    return ethers.keccak256(ethers.toUtf8Bytes("student-name|course-name|2026"));
  }

  it("sets the deployer as admin", async function () {
    const { registry, admin } = await deployCertificateRegistry();

    expect(await registry.admin()).to.equal(admin.address);
  });

  it("allows admin to authorize an issuer", async function () {
    const { registry, issuer } = await deployCertificateRegistry();

    await expect(registry.authorizeIssuer(issuer.address))
      .to.emit(registry, "IssuerAuthorized")
      .withArgs(issuer.address);

    expect(await registry.authorizedIssuers(issuer.address)).to.equal(true);
  });

  it("does not allow non-admin to authorize an issuer", async function () {
    const { registry, issuer, otherUser } = await deployCertificateRegistry();

    await expect(
      registry.connect(otherUser).authorizeIssuer(issuer.address),
    ).to.be.revertedWith("Only admin can do this");
  });

  it("allows an authorized issuer to issue a certificate", async function () {
    const { registry, issuer } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.authorizeIssuer(issuer.address);

    await expect(registry.connect(issuer).issueCertificate(certificateId, certificateHash))
      .to.emit(registry, "CertificateIssued")
      .withArgs(certificateId, certificateHash, issuer.address);

    expect(await registry.verifyCertificate(certificateId, certificateHash)).to.equal(true);
  });

  it("does not allow unauthorized users to issue certificates", async function () {
    const { registry, otherUser } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await expect(
      registry.connect(otherUser).issueCertificate(certificateId, certificateHash),
    ).to.be.revertedWith("Only authorized issuers can do this");
  });

 it("returns false when certificate hash is wrong", async function () {
    const { registry } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();
    const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong-data"));

    await registry.issueCertificate(certificateId, certificateHash);

    expect(await registry.verifyCertificate(certificateId, wrongHash)).to.equal(false);
  });

  it("does not allow duplicate certificate IDs", async function () {
    const { registry } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.issueCertificate(certificateId, certificateHash);

    await expect(registry.issueCertificate(certificateId, certificateHash)).to.be.revertedWith(
      "Certificate already exists",
    );
  });

  it("allows the issuer to revoke a certificate", async function () {
    const { registry, issuer } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.authorizeIssuer(issuer.address);
    await registry.connect(issuer).issueCertificate(certificateId, certificateHash);

    await expect(registry.connect(issuer).revokeCertificate(certificateId))
      .to.emit(registry, "CertificateRevoked")
      .withArgs(certificateId, issuer.address);

    expect(await registry.verifyCertificate(certificateId, certificateHash)).to.equal(false);
  });

  it("does not allow unrelated users to revoke a certificate", async function () {
    const { registry, otherUser } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.issueCertificate(certificateId, certificateHash);

    await expect(
      registry.connect(otherUser).revokeCertificate(certificateId),
    ).to.be.revertedWith("Only admin or issuer can revoke");
  });

  it("returns certificate details", async function () {
    const { registry, admin } = await deployCertificateRegistry();
    const certificateId = getTestCertificateId();
    const certificateHash = getTestCertificateHash();

    await registry.issueCertificate(certificateId, certificateHash);

    const certificate = await registry.getCertificate(certificateId);

    expect(certificate.certificateHash).to.equal(certificateHash);
    expect(certificate.issuer).to.equal(admin.address);
    expect(certificate.issuedAt).to.be.greaterThan(0n);
    expect(certificate.isRevoked).to.equal(false);
  });

});
