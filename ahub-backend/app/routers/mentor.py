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
from app.models.mentor import Mentor
from app.schemas.mentor import (
    MentorCreate,
    MentorResponse,
    MentorUpdate,
)

router = APIRouter(tags=["mentors"])


class ReorderItem(BaseModel):
    id: int
    order: int


@router.get("/api/public/mentors", response_model=List[MentorResponse])
def get_public_mentors(db: Annotated[Session, Depends(get_db)]) -> List[Mentor]:
    return list(db.scalars(select(Mentor).order_by(Mentor.display_order, Mentor.id)))


@router.get("/api/admin/mentors", response_model=List[MentorResponse])
def get_admin_mentors(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[Mentor]:
    _ = current_admin
    return list(db.scalars(select(Mentor).order_by(Mentor.display_order, Mentor.id)))


# IMPORTANT: Specific routes (/reorder, /upload-image) MUST come BEFORE /{mentor_id}
# to prevent FastAPI matching "reorder" as a mentor_id parameter.

@router.put("/api/admin/mentors/reorder", status_code=status.HTTP_200_OK)
def reorder_mentors(
    items: List[ReorderItem],
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Dict[str, str]:
    _ = current_admin
    for item in items:
        mentor = db.get(Mentor, item.id)
        if mentor:
            mentor.display_order = item.order
    db.commit()
    return {"status": "success"}


@router.post("/api/admin/mentors/upload-image")
def upload_mentor_image(
    file: UploadFile = File(...),
    current_admin: Annotated[Admin, Depends(get_current_admin)] = None,
) -> Dict[str, str]:
    _ = current_admin

    upload_dir = os.path.join("uploads", "mentors")
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    relative_path = f"api/public/media/mentors/{unique_filename}"
    return {"image_url": relative_path}


@router.post("/api/admin/mentors", response_model=MentorResponse, status_code=status.HTTP_201_CREATED)
def create_mentor(
    mentor_data: MentorCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Mentor:
    _ = current_admin
    mentor = Mentor(**mentor_data.model_dump())
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return mentor


@router.put("/api/admin/mentors/{mentor_id}", response_model=MentorResponse)
def update_mentor(
    mentor_id: int,
    mentor_data: MentorUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Mentor:
    _ = current_admin
    mentor = db.get(Mentor, mentor_id)
    if mentor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found",
        )

    for field, value in mentor_data.model_dump(exclude_unset=True).items():
        setattr(mentor, field, value)

    db.commit()
    db.refresh(mentor)
    return mentor


@router.delete("/api/admin/mentors/{mentor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mentor(
    mentor_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    mentor = db.get(Mentor, mentor_id)
    if mentor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found",
        )

    db.delete(mentor)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
