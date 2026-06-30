from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.admin import Admin
from app.models.page_section import PageSection
from app.schemas.page_section import (
    PageSectionCreate,
    PageSectionResponse,
    PageSectionUpdate,
)
from app.services.page_section_service import (
    create_section,
    get_home_sections,
    update_section,
)

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/home", response_model=list[PageSectionResponse])
def read_home_sections(db: Annotated[Session, Depends(get_db)]) -> list[PageSection]:
    return get_home_sections(db)


@router.post(
    "/section",
    response_model=PageSectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_page_section(
    section_data: PageSectionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> PageSection:
    _ = current_admin
    try:
        return create_section(db, section_data)
    except IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Section already exists for this page and section key",
        ) from exc


@router.put("/section/{section_id}", response_model=PageSectionResponse)
def update_page_section(
    section_id: int,
    section_data: PageSectionUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> PageSection:
    _ = current_admin
    try:
        section = update_section(db, section_id, section_data)
    except IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Section already exists for this page and section key",
        ) from exc

    if section is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page section not found",
        )

    return section
