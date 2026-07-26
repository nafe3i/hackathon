from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.card import Card
from app.models.contact import NetworkLink
from app.models.user import User
from app.schemas.ai import PublicCard, PublicChatRequest, PublicChatResponse, PublicContact, PublicEmergencyProfile
from app.services.ai.gemma_client import generate_with_gemma

router = APIRouter(prefix="/public", tags=["public"])


def public_context(public_id: str, db: Session):
    user = db.scalar(select(User).where(User.public_id == public_id, User.role == "autiste"))
    if not user:
        raise HTTPException(status_code=404, detail="Profil public introuvable")
    cards = db.scalars(select(Card).where(Card.user_id == user.id, Card.is_public.is_(True)).order_by(Card.created_at.desc())).all()
    links = db.scalars(select(NetworkLink).where(NetworkLink.autiste_id == user.id)).all()
    contacts = [{"name": link.contact.username, "phone": link.contact.phone} for link in links if link.contact.phone]
    return user, cards, contacts


def initial_help_message(user: User, cards: list[Card], contacts: list[dict]) -> str:
    intro = f"Bonjour, je m’appelle {user.username}. Je peux avoir besoin de votre aide."
    needs = " ".join(f"Mon état : {card.state}. Mon message : {card.text}." for card in cards)
    phones = ", ".join(f"{contact['name']} au {contact['phone']}" for contact in contacts)
    contact_text = f" Si nécessaire, contactez {phones}." if phones else " Merci de rester calme et de me laisser de l’espace."
    return " ".join(part for part in [intro, needs, contact_text] if part).strip()


@router.get("/{public_id}", response_model=PublicEmergencyProfile)
def get_public_profile(public_id: str, db: Session = Depends(get_db)):
    user, cards, contacts = public_context(public_id, db)
    return PublicEmergencyProfile(public_id=user.public_id, name=user.username, initial_message=initial_help_message(user, cards, contacts), cards=[PublicCard(state=card.state, message=card.text) for card in cards], contacts=[PublicContact(**contact) for contact in contacts])


@router.post("/{public_id}/chat", response_model=PublicChatResponse)
def public_emergency_chat(public_id: str, data: PublicChatRequest, db: Session = Depends(get_db)):
    user, cards, contacts = public_context(public_id, db)
    facts = initial_help_message(user, cards, contacts)
    history = "\n".join(f"{item.get('role', 'user')}: {item.get('content', '')[:500]}" for item in data.history[-6:])
    prompt = f"""Tu es Bridge, un assistant d’urgence pour aider un passant à accompagner une personne autiste.
Réponds en français, en 2 à 5 phrases simples, calmes et directement utiles.
Utilise uniquement les informations factuelles ci-dessous. N’invente rien, ne pose aucun diagnostic et ne révèle aucune autre donnée.
Priorité : sécurité immédiate, calme, espace, respect des messages de la personne et contacts fournis.

INFORMATIONS AUTORISÉES :
{facts}

HISTORIQUE :
{history}

QUESTION DU PASSANT : {data.message}
"""
    try:
        reply = generate_with_gemma(prompt)
        return {"reply": reply, "source": "gemma-4"}
    except RuntimeError:
        return {"reply": f"Restez calme, laissez de l’espace à {user.username} et suivez les messages affichés sur cette page. {facts}", "source": "fallback"}
