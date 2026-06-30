from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InfrastructureItemBase(BaseModel):
    section: str = Field(..., min_length=1, max_length=50)
    label: str = Field(..., min_length=1, max_length=255)
    image_url: str | None = Field(default=None, max_length=500)
    display_order: int = 0


class InfrastructureItemCreate(InfrastructureItemBase):
    pass


class InfrastructureItemUpdate(BaseModel):
    section: str | None = Field(default=None, min_length=1, max_length=50)
    label: str | None = Field(default=None, min_length=1, max_length=255)
    image_url: str | None = Field(default=None, max_length=500)
    display_order: int | None = None


class InfrastructureItemResponse(InfrastructureItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
