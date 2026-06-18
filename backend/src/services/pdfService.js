import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = resolve(__dirname, "../../uploads/certificates");

mkdirSync(UPLOAD_DIR, { recursive: true });

export async function generateCertificatePDF(cert, qrDataUrl) {
  return new Promise((resolve_fn, reject) => {
    const filename = `${cert.certificateId}.pdf`;
    const filepath = resolve(UPLOAD_DIR, filename);

    const doc = new PDFDocument({ size: "A4", margin: 60 });
    const stream = createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(28).font("Helvetica-Bold").text("Certificate of Achievement", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).font("Helvetica").text(cert.universityName || "Verified Institution", { align: "center" });
    doc.moveDown(2);

    // Body
    doc.fontSize(16).text("This certifies that", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(22).font("Helvetica-Bold").text(cert.studentName, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).font("Helvetica").text("has successfully completed", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(18).font("Helvetica-Bold").text(`${cert.degreeName} in ${cert.programName}`, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).font("Helvetica").text(
      `Graduation Date: ${new Date(cert.graduationDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      { align: "center" }
    );
    doc.moveDown(2);

    // Certificate ID
    doc.fontSize(10).fillColor("#555").text(`Certificate ID: ${cert.certificateId}`, { align: "center" });
    doc.moveDown(0.3);
    doc.text(`Blockchain TX: ${cert.blockchainTxHash || "N/A"}`, { align: "center" });
    doc.moveDown(1);

    // QR code
    if (qrDataUrl) {
      const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
      doc.image(qrBuffer, doc.page.width / 2 - 60, doc.y, { width: 120 });
    }

    doc.end();

    stream.on("finish", () => resolve_fn(`/uploads/certificates/${filename}`));
    stream.on("error", reject);
  });
}
