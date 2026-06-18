import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { ShieldCheck, Search, Check, X, AlertTriangle } from "../components/Icons";

const STATUS = {
  VALID:     { cls: "valid",    label: "Certificate Valid",      icon: Check },
  INVALID:   { cls: "invalid",  label: "Certificate Invalid",    icon: X },
  REVOKED:   { cls: "revoked",  label: "Certificate Revoked",    icon: AlertTriangle },
  NOT_FOUND: { cls: "notfound", label: "Certificate Not Found",  icon: Search },
};

export default function Verify() {
  const { certificateId: paramId } = useParams();
  const [certId, setCertId] = useState(paramId || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify(e) {
    e.preventDefault();
    if (!certId.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.get(`/verify/${certId.trim()}`);
      setResult(data);
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const info = result ? STATUS[result.result] || STATUS.INVALID : null;
  const Icon = info?.icon;
  const cert = result?.certificate;

  return (
    <div className="page">
      <div className="verify-hero">
        <span className="eyebrow"><ShieldCheck size={14} /> Blockchain Verified</span>
        <h1>Verify Academic Certificate</h1>
        <p>Enter a certificate ID to instantly confirm its authenticity against the blockchain.</p>

        <form className="verify-form" onSubmit={handleVerify}>
          <input className="input" value={certId} onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter certificate ID (e.g. 3e5b9b94-...)" required />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            <Search size={18} /> {loading ? "Verifying…" : "Verify"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ maxWidth: 560, margin: "0 auto" }}>{error}</div>}

      {result && info && (
        <div className="result-card">
          <div className={`result-banner ${info.cls}`}>
            <span className="result-icon"><Icon size={20} /></span>
            {info.label}
          </div>
          {cert && (
            <div className="result-body">
              <div className="detail-grid">
                <Row label="Student" value={cert.studentName} />
                <Row label="Program" value={cert.programName} />
                <Row label="Degree" value={cert.degreeName} />
                <Row label="Graduation" value={new Date(cert.graduationDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
                <Row label="Issued by" value={cert.issuerName} />
                {cert.universityName && <Row label="University" value={cert.universityName} />}
                {cert.revokedAt && <Row label="Revoked on" value={new Date(cert.revokedAt).toLocaleDateString()} />}
                {cert.blockchainTxHash && <Row label="Blockchain TX" value={cert.blockchainTxHash} mono />}
              </div>
            </div>
          )}
        </div>
      )}
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
