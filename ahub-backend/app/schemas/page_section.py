from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PageSectionBase(BaseModel):
    page: str = Field(..., min_length=1, max_length=100)
    section_key: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    image_url: str | None = Field(default=None, max_length=500)


class PageSectionCreate(PageSectionBase):
    pass


class PageSectionUpdate(BaseModel):
    page: str | None = Field(default=None, min_length=1, max_length=100)
    section_key: str | None = Field(default=None, min_length=1, max_length=100)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    image_url: str | None = Field(default=None, max_length=500)


class PageSectionResponse(PageSectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
