import { useEffect, useState } from "react";
import Navbar from "../components/shared/Navbar";
import { createInvitation, getInvitations, getNetwork } from "../api/contactsApi";

const statusLabels = { pending: "En attente", accepted: "Acceptée", rejected: "Refusée", expired: "Expirée" };

export default function ContactsPage() {
  const [email, setEmail] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    try { const [invitationData, networkData] = await Promise.all([getInvitations(), getNetwork()]); setInvitations(invitationData); setContacts(networkData); }
    catch (err) { setError(err.response?.data?.detail || "Impossible de charger votre réseau."); }
  };
  useEffect(() => { load(); }, []);

  const invite = async (event) => {
    event.preventDefault(); setError(""); setNotice(""); setSending(true);
    try { const invitation = await createInvitation(email); setInvitations((current) => [invitation, ...current.filter((item) => item.id !== invitation.id)]); setEmail(""); setNotice("Invitation créée. Copiez le lien et envoyez-le à votre contact."); }
    catch (err) { setError(err.response?.data?.detail || "Impossible de créer l’invitation."); }
    finally { setSending(false); }
  };
  const invitationUrl = (token) => `${window.location.origin}/invite/${token}`;
  const copy = async (token) => { await navigator.clipboard.writeText(invitationUrl(token)); setNotice("Lien copié ! Vous pouvez maintenant l’envoyer par email."); };

  return <main className="cards-page"><Navbar/><section className="cards-hero"><p className="eyebrow">Personnes de confiance</p><h1>Mon réseau</h1><p>Invitez uniquement les personnes que vous choisissez.</p></section><div className="network-layout">
    <section className="panel invite-panel"><h2>Inviter par email</h2><p className="muted">Un lien privé valable 7 jours sera créé.</p><form onSubmit={invite}><label>Email du contact<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="proche@exemple.com"/></label>{error&&<p className="error">{error}</p>}{notice&&<p className="success">{notice}</p>}<button disabled={sending}>{sending ? "Création…" : "Créer l’invitation"}</button></form></section>
    <section><div className="list-title"><h2>Invitations</h2><span>{invitations.length}</span></div><div className="network-list">{invitations.length===0?<div className="empty">Aucune invitation pour le moment.</div>:invitations.map((item)=><article className="invitation-row" key={item.id}><div><strong>{item.email}</strong><span className={`invitation-status ${item.status}`}>{statusLabels[item.status]||item.status}</span></div>{item.status==="pending"&&<div className="invitation-link"><input readOnly value={invitationUrl(item.token)}/><button className="ghost" onClick={()=>copy(item.token)}>Copier</button></div>}</article>)}</div>
    <div className="list-title network-title"><h2>Membres du réseau</h2><span>{contacts.length}</span></div><div className="network-list">{contacts.length===0?<div className="empty">Les invitations acceptées apparaîtront ici.</div>:contacts.map((contact)=><article className="contact-row" key={contact.link_id}><div className="avatar">{contact.username.charAt(0).toUpperCase()}</div><div><strong>{contact.username}</strong><small>{contact.email}{contact.phone?` · ${contact.phone}`:""}</small></div></article>)}</div></section>
  </div></main>;
}
