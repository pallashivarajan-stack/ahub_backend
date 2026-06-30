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
from app.models.team import TeamMember, TeamPage
from app.schemas.team import (
    TeamMemberCreate,
    TeamMemberResponse,
    TeamMemberUpdate,
    TeamPageCreate,
    TeamPageResponse,
    TeamPageUpdate,
)

router = APIRouter(tags=["team"])


class ReorderItem(BaseModel):
    id: int
    order: int


# === TeamMember ===


@router.get("/api/public/team", response_model=List[TeamMemberResponse])
def get_public_team_members(db: Annotated[Session, Depends(get_db)]) -> List[TeamMember]:
    return list(db.scalars(select(TeamMember).order_by(TeamMember.display_order, TeamMember.id)))


@router.get("/api/admin/team", response_model=List[TeamMemberResponse])
def get_admin_team_members(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[TeamMember]:
    _ = current_admin
    return list(db.scalars(select(TeamMember).order_by(TeamMember.display_order, TeamMember.id)))


# IMPORTANT: Specific routes (/reorder, /upload-image) MUST come BEFORE /{member_id}
# to prevent FastAPI matching "reorder" as a member_id parameter (422 error).

@router.put("/api/admin/team/reorder", status_code=status.HTTP_200_OK)
def reorder_team_members(
    items: List[ReorderItem],
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Dict[str, str]:
    _ = current_admin
    for item in items:
        member = db.get(TeamMember, item.id)
        if member:
            member.display_order = item.order
    db.commit()
    return {"status": "success"}


@router.post("/api/admin/team/upload-image")
def upload_team_image(
    file: UploadFile = File(...),
    current_admin: Annotated[Admin, Depends(get_current_admin)] = None,
) -> Dict[str, str]:
    _ = current_admin

    upload_dir = os.path.join("uploads", "team")
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    relative_path = f"api/public/media/team/{unique_filename}"
    return {"image_url": relative_path}


@router.post("/api/admin/team", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
def create_team_member(
    member_data: TeamMemberCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> TeamMember:
    _ = current_admin
    member = TeamMember(**member_data.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.put("/api/admin/team/{member_id}", response_model=TeamMemberResponse)
def update_team_member(
    member_id: int,
    member_data: TeamMemberUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> TeamMember:
    _ = current_admin
    member = db.get(TeamMember, member_id)
    if member is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found",
        )

    for field, value in member_data.model_dump(exclude_unset=True).items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)
    return member


@router.delete("/api/admin/team/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team_member(
    member_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    member = db.get(TeamMember, member_id)
    if member is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found",
        )

    db.delete(member)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# === TeamPage (singleton) ===


@router.get("/api/public/team-page", response_model=TeamPageResponse)
def get_public_team_page(db: Annotated[Session, Depends(get_db)]):
    return db.scalar(select(TeamPage))


@router.get("/api/admin/team-page", response_model=TeamPageResponse)
def get_admin_team_page(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
):
    _ = current_admin
    return db.scalar(select(TeamPage))


@router.put("/api/admin/team-page", response_model=TeamPageResponse)
def update_team_page(
    page_data: TeamPageUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> TeamPage:
    _ = current_admin
    page = db.scalar(select(TeamPage))
    if page is None:
        page = TeamPage(**page_data.model_dump(exclude_unset=True))
        db.add(page)
    else:
        for field, value in page_data.model_dump(exclude_unset=True).items():
            setattr(page, field, value)
    db.commit()
    db.refresh(page)
    return page


@router.post("/api/admin/team-page/upload-image")
def upload_team_page_image(
    file: UploadFile = File(...),
    current_admin: Annotated[Admin, Depends(get_current_admin)] = None,
) -> Dict[str, str]:
    _ = current_admin

    upload_dir = os.path.join("uploads", "team")
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    relative_path = f"api/public/media/team/{unique_filename}"
    return {"image_url": relative_path}
