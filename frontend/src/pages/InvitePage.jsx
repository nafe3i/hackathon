import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { acceptInvitation, getInvitation, rejectInvitation } from "../api/contactsApi";

export default function InvitePage() {
  const { token } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [form, setForm] = useState({ username:"", phone:"", password:"" });
  const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(()=>{getInvitation(token).then(setInvitation).catch((err)=>setError(err.response?.data?.detail||"Invitation introuvable.")).finally(()=>setLoading(false));},[token]);
  const accept=async(event)=>{event.preventDefault();setError("");try{const result=await acceptInvitation(token,form);setMessage(result.message);}catch(err){setError(err.response?.data?.detail||"Impossible d’accepter l’invitation.");}};
  const reject=async()=>{setError("");try{const result=await rejectInvitation(token);setMessage(result.message);}catch(err){setError(err.response?.data?.detail||"Impossible de refuser l’invitation.");}};
  if(loading)return <main className="invite-page"><p>Chargement de l’invitation…</p></main>;
  if(error&&!invitation)return <main className="invite-page"><section className="invite-card"><div className="brand">Bridge<span>.</span></div><p className="error">{error}</p></section></main>;
  return <main className="invite-page"><section className="invite-card"><div className="brand">Bridge<span>.</span></div>{message?<><p className="eyebrow">Réponse enregistrée</p><h1>Merci</h1><p>{message}</p>{message.includes("acceptée")&&<Link className="button-link" to="/login">Se connecter</Link>}</>:<><p className="eyebrow">Invitation réseau</p><h1>{invitation.owner_name} vous invite</h1><p className="muted">Vous décidez librement d’accepter ou de refuser. Compte concerné : <strong>{invitation.email}</strong></p>{invitation.status!=="pending"?<p className="error">Cette invitation est déjà {invitation.status}.</p>:<form onSubmit={accept}><label>Votre nom<input required minLength="2" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/></label><label>Numéro de téléphone<input required minLength="6" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Mot de passe<input required type="password" minLength="8" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>{error&&<p className="error">{error}</p>}<div className="decision-actions"><button>Accepter et créer mon compte</button><button type="button" className="danger" onClick={reject}>Refuser</button></div></form>}</>}</section></main>;
}
