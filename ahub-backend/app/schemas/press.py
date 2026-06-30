from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PressItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    date: str = Field(..., min_length=1, max_length=100)
    url: str = Field(..., min_length=1, max_length=1000)
    description: str = Field(..., min_length=1)
    source: str = Field(..., min_length=1, max_length=255)
    tag: str = Field(..., min_length=1, max_length=100)
    display_order: int = 0


class PressItemCreate(PressItemBase):
    pass


class PressItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    date: str | None = Field(default=None, min_length=1, max_length=100)
    url: str | None = Field(default=None, min_length=1, max_length=1000)
    description: str | None = Field(default=None, min_length=1)
    source: str | None = Field(default=None, min_length=1, max_length=255)
    tag: str | None = Field(default=None, min_length=1, max_length=100)
    display_order: int | None = None


class PressItemResponse(PressItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class PressPageBase(BaseModel):
    heading: str = Field(default="Press", max_length=255)
    subheading: str | None = Field(default=None, max_length=1000)


class PressPageCreate(PressPageBase):
    pass


class PressPageUpdate(BaseModel):
    heading: str | None = Field(default=None, max_length=255)
    subheading: str | None = Field(default=None, max_length=1000)


class PressPageResponse(PressPageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
