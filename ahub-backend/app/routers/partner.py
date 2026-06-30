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
from app.models.partner import Partner
from app.schemas.partner import (
    PartnerCreate,
    PartnerResponse,
    PartnerUpdate,
)

router = APIRouter(tags=["partners"])


class ReorderItem(BaseModel):
    id: int
    order: int


@router.get("/api/public/partner-items", response_model=List[PartnerResponse])
def get_public_partner_items(db: Annotated[Session, Depends(get_db)]) -> List[Partner]:
    return list(db.scalars(select(Partner).order_by(Partner.display_order, Partner.id)))


@router.get("/api/public/partners", response_model=List[Dict[str, Any]])
def get_public_partners(db: Annotated[Session, Depends(get_db)]) -> List[Dict[str, Any]]:
    partners = db.scalars(
        select(Partner)
        .where(Partner.show_in_ticker == True)
        .order_by(Partner.display_order, Partner.id)
    )
    return [{"logo_url": p.logo_url, "name": p.name} for p in partners]


@router.get("/api/admin/partner-items", response_model=List[PartnerResponse])
def get_admin_partner_items(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[Partner]:
    _ = current_admin
    return list(db.scalars(select(Partner).order_by(Partner.display_order, Partner.id)))


@router.put("/api/admin/partner-items/reorder", status_code=status.HTTP_200_OK)
def reorder_partner_items(
    items: List[ReorderItem],
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Dict[str, str]:
    _ = current_admin
    for item in items:
        partner = db.get(Partner, item.id)
        if partner:
            partner.display_order = item.order
    db.commit()
    return {"status": "success"}


@router.post("/api/admin/partner-items/upload-image")
def upload_partner_image(
    file: UploadFile = File(...),
    current_admin: Annotated[Admin, Depends(get_current_admin)] = None,
) -> Dict[str, str]:
    _ = current_admin

    upload_dir = os.path.join("uploads", "partners")
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    relative_path = f"api/public/media/partners/{unique_filename}"
    return {"image_url": relative_path}


@router.post("/api/admin/partner-items", response_model=PartnerResponse, status_code=status.HTTP_201_CREATED)
def create_partner_item(
    partner_data: PartnerCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Partner:
    _ = current_admin
    partner = Partner(**partner_data.model_dump())
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


@router.put("/api/admin/partner-items/{partner_id}", response_model=PartnerResponse)
def update_partner_item(
    partner_id: int,
    partner_data: PartnerUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Partner:
    _ = current_admin
    partner = db.get(Partner, partner_id)
    if partner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found",
        )

    for field, value in partner_data.model_dump(exclude_unset=True).items():
        setattr(partner, field, value)

    db.commit()
    db.refresh(partner)
    return partner


@router.delete("/api/admin/partner-items/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_partner_item(
    partner_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    partner = db.get(Partner, partner_id)
    if partner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found",
        )

    db.delete(partner)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
