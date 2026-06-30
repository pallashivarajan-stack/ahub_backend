from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class TeamMemberBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    tagline: str | None = Field(default=None)
    image_url: str | None = Field(default=None, max_length=500)
    visit_link: str | None = Field(default=None, max_length=500)
    display_order: int = 0


class TeamMemberCreate(TeamMemberBase):
    pass


class TeamMemberUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    tagline: str | None = None
    image_url: str | None = Field(default=None, max_length=500)
    visit_link: str | None = Field(default=None, max_length=500)
    display_order: int | None = None


class TeamMemberResponse(TeamMemberBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class TeamPageBase(BaseModel):
    group_photo: str | None = Field(default=None, max_length=500)
    title: str | None = Field(default=None, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    description: str | None = None
    member_count_label: str | None = Field(default=None, max_length=100)


class TeamPageCreate(TeamPageBase):
    pass


class TeamPageUpdate(BaseModel):
    group_photo: str | None = Field(default=None, max_length=500)
    title: str | None = Field(default=None, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    description: str | None = None
    member_count_label: str | None = Field(default=None, max_length=100)


class TeamPageResponse(TeamPageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
