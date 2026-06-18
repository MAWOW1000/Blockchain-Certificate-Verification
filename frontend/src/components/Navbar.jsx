import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ShieldCheck, LogOut } from "./Icons";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? (user.role === "ADMIN" ? "/admin" : "/issuer") : "/verify"} className="brand">
          <span className="brand-logo"><ShieldCheck size={20} /></span>
          CertChain
        </Link>

        <div className="nav-links">
          {!user && (
            <>
              <Link to="/verify" className="btn btn-ghost">Verify</Link>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
          {user && (
            <div className="nav-user">
              {user.role === "ADMIN" && <Link to="/admin" className="btn btn-ghost">Admin</Link>}
              {(user.role === "ISSUER" || user.role === "ADMIN") && (
                <Link to="/issuer" className="btn btn-ghost">Certificates</Link>
              )}
              <span className="nav-user-name">
                <strong>{user.name}</strong>
              </span>
              <span className="avatar">{initials}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
