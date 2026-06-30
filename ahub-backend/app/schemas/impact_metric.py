from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ImpactMetricBase(BaseModel):
    metric_id: str
    value: str
    label: str
    sub_label: str | None = None
    display_order: int = 0


class ImpactMetricCreate(ImpactMetricBase):
    pass


class ImpactMetricUpdate(BaseModel):
    metric_id: str | None = None
    value: str | None = None
    label: str | None = None
    sub_label: str | None = None
    display_order: int | None = None


class ImpactMetricResponse(ImpactMetricBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ImpactMetricPublic(BaseModel):
    id: str
    value: str
    label: str
    sub_label: str | None = None
