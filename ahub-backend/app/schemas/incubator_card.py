from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class IncubatorCardBase(BaseModel):
    heading: str = Field(..., min_length=1, max_length=255)
    subheading: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    image_url: str | None = Field(default=None, max_length=500)
    display_order: int = 0


class IncubatorCardCreate(IncubatorCardBase):
    pass


class IncubatorCardUpdate(BaseModel):
    heading: str | None = Field(default=None, min_length=1, max_length=255)
    subheading: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    image_url: str | None = Field(default=None, max_length=500)
    display_order: int | None = None


class IncubatorCardResponse(IncubatorCardBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
