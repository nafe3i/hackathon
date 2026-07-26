import { useEffect, useState } from "react";
import { createCard, deleteCard, getCards, updateCard } from "../api/cardsApi";
import { useAuth } from "../context/AuthContext";

const empty = { state:"", text:"", tone:"neutre", is_public:false, is_shared:false };
export default function CardsPage() {
  const { user, logout } = useAuth(); const [cards,setCards]=useState([]); const [form,setForm]=useState(empty); const [editing,setEditing]=useState(null); const [error,setError]=useState("");
  const load=()=>getCards().then(setCards).catch(()=>setError("Impossible de charger les cartes."));
  useEffect(load,[]);
  const submit=async(e)=>{e.preventDefault();setError("");try{if(editing){const card=await updateCard(editing,form);setCards(cards.map(c=>c.id===editing?card:c));}else{const card=await createCard(form);setCards([card,...cards]);}setForm(empty);setEditing(null);}catch{setError("La carte n’a pas pu être enregistrée.");}};
  const edit=(card)=>{setEditing(card.id);setForm({state:card.state,text:card.text,tone:card.tone,is_public:card.is_public,is_shared:card.is_shared});window.scrollTo({top:0,behavior:"smooth"});};
  const remove=async(id)=>{if(!confirm("Supprimer cette carte ?"))return;await deleteCard(id);setCards(cards.filter(c=>c.id!==id));};
  return <main className="cards-page"><header><div className="brand">Bridge<span>.</span></div><div><span>Bonjour, {user.username}</span><button className="ghost" onClick={logout}>Se déconnecter</button></div></header>
    <section className="cards-hero"><p className="eyebrow">Mes outils d’expression</p><h1>Mes cartes</h1><p>Préparez les mots dont vous pourriez avoir besoin.</p></section>
    <div className="cards-layout"><section className="panel"><h2>{editing?"Modifier la carte":"Nouvelle carte"}</h2><form onSubmit={submit}><label>Mon état<input required value={form.state} onChange={e=>setForm({...form,state:e.target.value})} placeholder="Ex. Besoin de calme" /></label><label>Mon message<textarea required rows="4" value={form.text} onChange={e=>setForm({...form,text:e.target.value})} placeholder="Ex. J’ai besoin d’un endroit silencieux." /></label><label>Ton<select value={form.tone} onChange={e=>setForm({...form,tone:e.target.value})}><option>neutre</option><option>chaleureux</option><option>formel</option></select></label><label className="check"><input type="checkbox" checked={form.is_public} onChange={e=>setForm({...form,is_public:e.target.checked})}/> Visible sur mon profil public</label>{error&&<p className="error">{error}</p>}<button>{editing?"Enregistrer":"Créer la carte"}</button>{editing&&<button type="button" className="ghost" onClick={()=>{setEditing(null);setForm(empty)}}>Annuler</button>}</form></section>
      <section><div className="list-title"><h2>Cartes enregistrées</h2><span>{cards.length}</span></div>{!cards.length?<div className="empty">Votre première carte apparaîtra ici.</div>:<div className="card-grid">{cards.map(card=><article className="message-card" key={card.id}><span className="state">{card.state}</span><p>{card.text}</p><small>Ton : {card.tone}</small><div><button className="ghost" onClick={()=>edit(card)}>Modifier</button><button className="danger" onClick={()=>remove(card.id)}>Supprimer</button></div></article>)}</div>}</section></div>
  </main>;
}
