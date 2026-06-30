from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CaseStudyBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)
    visit_link: str | None = Field(default=None, max_length=1000)
    image_url: str | None = Field(default=None, max_length=500)
    display_order: int = 0


class CaseStudyCreate(CaseStudyBase):
    pass


class CaseStudyUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = Field(default=None, min_length=1)
    visit_link: str | None = Field(default=None, max_length=1000)
    image_url: str | None = Field(default=None, max_length=500)
    display_order: int | None = None


class CaseStudyResponse(CaseStudyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
