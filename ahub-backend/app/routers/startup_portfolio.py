import os
import re
import uuid
from typing import Annotated, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.admin import Admin
from app.models.startup import Startup
from app.schemas.startup import StartupCreate, StartupResponse, StartupUpdate

router = APIRouter(tags=["startup-portfolio"])


def sanitize_filename(name: str) -> str:
    name = name.replace("(", "_").replace(")", "_").replace(",", "_").replace(" ", "_")
    name = re.sub(r"_+", "_", name)
    name = name.strip("_")
    return name.lower()


class ReorderItem(BaseModel):
    id: int
    order: int


# ── Public Endpoints ──

@router.get("/api/public/startup-portfolio")
def get_public_startup_portfolio(db: Annotated[Session, Depends(get_db)]) -> dict:
    startups = list(db.scalars(select(Startup).order_by(Startup.display_order, Startup.id)))
    featured = [s for s in startups if s.featured]
    categories = sorted({s.category for s in startups if s.category})
    industries = sorted({s.industry for s in startups if s.industry})
    funding_stages = sorted({s.funding_stage for s in startups if s.funding_stage})

    def to_item(s: Startup) -> dict:
        return {
            "id": str(s.id),
            "name": s.name,
            "logo": f"api/public/media/companies/{os.path.basename(s.logo_url)}" if s.logo_url else None,
            "category": s.category or "",
            "industry": s.industry or "",
            "founded": s.founded_year,
            "fundingStage": s.funding_stage or "",
            "description": s.short_description,
            "website": s.website_url,
            "popularity": s.popularity or 0,
            "addedOrder": s.display_order,
        }

    return {
        "startupDirectory": [to_item(s) for s in startups],
        "logoMarquee": [
            {
                "name": s.name,
                "logo": f"api/public/media/companies/{os.path.basename(s.logo_url)}" if s.logo_url else None,
            }
            for s in featured
        ],
        "categories": ["All"] + categories,
        "industries": ["All"] + industries,
        "fundingStages": ["All"] + funding_stages,
    }


@router.get("/api/public/startups-ticker")
def get_public_startups_ticker(db: Annotated[Session, Depends(get_db)]) -> List[dict]:
    featured = list(
        db.scalars(
            select(Startup).where(Startup.featured == True).order_by(Startup.display_order, Startup.id)  # noqa: E712
        )
    )
    return [
        {
            "name": s.name,
            "logo": f"api/public/media/companies/{os.path.basename(s.logo_url)}" if s.logo_url else None,
        }
        for s in featured
    ]


# ── Admin Endpoints ──

@router.get("/api/admin/startups", response_model=List[StartupResponse])
def get_admin_startups(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[Startup]:
    _ = current_admin
    return list(db.scalars(select(Startup).order_by(Startup.display_order, Startup.id)))


@router.post("/api/admin/startups", response_model=StartupResponse, status_code=status.HTTP_201_CREATED)
def create_startup(
    startup_data: StartupCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Startup:
    _ = current_admin
    startup = Startup(**startup_data.model_dump())
    db.add(startup)
    db.commit()
    db.refresh(startup)
    return startup


@router.put("/api/admin/startups/{startup_id}", response_model=StartupResponse)
def update_startup_route(
    startup_id: int,
    startup_data: StartupUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Startup:
    _ = current_admin
    startup = db.get(Startup, startup_id)
    if startup is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")

    for field, value in startup_data.model_dump(exclude_unset=True).items():
        setattr(startup, field, value)

    db.commit()
    db.refresh(startup)
    return startup


@router.delete("/api/admin/startups/{startup_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_startup_route(
    startup_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    startup = db.get(Startup, startup_id)
    if startup is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")

    db.delete(startup)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/api/admin/startups/upload-image")
def upload_startup_image(
    file: UploadFile = File(...),
    current_admin: Annotated[Admin, Depends(get_current_admin)] = None,
) -> Dict[str, str]:
    _ = current_admin

    upload_dir = os.path.join("uploads", "companies")
    os.makedirs(upload_dir, exist_ok=True)

    orig_name = os.path.splitext(file.filename or "image.jpg")
    ext = orig_name[1].lower()
    base = sanitize_filename(orig_name[0])
    unique_filename = f"{base}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    relative_path = f"api/public/media/companies/{unique_filename}"
    return {"image_url": relative_path}


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
