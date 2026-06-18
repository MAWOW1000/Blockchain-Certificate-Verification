import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function IssueCertificate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    studentId: "",
    programName: "",
    degreeName: "",
    graduationDate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/certificates", form);
      setSuccess(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to issue certificate");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-container">
        <h2>Certificate Issued!</h2>
        <p><strong>Certificate ID:</strong> {success.certificateId}</p>
        <p><strong>Student:</strong> {success.studentName}</p>
        <p><strong>Program:</strong> {success.programName} — {success.degreeName}</p>
        <p><strong>Blockchain TX:</strong> {success.blockchainTxHash || "N/A"}</p>
        {success.pdfUrl && (
          <p><a href={`http://localhost:5000${success.pdfUrl}`} target="_blank" rel="noreferrer">Download PDF</a></p>
        )}
        <button onClick={() => navigate("/issuer")}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Issue Certificate</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Student Name</label>
        <input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} required />
        <label>Student Email</label>
        <input type="email" value={form.studentEmail} onChange={(e) => setForm({ ...form, studentEmail: e.target.value })} required />
        <label>Student ID</label>
        <input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
        <label>Program Name</label>
        <input value={form.programName} onChange={(e) => setForm({ ...form, programName: e.target.value })} required />
        <label>Degree Name</label>
        <input value={form.degreeName} onChange={(e) => setForm({ ...form, degreeName: e.target.value })} required />
        <label>Graduation Date</label>
        <input type="date" value={form.graduationDate} onChange={(e) => setForm({ ...form, graduationDate: e.target.value })} required />
        <button type="submit" disabled={loading}>{loading ? "Processing..." : "Issue Certificate"}</button>
      </form>
      <button onClick={() => navigate("/issuer")}>Cancel</button>
    </div>
  );
}
