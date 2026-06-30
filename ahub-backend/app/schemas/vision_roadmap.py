from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ── Vision / Mission ──

class VisionMissionCreate(BaseModel):
    section_type: str = Field(..., pattern="^(vision|mission)$")
    heading: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    image_url: str | None = None
    display_order: int = 0


class VisionMissionUpdate(BaseModel):
    heading: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    image_url: str | None = None
    display_order: int | None = None


class VisionMissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    section_type: str
    heading: str
    description: str | None = None
    image_url: str | None = None
    display_order: int
    created_at: datetime
    updated_at: datetime


# ── Roadmap ──

class RoadmapUpdate(BaseModel):
    image_url: str | None = None


class RoadmapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str | None = None


# ── Milestones ──

class MilestoneCreate(BaseModel):
    year_label: str = Field(..., min_length=1, max_length=50)
    image_url: str | None = None
    tagline: str | None = Field(default=None, max_length=255)
    display_order: int = 0


class MilestoneUpdate(BaseModel):
    year_label: str | None = Field(default=None, min_length=1, max_length=50)
    image_url: str | None = None
    tagline: str | None = Field(default=None, max_length=255)
    display_order: int | None = None


class MilestoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    year_label: str
    image_url: str | None = None
    tagline: str | None = None
    display_order: int
    created_at: datetime
    updated_at: datetime
