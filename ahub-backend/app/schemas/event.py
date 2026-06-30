from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    image_url: str | None = Field(default=None, max_length=500)
    event_date: datetime
    location: str = Field(..., min_length=1, max_length=255)
    registration_link: str | None = Field(default=None, max_length=500)


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    image_url: str | None = Field(default=None, max_length=500)
    event_date: datetime | None = None
    location: str | None = Field(default=None, min_length=1, max_length=255)
    registration_link: str | None = Field(default=None, max_length=500)


class EventResponse(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
