from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.security import hash_password
from app.db.database import get_db
from app.models.contact import Alert, Invitation, NetworkLink
from app.models.user import User
from app.schemas.contact import AlertBroadcastResponse, AlertResponse, InvitationAccept, InvitationCreate, InvitationDecision, InvitationPublic, InvitationResponse, NetworkContact

router = APIRouter(tags=["network"])


def require_autiste(user: User) -> None:
    if user.role != "autiste":
        raise HTTPException(status_code=403, detail="Réservé aux comptes autistes")


def invitation_or_404(token: str, db: Session) -> Invitation:
    invitation = db.scalar(select(Invitation).where(Invitation.token == token))
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation introuvable")
    return invitation


def ensure_pending(invitation: Invitation) -> None:
    expires_at = invitation.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        invitation.status = "expired"
        raise HTTPException(status_code=410, detail="Cette invitation a expiré")
    if invitation.status != "pending":
        raise HTTPException(status_code=409, detail=f"Cette invitation est déjà {invitation.status}")


@router.post("/invitations", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
def create_invitation(data: InvitationCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_autiste(user)
    email = data.email.lower()
    if email == user.email:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous inviter vous-même")
    linked = db.scalar(select(NetworkLink).join(User, User.id == NetworkLink.contact_id).where(NetworkLink.autiste_id == user.id, User.email == email))
    if linked:
        raise HTTPException(status_code=409, detail="Cette personne fait déjà partie de votre réseau")
    existing = db.scalar(select(Invitation).where(Invitation.owner_id == user.id, Invitation.email == email, Invitation.status == "pending"))
    if existing:
        return existing
    invitation = Invitation(owner_id=user.id, email=email)
    db.add(invitation); db.commit(); db.refresh(invitation)
    return invitation


@router.get("/invitations", response_model=list[InvitationResponse])
def list_invitations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_autiste(user)
    return db.scalars(select(Invitation).where(Invitation.owner_id == user.id).order_by(Invitation.created_at.desc())).all()


@router.get("/invitations/{token}", response_model=InvitationPublic)
def invitation_details(token: str, db: Session = Depends(get_db)):
    invitation = invitation_or_404(token, db)
    return InvitationPublic(email=invitation.email, owner_name=invitation.owner.username, status=invitation.status, expires_at=invitation.expires_at)


@router.post("/invitations/{token}/accept", response_model=InvitationDecision)
def accept_invitation(token: str, data: InvitationAccept, db: Session = Depends(get_db)):
    invitation = invitation_or_404(token, db)
    try:
        ensure_pending(invitation)
    except HTTPException:
        db.commit()
        raise
    if db.scalar(select(User).where(User.email == invitation.email)):
        raise HTTPException(status_code=409, detail="Un compte existe déjà avec cet email")
    contact = User(username=data.username.strip(), email=invitation.email, password=hash_password(data.password), role="reseau", phone=data.phone.strip())
    db.add(contact); db.flush()
    db.add(NetworkLink(autiste_id=invitation.owner_id, contact_id=contact.id))
    invitation.status = "accepted"
    db.commit()
    return {"message": "Invitation acceptée. Vous faites maintenant partie du réseau."}


@router.post("/invitations/{token}/reject", response_model=InvitationDecision)
def reject_invitation(token: str, db: Session = Depends(get_db)):
    invitation = invitation_or_404(token, db)
    ensure_pending(invitation)
    invitation.status = "rejected"
    db.commit()
    return {"message": "Invitation refusée."}


@router.get("/network", response_model=list[NetworkContact])
def list_network(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_autiste(user)
    links = db.scalars(select(NetworkLink).where(NetworkLink.autiste_id == user.id).order_by(NetworkLink.linked_at.desc())).all()
    return [NetworkContact(link_id=link.id, contact_id=link.contact.id, username=link.contact.username, email=link.contact.email, phone=link.contact.phone, voir_cartes=link.voir_cartes, recevoir_alertes=link.recevoir_alertes, voir_profil_urgence=link.voir_profil_urgence, linked_at=link.linked_at) for link in links]


@router.post("/alerts/broadcast", response_model=AlertBroadcastResponse)
def broadcast_alert(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_autiste(user)
    links = db.scalars(select(NetworkLink).where(NetworkLink.autiste_id == user.id)).all()
    if not links:
        raise HTTPException(status_code=400, detail="Votre réseau est vide. Invitez d’abord une personne de confiance.")
    message = f"{user.username} signale qu’il/elle rencontre un problème et a besoin d’aide."
    for link in links:
        db.add(Alert(autiste_id=user.id, contact_id=link.contact_id, message=message))
    db.commit()
    return {"message": "Alerte envoyée à votre réseau.", "recipients": len(links)}


@router.get("/alerts", response_model=list[AlertResponse])
def list_alerts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "reseau":
        raise HTTPException(status_code=403, detail="Réservé aux contacts réseau")
    alerts = db.scalars(select(Alert).where(Alert.contact_id == user.id).order_by(Alert.created_at.desc())).all()
    return [AlertResponse(id=alert.id, autiste_id=alert.autiste_id, autiste_name=alert.autiste.username, message=alert.message, is_read=alert.is_read, created_at=alert.created_at) for alert in alerts]


@router.patch("/alerts/{alert_id}/read", response_model=AlertResponse)
def mark_alert_read(alert_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "reseau":
        raise HTTPException(status_code=403, detail="Réservé aux contacts réseau")
    alert = db.scalar(select(Alert).where(Alert.id == alert_id, Alert.contact_id == user.id))
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte introuvable")
    alert.is_read = True
    db.commit(); db.refresh(alert)
    return AlertResponse(id=alert.id, autiste_id=alert.autiste_id, autiste_name=alert.autiste.username, message=alert.message, is_read=alert.is_read, created_at=alert.created_at)
