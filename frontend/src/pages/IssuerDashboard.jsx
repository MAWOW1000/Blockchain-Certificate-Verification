import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Plus, FileText } from "../components/Icons";

export default function IssuerDashboard() {
  const navigate = useNavigate();
  const [certs, setCerts] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/certificates");
      setCerts(data);
    } catch {
      setError("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }

  async function revoke(certificateId) {
    if (!window.confirm("Revoke this certificate? This cannot be undone.")) return;
    try {
      await api.post(`/certificates/${certificateId}/revoke`);
      setMessage("Certificate revoked");
      setTimeout(() => setMessage(""), 3000);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Revocation failed");
      setTimeout(() => setError(""), 3000);
    }
  }

  const issued = certs.filter((c) => c.status === "ISSUED").length;
  const revoked = certs.filter((c) => c.status === "REVOKED").length;

  return (
    <div className="page">
      <div className="row-between page-header">
        <div>
          <h1>Certificates</h1>
          <p>Issue and manage blockchain-backed certificates.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/issue")}>
          <Plus size={18} /> Issue Certificate
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-tile">
          <div className="stat-label">Total Issued</div>
          <div className="stat-value">{certs.length}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{issued}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Revoked</div>
          <div className="stat-value" style={{ color: "var(--danger)" }}>{revoked}</div>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="loading">Loading certificates…</div>
        ) : certs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FileText size={40} /></div>
            <p>No certificates issued yet.</p>
            <button className="btn btn-primary mt-2" onClick={() => navigate("/issue")}>
              <Plus size={18} /> Issue your first certificate
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Student</th><th>Program</th><th>Graduation</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((cert) => (
                <tr key={cert.id}>
                  <td className="cell-mono" title={cert.certificateId}>{cert.certificateId.slice(0, 8)}…</td>
                  <td><strong>{cert.studentName}</strong></td>
                  <td>{cert.programName}</td>
                  <td>{new Date(cert.graduationDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${cert.status === "ISSUED" ? "badge-success" : "badge-danger"}`}>
                      {cert.status === "ISSUED" ? "Active" : "Revoked"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/certificate/${cert.certificateId}`)}>View</button>
                      {cert.status === "ISSUED" && (
                        <button className="btn btn-danger btn-sm" onClick={() => revoke(cert.certificateId)}>Revoke</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
