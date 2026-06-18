import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ShieldCheck } from "../components/Icons";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "ISSUER") navigate("/issuer");
      else navigate("/verify");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-narrow">
      <div className="auth-card">
        <div className="auth-logo"><ShieldCheck size={26} /></div>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to manage your certificates</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" placeholder="you@university.edu"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <Link to="/verify" className="btn btn-outline btn-block">Verify a certificate</Link>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
