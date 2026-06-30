from typing import Annotated, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.admin import Admin
from app.models.impact_metric import ImpactMetric
from app.schemas.impact_metric import (
    ImpactMetricCreate,
    ImpactMetricPublic,
    ImpactMetricResponse,
    ImpactMetricUpdate,
)

router = APIRouter(tags=["impact_metrics"])


class ReorderItem(BaseModel):
    id: int
    order: int


# --- Public endpoints ---

@router.get("/api/public/impact", response_model=List[ImpactMetricPublic])
def get_public_impact(db: Annotated[Session, Depends(get_db)]) -> List[ImpactMetricPublic]:
    metrics = db.scalars(select(ImpactMetric).order_by(ImpactMetric.display_order, ImpactMetric.id)).all()
    return [
        ImpactMetricPublic(
            id=m.metric_id,
            value=m.value,
            label=m.label,
            sub_label=m.sub_label,
        )
        for m in metrics
    ]


# --- Admin endpoints ---

@router.get("/api/admin/impact-metrics", response_model=List[ImpactMetricResponse])
def get_admin_impact_metrics(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[ImpactMetric]:
    _ = current_admin
    return list(db.scalars(select(ImpactMetric).order_by(ImpactMetric.display_order, ImpactMetric.id)))


@router.put("/api/admin/impact-metrics/reorder", status_code=status.HTTP_200_OK)
def reorder_impact_metrics(
    items: List[ReorderItem],
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Dict[str, str]:
    _ = current_admin
    for item in items:
        metric = db.get(ImpactMetric, item.id)
        if metric:
            metric.display_order = item.order
    db.commit()
    return {"status": "success"}


@router.post("/api/admin/impact-metrics", response_model=ImpactMetricResponse, status_code=status.HTTP_201_CREATED)
def create_impact_metric(
    metric_data: ImpactMetricCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> ImpactMetric:
    _ = current_admin
    metric = ImpactMetric(**metric_data.model_dump())
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


@router.put("/api/admin/impact-metrics/{metric_id}", response_model=ImpactMetricResponse)
def update_impact_metric(
    metric_id: int,
    metric_data: ImpactMetricUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> ImpactMetric:
    _ = current_admin
    metric = db.get(ImpactMetric, metric_id)
    if metric is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Impact metric not found",
        )
    for field, value in metric_data.model_dump(exclude_unset=True).items():
        setattr(metric, field, value)
    db.commit()
    db.refresh(metric)
    return metric


@router.delete("/api/admin/impact-metrics/{metric_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_impact_metric(
    metric_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    metric = db.get(ImpactMetric, metric_id)
    if metric is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Impact metric not found",
        )
    db.delete(metric)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
