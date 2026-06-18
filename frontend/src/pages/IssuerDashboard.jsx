import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

export default function IssuerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [certs, setCerts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/certificates").then((r) => setCerts(r.data)).catch(() => {});
  }, []);

  async function revoke(certificateId) {
    if (!window.confirm("Revoke this certificate?")) return;
    try {
      await api.post(`/certificates/${certificateId}/revoke`);
      setMessage("Certificate revoked");
      const { data } = await api.get("/certificates");
      setCerts(data);
    } catch (err) {
      setMessage(err.response?.data?.error || "Revocation failed");
    }
  }

  return (
    <div className="dashboard">
      <header>
        <h2>Issuer Dashboard</h2>
        <span>Logged in as {user?.name}</span>
        <button onClick={() => navigate("/issue")}>Issue Certificate</button>
        <button onClick={logout}>Logout</button>
      </header>
      {message && <p className="message">{message}</p>}
      <h3>Issued Certificates</h3>
      {certs.length === 0 && <p>No certificates issued yet.</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Student</th><th>Program</th><th>Degree</th><th>Date</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {certs.map((cert) => (
            <tr key={cert.id}>
              <td title={cert.certificateId}>{cert.certificateId.slice(0, 8)}…</td>
              <td>{cert.studentName}</td>
              <td>{cert.programName}</td>
              <td>{cert.degreeName}</td>
              <td>{new Date(cert.graduationDate).toLocaleDateString()}</td>
              <td>{cert.status}</td>
              <td>
                <button onClick={() => navigate(`/certificate/${cert.certificateId}`)}>View</button>
                {cert.status === "ISSUED" && <button onClick={() => revoke(cert.certificateId)}>Revoke</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
