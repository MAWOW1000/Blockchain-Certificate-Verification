import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const STATUS_STYLE = {
  VALID: { color: "green", label: "VALID" },
  INVALID: { color: "red", label: "INVALID" },
  REVOKED: { color: "orange", label: "REVOKED" },
  NOT_FOUND: { color: "gray", label: "NOT FOUND" },
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
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  const statusInfo = result ? STATUS_STYLE[result.result] || { color: "gray", label: result.result } : null;

  return (
    <div className="auth-container">
      <h2>Verify Certificate</h2>
      <form onSubmit={handleVerify}>
        <label>Certificate ID</label>
        <input
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="Enter certificate ID"
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Verifying…" : "Verify"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="verify-result">
          <h3 style={{ color: statusInfo.color }}>Result: {statusInfo.label}</h3>
          {result.certificate && (
            <div>
              <p><strong>Student:</strong> {result.certificate.studentName}</p>
              <p><strong>Program:</strong> {result.certificate.programName}</p>
              <p><strong>Degree:</strong> {result.certificate.degreeName}</p>
              <p><strong>Graduation Date:</strong> {new Date(result.certificate.graduationDate).toLocaleDateString()}</p>
              <p><strong>Issued By:</strong> {result.certificate.issuerName}</p>
              <p><strong>University:</strong> {result.certificate.universityName || "—"}</p>
              {result.certificate.revokedAt && (
                <p><strong>Revoked:</strong> {new Date(result.certificate.revokedAt).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      )}
      <p style={{ marginTop: "1rem" }}><a href="/login">Login</a></p>
    </div>
  );
}
