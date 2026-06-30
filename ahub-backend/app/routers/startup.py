import os
import uuid
from typing import Annotated, List, Dict

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.admin import Admin
from app.models.startup import Startup
from app.schemas.startup import StartupCreate, StartupResponse, StartupUpdate
from app.services.startup_service import (
    create_startup,
    delete_startup,
    get_startup,
    get_startups,
    update_startup,
)

router = APIRouter(tags=["startups"])


class ReorderItem(BaseModel):
    id: int
    order: int


# --- /api/v1/companies endpoints (existing) ---

@router.get("/api/v1/companies", response_model=list[StartupResponse])
def read_companies(db: Annotated[Session, Depends(get_db)]) -> list[Startup]:
    return get_startups(db)


@router.get("/api/v1/companies/{startup_id}", response_model=StartupResponse)
def read_company(startup_id: int, db: Annotated[Session, Depends(get_db)]) -> Startup:
    startup = get_startup(db, startup_id)
    if startup is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")
    return startup


@router.post("/api/v1/companies", response_model=StartupResponse, status_code=status.HTTP_201_CREATED)
def create_company(
    startup_data: StartupCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Startup:
    _ = current_admin
    return create_startup(db, startup_data)


@router.put("/api/v1/companies/{startup_id}", response_model=StartupResponse)
def update_company(
    startup_id: int,
    startup_data: StartupUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Startup:
    _ = current_admin
    startup = update_startup(db, startup_id, startup_data)
    if startup is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")
    return startup


@router.delete("/api/v1/companies/{startup_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(
    startup_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    deleted = delete_startup(db, startup_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- /api/public/portfolio-companies endpoint ---

@router.get("/api/public/portfolio-companies", response_model=list[StartupResponse])
def read_public_portfolio(db: Annotated[Session, Depends(get_db)]) -> list[Startup]:
    return get_startups(db)


# --- /api/public/startups-ticker endpoint ---

@router.get("/api/public/startups-ticker", response_model=list[StartupResponse])
def read_public_startups_ticker(db: Annotated[Session, Depends(get_db)]) -> list[Startup]:
    return get_startups(db)


# --- /api/admin/startups endpoints ---
# IMPORTANT: Specific routes (/reorder, /upload-image) MUST come BEFORE /{startup_id}
# to prevent FastAPI from matching "reorder" as a startup_id parameter.

@router.put("/api/admin/startups/reorder", status_code=status.HTTP_200_OK)
def reorder_startups(
    items: List[ReorderItem],
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Dict[str, str]:
    _ = current_admin
    for item in items:
        startup = db.get(Startup, item.id)
        if startup:
            startup.display_order = item.order
    db.commit()
    return {"status": "success"}


@router.post("/api/admin/startups/upload-image")
def upload_startup_image(
    file: UploadFile = File(...),
    current_admin: Annotated[Admin, Depends(get_current_admin)] = None,
) -> Dict[str, str]:
    _ = current_admin
    upload_dir = os.path.join("uploads", "startups")
    os.makedirs(upload_dir, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    relative_path = f"api/public/media/startups/{unique_filename}"
    return {"image_url": relative_path}


@router.get("/api/admin/startups", response_model=list[StartupResponse])
def read_admin_startups(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> list[Startup]:
    _ = current_admin
    return get_startups(db)


@router.get("/api/admin/startups/{startup_id}", response_model=StartupResponse)
def read_admin_startup(
    startup_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Startup:
    _ = current_admin
    startup = get_startup(db, startup_id)
    if startup is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")
    return startup


@router.post("/api/admin/startups", response_model=StartupResponse, status_code=status.HTTP_201_CREATED)
def create_admin_startup(
    startup_data: StartupCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Startup:
    _ = current_admin
    return create_startup(db, startup_data)


@router.put("/api/admin/startups/{startup_id}", response_model=StartupResponse)
def update_admin_startup(
    startup_id: int,
    startup_data: StartupUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Startup:
    _ = current_admin
    startup = update_startup(db, startup_id, startup_data)
    if startup is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")
    return startup


@router.delete("/api/admin/startups/{startup_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_startup(
    startup_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    deleted = delete_startup(db, startup_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
