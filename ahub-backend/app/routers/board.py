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
from app.models.board import BoardMember
from app.schemas.board import (
    BoardMemberCreate,
    BoardMemberResponse,
    BoardMemberUpdate,
)

router = APIRouter(tags=["board"])

class ReorderItem(BaseModel):
    id: int
    order: int


@router.get("/api/public/board", response_model=List[BoardMemberResponse])
def get_public_board(db: Annotated[Session, Depends(get_db)]) -> List[BoardMember]:
    # Return board members sorted by display_order
    return list(db.scalars(select(BoardMember).order_by(BoardMember.display_order, BoardMember.id)))


@router.get("/api/admin/board", response_model=List[BoardMemberResponse])
def get_admin_board(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[BoardMember]:
    _ = current_admin
    return list(db.scalars(select(BoardMember).order_by(BoardMember.display_order, BoardMember.id)))


# IMPORTANT: Specific routes (/reorder, /upload-image) MUST come BEFORE /{member_id}
# to prevent FastAPI matching "reorder" or "upload-image" as a member_id parameter.

@router.put("/api/admin/board/reorder", status_code=status.HTTP_200_OK)
def reorder_board_members(
    items: List[ReorderItem],
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Dict[str, str]:
    _ = current_admin
    for item in items:
        member = db.get(BoardMember, item.id)
        if member:
            member.display_order = item.order
    db.commit()
    return {"status": "success"}


@router.post("/api/admin/board/upload-image")
def upload_board_image(
    file: UploadFile = File(...),
    current_admin: Annotated[Admin, Depends(get_current_admin)] = None,
) -> Dict[str, str]:
    _ = current_admin

    # Save directory: uploads/board/
    upload_dir = os.path.join("uploads", "board")
    os.makedirs(upload_dir, exist_ok=True)

    # Create unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    # Write file content
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    # Return relative path matching the /api/public/media static mount
    # resolveBackendMediaUrl("api/public/media/board/xxx.jpg") → http://localhost:8000/api/public/media/board/xxx.jpg
    relative_path = f"api/public/media/board/{unique_filename}"
    return {"image_url": relative_path}


@router.post("/api/admin/board", response_model=BoardMemberResponse, status_code=status.HTTP_201_CREATED)
def create_board_member(
    member_data: BoardMemberCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> BoardMember:
    _ = current_admin
    member = BoardMember(**member_data.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.put("/api/admin/board/{member_id}", response_model=BoardMemberResponse)
def update_board_member(
    member_id: int,
    member_data: BoardMemberUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> BoardMember:
    _ = current_admin
    member = db.get(BoardMember, member_id)
    if member is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board member not found",
        )

    for field, value in member_data.model_dump(exclude_unset=True).items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)
    return member


@router.delete("/api/admin/board/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board_member(
    member_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    member = db.get(BoardMember, member_id)
    if member is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board member not found",
        )

    db.delete(member)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
