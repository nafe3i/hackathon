import { useEffect, useState } from "react";
import { createCard, deleteCard, getCards, updateCard } from "../api/cardsApi";
import Navbar from "../components/shared/Navbar";
import CardForm from "../components/cards/CardForm";
import CardList from "../components/cards/CardList";

const empty = { state:"", text:"", tone:"neutre", is_public:false, is_shared:false };
export default function CardsPage() {
  const [cards,setCards]=useState([]); const [form,setForm]=useState(empty); const [editing,setEditing]=useState(null); const [error,setError]=useState(""); const [loading,setLoading]=useState(true);
  const load=()=>getCards().then(setCards).catch(()=>setError("Impossible de charger les cartes.")).finally(()=>setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const submit=async(e)=>{e.preventDefault();setError("");try{if(editing){const card=await updateCard(editing,form);setCards(cards.map(c=>c.id===editing?card:c));}else{const card=await createCard(form);setCards([card,...cards]);}setForm(empty);setEditing(null);}catch{setError("La carte n’a pas pu être enregistrée.");}};
  const edit=(card)=>{setEditing(card.id);setForm({state:card.state,text:card.text,tone:card.tone,is_public:card.is_public,is_shared:card.is_shared});window.scrollTo({top:0,behavior:"smooth"});};
  const remove=async(id)=>{if(!confirm("Supprimer cette carte ?"))return;try{await deleteCard(id);setCards(cards.filter(c=>c.id!==id));}catch{setError("La carte n’a pas pu être supprimée.")}};
  const cancel=()=>{setEditing(null);setForm(empty);setError("")};
  return <main className="cards-page"><Navbar />
    <section className="cards-hero"><p className="eyebrow">Mes outils d’expression</p><h1>Mes cartes</h1><p>Préparez les mots dont vous pourriez avoir besoin.</p></section>
    <div className="cards-layout"><CardForm form={form} setForm={setForm} editing={editing} error={error} onSubmit={submit} onCancel={cancel}/><CardList cards={cards} loading={loading} onEdit={edit} onDelete={remove}/></div>
  </main>;
}
