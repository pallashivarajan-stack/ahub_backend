from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MentorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    organization: str | None = Field(default=None, max_length=255)
    image_url: str | None = Field(default=None, max_length=500)
    linked_in: str | None = Field(default=None, max_length=500)
    display_order: int = 0


class MentorCreate(MentorBase):
    pass


class MentorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    organization: str | None = Field(default=None, max_length=255)
    image_url: str | None = Field(default=None, max_length=500)
    linked_in: str | None = Field(default=None, max_length=500)
    display_order: int | None = None


class MentorResponse(MentorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
