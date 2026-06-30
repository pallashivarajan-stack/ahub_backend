import os
import uuid
from typing import Annotated, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.admin import Admin
from app.models.infrastructure import InfrastructureItem
from app.schemas.infrastructure import (
    InfrastructureItemCreate,
    InfrastructureItemResponse,
    InfrastructureItemUpdate,
)

router = APIRouter(tags=["infrastructure"])


class ReorderItem(BaseModel):
    id: int
    order: int


@router.get("/api/public/infrastructure", response_model=List[InfrastructureItemResponse])
def get_public_infrastructure(db: Annotated[Session, Depends(get_db)]) -> List[InfrastructureItem]:
    return list(db.scalars(select(InfrastructureItem).order_by(InfrastructureItem.display_order, InfrastructureItem.id)))


@router.get("/api/admin/infrastructure", response_model=List[InfrastructureItemResponse])
def get_admin_infrastructure(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[InfrastructureItem]:
    _ = current_admin
    return list(db.scalars(select(InfrastructureItem).order_by(InfrastructureItem.display_order, InfrastructureItem.id)))


# IMPORTANT: Specific routes (/reorder, /upload-image) MUST come BEFORE /{item_id}
# to prevent FastAPI matching "reorder" or "upload-image" as an item_id parameter.

@router.put("/api/admin/infrastructure/reorder", status_code=status.HTTP_200_OK)
def reorder_infrastructure_items(
    items: List[ReorderItem],
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Dict[str, str]:
    _ = current_admin
    for item in items:
        infra_item = db.get(InfrastructureItem, item.id)
        if infra_item:
            infra_item.display_order = item.order
    db.commit()
    return {"status": "success"}


@router.post("/api/admin/infrastructure/upload-image")
def upload_infrastructure_image(
    file: UploadFile = File(...),
    current_admin: Annotated[Admin, Depends(get_current_admin)] = None,
) -> Dict[str, str]:
    _ = current_admin

    upload_dir = os.path.join("uploads", "infrastructure")
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    relative_path = f"api/public/media/infrastructure/{unique_filename}"
    return {"image_url": relative_path}


@router.post("/api/admin/infrastructure", response_model=InfrastructureItemResponse, status_code=status.HTTP_201_CREATED)
def create_infrastructure_item(
    item_data: InfrastructureItemCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> InfrastructureItem:
    _ = current_admin
    item = InfrastructureItem(**item_data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/api/admin/infrastructure/{item_id}", response_model=InfrastructureItemResponse)
def update_infrastructure_item(
    item_id: int,
    item_data: InfrastructureItemUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> InfrastructureItem:
    _ = current_admin
    item = db.get(InfrastructureItem, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Infrastructure item not found",
        )

    for field, value in item_data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/api/admin/infrastructure/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_infrastructure_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    item = db.get(InfrastructureItem, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Infrastructure item not found",
        )

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
