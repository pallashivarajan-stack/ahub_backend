from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class StartupBase(BaseModel):
    name: str = Field(..., max_length=255)
    logo_url: str | None = Field(default=None, max_length=500)
    short_description: str = Field(...)
    website_url: str | None = Field(default=None, max_length=500)
    founder_name: str = Field(..., max_length=255)
    founder_image_url: str | None = Field(default=None, max_length=500)
    linkedin_url: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=100)
    industry: str | None = Field(default=None, max_length=100)
    founded_year: int | None = None
    funding_stage: str | None = Field(default=None, max_length=100)
    featured: bool = False
    popularity: int | None = 0
    display_order: int = 0


class StartupCreate(StartupBase):
    pass


class StartupUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    logo_url: str | None = Field(default=None, max_length=500)
    short_description: str | None = Field(default=None)
    website_url: str | None = Field(default=None, max_length=500)
    founder_name: str | None = Field(default=None, max_length=255)
    founder_image_url: str | None = Field(default=None, max_length=500)
    linkedin_url: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=100)
    industry: str | None = Field(default=None, max_length=100)
    founded_year: int | None = None
    funding_stage: str | None = Field(default=None, max_length=100)
    featured: bool | None = None
    popularity: int | None = None
    display_order: int | None = None


class StartupResponse(StartupBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
