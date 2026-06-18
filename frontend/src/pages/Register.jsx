import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ShieldCheck } from "../components/Icons";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", walletAddress: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, "ISSUER", form.walletAddress || undefined);
      if (user.role === "ADMIN") navigate("/admin");
      else navigate("/issuer");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-narrow">
      <div className="auth-card">
        <div className="auth-logo"><ShieldCheck size={26} /></div>
        <h2>Create your account</h2>
        <p className="auth-subtitle">Register as a certificate issuer</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input className="input" placeholder="University of Example"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" placeholder="admin@university.edu"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="field">
            <label>Wallet address <span style={{ color: "var(--text-soft)", fontWeight: 400 }}>(optional)</span></label>
            <input className="input" placeholder="0x..."
              value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: "1rem" }}>
          The first registered user becomes the admin.
        </p>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
