import CardItem from "./CardItem";
export default function CardList({ cards, loading, onEdit, onDelete }) {
  return <section><div className="list-title"><h2>Cartes enregistrées</h2><span>{cards.length}</span></div>{loading ? <div className="empty">Chargement…</div> : !cards.length ? <div className="empty">Votre première carte apparaîtra ici.</div> : <div className="card-grid">{cards.map((card) => <CardItem key={card.id} card={card} onEdit={onEdit} onDelete={onDelete}/>)}</div>}</section>;
}
