from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.card import Card
from app.models.user import User
from app.schemas.card import CardCreate, CardResponse, CardUpdate

router = APIRouter(prefix="/cards", tags=["cards"])


def require_autiste(user: User) -> None:
    if user.role != "autiste":
        raise HTTPException(status_code=403, detail="Les comptes réseau ne peuvent pas gérer de cartes")


@router.get("", response_model=list[CardResponse])
def list_cards(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_autiste(user)
    return db.scalars(select(Card).where(Card.user_id == user.id).order_by(Card.created_at.desc())).all()


@router.post("", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
def create_card(data: CardCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_autiste(user)
    card = Card(**data.model_dump(), user_id=user.id)
    db.add(card); db.commit(); db.refresh(card)
    return card


def owned_card(card_id: str, user: User, db: Session) -> Card:
    card = db.scalar(select(Card).where(Card.id == card_id, Card.user_id == user.id))
    if not card:
        raise HTTPException(status_code=404, detail="Carte introuvable")
    return card


@router.patch("/{card_id}", response_model=CardResponse)
def update_card(card_id: str, data: CardUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_autiste(user)
    card = owned_card(card_id, user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(card, key, value)
    db.commit(); db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(card_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_autiste(user)
    card = owned_card(card_id, user, db)
    db.delete(card); db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
