import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Check, Download } from "../components/Icons";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

export default function IssueCertificate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    studentName: "", studentEmail: "", studentId: "",
    programName: "", degreeName: "", graduationDate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(key) {
    return (e) => setForm({ ...form, [key]: e.target.value });
  }

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
      <div className="page page-narrow">
        <div className="card card-elevated text-center">
          <div className="success-checkmark"><Check size={32} /></div>
          <h2 style={{ marginBottom: "0.3rem" }}>Certificate Issued</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Recorded on the blockchain successfully.
          </p>

          <div className="detail-grid" style={{ textAlign: "left" }}>
            <Row label="Certificate ID" value={success.certificateId} mono />
            <Row label="Student" value={success.studentName} />
            <Row label="Program" value={`${success.degreeName}, ${success.programName}`} />
            <Row label="Blockchain TX" value={success.blockchainTxHash || "N/A"} mono />
          </div>

          <div className="mt-3" style={{ display: "flex", gap: "0.6rem", justifyContent: "center" }}>
            {success.pdfUrl && (
              <a className="btn btn-outline" href={`${API_ORIGIN}${success.pdfUrl}`} target="_blank" rel="noreferrer">
                <Download size={18} /> Download PDF
              </a>
            )}
            <button className="btn btn-primary" onClick={() => navigate("/issuer")}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-narrow">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate("/issuer")}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card card-elevated">
        <h2 className="card-title">Issue New Certificate</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Student name</label>
            <input className="input" value={form.studentName} onChange={update("studentName")} placeholder="Nguyen Van A" required />
          </div>
          <div className="field">
            <label>Student email</label>
            <input className="input" type="email" value={form.studentEmail} onChange={update("studentEmail")} placeholder="student@example.com" required />
          </div>
          <div className="field">
            <label>Student ID</label>
            <input className="input" value={form.studentId} onChange={update("studentId")} placeholder="STU2024001" required />
          </div>
          <div className="field">
            <label>Program name</label>
            <input className="input" value={form.programName} onChange={update("programName")} placeholder="Computer Science" required />
          </div>
          <div className="field">
            <label>Degree</label>
            <input className="input" value={form.degreeName} onChange={update("degreeName")} placeholder="Bachelor of Science" required />
          </div>
          <div className="field">
            <label>Graduation date</label>
            <input className="input" type="date" value={form.graduationDate} onChange={update("graduationDate")} required />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Recording on blockchain…" : "Issue Certificate"}
          </button>
        </form>
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
