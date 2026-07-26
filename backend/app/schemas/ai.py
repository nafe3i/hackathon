from pydantic import BaseModel, Field


class PublicCard(BaseModel):
    state: str
    message: str


class PublicContact(BaseModel):
    name: str
    phone: str


class PublicEmergencyProfile(BaseModel):
    public_id: str
    name: str
    initial_message: str
    cards: list[PublicCard]
    contacts: list[PublicContact]


class PublicChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    history: list[dict[str, str]] = Field(default_factory=list, max_length=10)


class PublicChatResponse(BaseModel):
    reply: str
    source: str
