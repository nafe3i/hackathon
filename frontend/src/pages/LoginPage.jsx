import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login, isAuthenticated, authReady } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (authReady && isAuthenticated) return <Navigate to={user.role === "reseau" ? "/network-dashboard" : "/cards"} replace />;
  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try { const connectedUser = await login(form); navigate(connectedUser.role === "reseau" ? "/network-dashboard" : "/cards", { replace: true }); }
    catch (e) { setError(e.response?.data?.detail || "Connexion impossible. Vérifiez que le serveur est lancé."); }
    finally { setLoading(false); }
  };
  return <main className="auth-page"><section className="auth-card">
    <div className="brand">Bridge<span>.</span></div><p className="eyebrow">Bienvenue</p>
    <h1>Retrouvez vos cartes</h1><p className="muted">Connectez-vous dans un espace calme et sécurisé.</p>
    <form onSubmit={submit}><label>Email<input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} placeholder="vous@exemple.com" /></label>
      <label>Mot de passe<input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} placeholder="Votre mot de passe" /></label>
      {error && <p className="error" role="alert">{error}</p>}<button disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</button>
    </form><p className="switch">Pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
  </section><aside className="auth-visual"><div className="visual-copy"><p>Votre voix, à votre rythme.</p><span>Des cartes simples pour exprimer vos besoins quand les mots deviennent difficiles.</span></div></aside></main>;
}
