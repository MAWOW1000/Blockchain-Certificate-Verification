import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CertificateDetails() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/certificates/${certificateId}`)
      .then((r) => setCert(r.data))
      .catch(() => setError("Certificate not found"));
  }, [certificateId]);

  if (error) return <div className="auth-container"><p className="error">{error}</p></div>;
  if (!cert) return <div className="auth-container"><p>Loading…</p></div>;

  return (
    <div className="auth-container">
      <h2>Certificate Details</h2>
      <p><strong>Certificate ID:</strong> {cert.certificateId}</p>
      <p><strong>Status:</strong> {cert.status}</p>
      <p><strong>Student:</strong> {cert.studentName} ({cert.studentEmail})</p>
      <p><strong>Student ID:</strong> {cert.studentId}</p>
      <p><strong>Program:</strong> {cert.programName}</p>
      <p><strong>Degree:</strong> {cert.degreeName}</p>
      <p><strong>Graduation Date:</strong> {new Date(cert.graduationDate).toLocaleDateString()}</p>
      <p><strong>Issued By:</strong> {cert.issuer?.name}</p>
      <p><strong>University:</strong> {cert.university?.name || "—"}</p>
      <p><strong>Blockchain TX:</strong> {cert.blockchainTxHash || "N/A"}</p>
      {cert.revokedAt && <p><strong>Revoked At:</strong> {new Date(cert.revokedAt).toLocaleDateString()}</p>}
      {cert.pdfUrl && (
        <p><a href={`http://localhost:5000${cert.pdfUrl}`} target="_blank" rel="noreferrer">Download PDF</a></p>
      )}
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}
