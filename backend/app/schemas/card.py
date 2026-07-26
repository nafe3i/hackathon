from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CardCreate(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    state: str = Field(min_length=1, max_length=120)
    tone: str = Field(default="neutre", max_length=30)
    pictogram: str | None = None
    audio: str | None = None
    is_public: bool = False
    is_shared: bool = False


class CardUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1, max_length=1000)
    state: str | None = Field(default=None, min_length=1, max_length=120)
    tone: str | None = Field(default=None, max_length=30)
    pictogram: str | None = None
    audio: str | None = None
    is_public: bool | None = None
    is_shared: bool | None = None


class CardResponse(CardCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    created_at: datetime
