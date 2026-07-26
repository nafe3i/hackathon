from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class InvitationCreate(BaseModel):
    email: EmailStr


class InvitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    token: str
    status: str
    created_at: datetime
    expires_at: datetime


class InvitationPublic(BaseModel):
    email: EmailStr
    owner_name: str
    status: str
    expires_at: datetime


class InvitationAccept(BaseModel):
    username: str = Field(min_length=2, max_length=80)
    password: str = Field(min_length=8, max_length=72)
    phone: str = Field(min_length=6, max_length=30)


class InvitationDecision(BaseModel):
    message: str


class NetworkContact(BaseModel):
    link_id: str
    contact_id: str
    username: str
    email: EmailStr
    phone: str | None
    voir_cartes: bool
    recevoir_alertes: bool
    voir_profil_urgence: bool
    linked_at: datetime


class AlertResponse(BaseModel):
    id: str
    autiste_id: str
    autiste_name: str
    message: str
    is_read: bool
    created_at: datetime


class AlertBroadcastResponse(BaseModel):
    message: str
    recipients: int
