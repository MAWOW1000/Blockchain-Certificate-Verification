import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Download } from "../components/Icons";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

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

  if (error) {
    return (
      <div className="page page-narrow">
        <div className="card text-center"><p className="alert alert-error">{error}</p></div>
      </div>
    );
  }
  if (!cert) return <div className="loading">Loading…</div>;

  const isRevoked = cert.status === "REVOKED";

  return (
    <div className="page page-narrow">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card card-elevated">
        <div className="row-between" style={{ marginBottom: "1.25rem" }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>Certificate Details</h2>
          <span className={`badge ${isRevoked ? "badge-danger" : "badge-success"}`}>
            {isRevoked ? "Revoked" : "Active"}
          </span>
        </div>

        <div className="detail-grid">
          <Row label="Certificate ID" value={cert.certificateId} mono />
          <Row label="Student" value={cert.studentName} />
          <Row label="Email" value={cert.studentEmail} />
          <Row label="Student ID" value={cert.studentId} />
          <Row label="Program" value={cert.programName} />
          <Row label="Degree" value={cert.degreeName} />
          <Row label="Graduation" value={new Date(cert.graduationDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
          <Row label="Issued by" value={cert.issuer?.name} />
          {cert.university?.name && <Row label="University" value={cert.university.name} />}
          <Row label="Blockchain TX" value={cert.blockchainTxHash || "N/A"} mono />
          {cert.revokedAt && <Row label="Revoked on" value={new Date(cert.revokedAt).toLocaleDateString()} />}
        </div>

        {cert.pdfUrl && (
          <div className="mt-3">
            <a className="btn btn-primary btn-block" href={`${API_ORIGIN}${cert.pdfUrl}`} target="_blank" rel="noreferrer">
              <Download size={18} /> Download PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={`detail-value${mono ? " mono" : ""}`}>{value}</span>
    </div>
  );
}
