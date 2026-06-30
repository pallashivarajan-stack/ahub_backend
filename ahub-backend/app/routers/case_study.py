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
from app.models.case_study import CaseStudy
from app.schemas.case_study import (
    CaseStudyCreate,
    CaseStudyResponse,
    CaseStudyUpdate,
)

router = APIRouter(tags=["case-studies"])


class ReorderItem(BaseModel):
    id: int
    order: int


@router.get("/api/public/case-studies", response_model=List[CaseStudyResponse])
def get_public_case_studies(db: Annotated[Session, Depends(get_db)]) -> List[CaseStudy]:
    return list(db.scalars(select(CaseStudy).order_by(CaseStudy.display_order, CaseStudy.id)))


@router.get("/api/admin/case-studies", response_model=List[CaseStudyResponse])
def get_admin_case_studies(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[CaseStudy]:
    _ = current_admin
    return list(db.scalars(select(CaseStudy).order_by(CaseStudy.display_order, CaseStudy.id)))


# IMPORTANT: Specific routes (/reorder, /upload-image) MUST come BEFORE /{study_id}
# to prevent FastAPI matching "reorder" or "upload-image" as a study_id parameter.

@router.put("/api/admin/case-studies/reorder", status_code=status.HTTP_200_OK)
def reorder_case_studies(
    items: List[ReorderItem],
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Dict[str, str]:
    _ = current_admin
    for item in items:
        study = db.get(CaseStudy, item.id)
        if study:
            study.display_order = item.order
    db.commit()
    return {"status": "success"}


@router.post("/api/admin/case-studies/upload-image")
def upload_case_study_image(
    file: UploadFile = File(...),
    current_admin: Annotated[Admin, Depends(get_current_admin)] = None,
) -> Dict[str, str]:
    _ = current_admin

    upload_dir = os.path.join("uploads", "case-studies")
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    relative_path = f"api/public/media/case-studies/{unique_filename}"
    return {"image_url": relative_path}


@router.post("/api/admin/case-studies", response_model=CaseStudyResponse, status_code=status.HTTP_201_CREATED)
def create_case_study(
    study_data: CaseStudyCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> CaseStudy:
    _ = current_admin
    study = CaseStudy(**study_data.model_dump())
    db.add(study)
    db.commit()
    db.refresh(study)
    return study


@router.put("/api/admin/case-studies/{study_id}", response_model=CaseStudyResponse)
def update_case_study(
    study_id: int,
    study_data: CaseStudyUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> CaseStudy:
    _ = current_admin
    study = db.get(CaseStudy, study_id)
    if study is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case study not found",
        )

    for field, value in study_data.model_dump(exclude_unset=True).items():
        setattr(study, field, value)

    db.commit()
    db.refresh(study)
    return study


@router.delete("/api/admin/case-studies/{study_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case_study(
    study_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    study = db.get(CaseStudy, study_id)
    if study is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case study not found",
        )

    db.delete(study)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
