import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [issuers, setIssuers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadIssuers();
  }, []);

  async function loadIssuers() {
    try {
      const { data } = await api.get("/admin/issuers");
      setIssuers(data);
    } catch {
      setMessage("Failed to load issuers");
    }
  }

  async function approve(id) {
    try {
      await api.post(`/admin/issuers/${id}/approve`);
      setMessage("Issuer approved");
      loadIssuers();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to approve");
    }
  }

  async function remove(id) {
    try {
      await api.post(`/admin/issuers/${id}/remove`);
      setMessage("Issuer removed");
      loadIssuers();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to remove");
    }
  }

  return (
    <div className="dashboard">
      <header>
        <h2>Admin Dashboard</h2>
        <span>Logged in as {user?.name}</span>
        <button onClick={logout}>Logout</button>
      </header>
      {message && <p className="message">{message}</p>}
      <h3>Issuers</h3>
      {issuers.length === 0 && <p>No issuers registered yet.</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Wallet</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {issuers.map((issuer) => (
            <tr key={issuer.id}>
              <td>{issuer.name}</td>
              <td>{issuer.email}</td>
              <td>{issuer.walletAddress || "—"}</td>
              <td>{issuer.university?.isApproved ? "Approved" : "Pending"}</td>
              <td>
                {!issuer.university?.isApproved && (
                  <button onClick={() => approve(issuer.id)}>Approve</button>
                )}
                {issuer.university?.isApproved && (
                  <button onClick={() => remove(issuer.id)}>Remove</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
