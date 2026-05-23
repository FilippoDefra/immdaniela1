import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatErr } from "../lib/api";

export default function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      nav("/admin");
    } catch (err) { setError(formatErr(err)); }
    setLoading(false);
  };

  return (
    <div className="login-page" data-testid="login-page">
      <div className="login-card">
        <img src="/assets/logo.png" alt="" style={{ height: 60, marginBottom: 24 }} />
        <h1>Area Riservata</h1>
        <p>Accedi al pannello di amministrazione.</p>
        <form onSubmit={submit} className="form" style={{ background: "transparent", border: 0, padding: 0 }}>
          <div className="cf-field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required data-testid="login-email" /></div>
          <div className="cf-field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required data-testid="login-password" /></div>
          {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
          <button type="submit" className="btn btn-primary cf-submit" disabled={loading} data-testid="login-submit">{loading ? "Accesso..." : "Entra"}</button>
        </form>
      </div>
    </div>
  );
}
