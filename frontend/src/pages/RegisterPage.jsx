import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ username:"", email:"", password:"" }); const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  if (isAuthenticated) return <Navigate to="/cards" replace />;
  const submit = async (event) => { event.preventDefault(); setError("");
    if (form.password !== confirm) return setError("Les mots de passe ne correspondent pas.");
    setLoading(true); try { await register(form); navigate("/cards", {replace:true}); }
    catch(e) { const detail=e.response?.data?.detail; setError(Array.isArray(detail) ? detail[0]?.msg : detail || "Inscription impossible."); } finally { setLoading(false); }
  };
  return <main className="auth-page"><section className="auth-card"><div className="brand">Bridge<span>.</span></div><p className="eyebrow">Commencer</p><h1>Créez votre espace</h1><p className="muted">Ce compte est personnel. Vous gardez le contrôle de vos données.</p>
    <form onSubmit={submit}><label>Prénom ou pseudo<input required minLength="2" value={form.username} onChange={(e)=>setForm({...form,username:e.target.value})} placeholder="Comment vous appeler ?" /></label>
      <label>Email<input required type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="vous@exemple.com" /></label>
      <label>Mot de passe <small>8 caractères minimum</small><input required minLength="8" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} /></label>
      <label>Confirmer le mot de passe<input required type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} /></label>
      {error && <p className="error" role="alert">{error}</p>}<button disabled={loading}>{loading ? "Création…" : "Créer mon compte"}</button></form>
    <p className="switch">Déjà inscrit ? <Link to="/login">Se connecter</Link></p></section><aside className="auth-visual register"><div className="visual-copy"><p>Un espace qui vous appartient.</p><span>Aucune donnée n’est partagée sans votre choix explicite.</span></div></aside></main>;
}
