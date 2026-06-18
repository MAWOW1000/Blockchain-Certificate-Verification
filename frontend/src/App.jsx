import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import IssuerDashboard from "./pages/IssuerDashboard";
import IssueCertificate from "./pages/IssueCertificate";
import CertificateDetails from "./pages/CertificateDetails";
import Verify from "./pages/Verify";
import "./App.css";

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

function Shell() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/verify" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verify/:certificateId" element={<Verify />} />
        <Route path="/admin" element={
          <PrivateRoute roles={["ADMIN"]}><AdminDashboard /></PrivateRoute>
        } />
        <Route path="/issuer" element={
          <PrivateRoute roles={["ISSUER", "ADMIN"]}><IssuerDashboard /></PrivateRoute>
        } />
        <Route path="/issue" element={
          <PrivateRoute roles={["ISSUER", "ADMIN"]}><IssueCertificate /></PrivateRoute>
        } />
        <Route path="/certificate/:certificateId" element={
          <PrivateRoute roles={["ISSUER", "ADMIN"]}><CertificateDetails /></PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
