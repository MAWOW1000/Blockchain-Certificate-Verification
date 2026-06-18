import { useState, useEffect } from "react";
import api from "../services/api";
import { Users } from "../components/Icons";

export default function AdminDashboard() {
  const [issuers, setIssuers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadIssuers(); }, []);

  async function loadIssuers() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/issuers");
      setIssuers(data);
    } catch {
      setError("Failed to load issuers");
    } finally {
      setLoading(false);
    }
  }

  function flash(setter, msg) {
    setter(msg);
    setTimeout(() => setter(""), 3000);
  }

  async function approve(id) {
    try {
      await api.post(`/admin/issuers/${id}/approve`);
      flash(setMessage, "Issuer approved successfully");
      loadIssuers();
    } catch (err) {
      flash(setError, err.response?.data?.error || "Failed to approve");
    }
  }

  async function remove(id) {
    try {
      await api.post(`/admin/issuers/${id}/remove`);
      flash(setMessage, "Issuer access removed");
      loadIssuers();
    } catch (err) {
      flash(setError, err.response?.data?.error || "Failed to remove");
    }
  }

  const approved = issuers.filter((i) => i.university?.isApproved).length;
  const pending = issuers.length - approved;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage certificate issuers and their blockchain authorization.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-tile">
          <div className="stat-label">Total Issuers</div>
          <div className="stat-value">{issuers.length}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Approved</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{approved}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: "var(--warning)" }}>{pending}</div>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="loading">Loading issuers…</div>
        ) : issuers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Users size={40} /></div>
            <p>No issuers have registered yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Wallet</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issuers.map((issuer) => {
                const isApproved = issuer.university?.isApproved;
                return (
                  <tr key={issuer.id}>
                    <td><strong>{issuer.name}</strong></td>
                    <td>{issuer.email}</td>
                    <td className="cell-mono">
                      {issuer.walletAddress
                        ? `${issuer.walletAddress.slice(0, 6)}…${issuer.walletAddress.slice(-4)}`
                        : "—"}
                    </td>
                    <td>
                      <span className={`badge ${isApproved ? "badge-success" : "badge-warning"}`}>
                        {isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {!isApproved ? (
                          <button className="btn btn-success btn-sm" onClick={() => approve(issuer.id)}>Approve</button>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => remove(issuer.id)}>Remove</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
