export default function CardItem({ card, onEdit, onDelete }) {
  return <article className="message-card"><div className="card-badges"><span className="state">{card.state}</span>{card.is_public && <span className="visibility">Publique</span>}{card.is_shared && <span className="visibility">Partagée</span>}</div><p>{card.text}</p><small>Ton : {card.tone}</small><div className="card-actions"><button className="ghost" onClick={() => onEdit(card)}>Modifier</button><button className="danger" onClick={() => onDelete(card.id)}>Supprimer</button></div></article>;
}
