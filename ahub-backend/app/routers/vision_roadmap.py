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
from app.models.vision_roadmap import VisionMission, Roadmap, Milestone
from app.schemas.vision_roadmap import (
    VisionMissionCreate,
    VisionMissionResponse,
    VisionMissionUpdate,
    RoadmapResponse,
    RoadmapUpdate,
    MilestoneCreate,
    MilestoneResponse,
    MilestoneUpdate,
)

router = APIRouter(tags=["vision-roadmap"])


class ReorderItem(BaseModel):
    id: int
    order: int


# ── Image Upload (shared) ──

UPLOAD_DIRS = {
    "vision-mission": os.path.join("uploads", "vision-mission"),
    "roadmap": os.path.join("uploads", "roadmap"),
    "milestones": os.path.join("uploads", "milestones"),
}

for _d in UPLOAD_DIRS.values():
    os.makedirs(_d, exist_ok=True)


@router.post("/api/admin/vision-roadmap/upload-image/{entity_type}")
def upload_vision_roadmap_image(
    entity_type: str,
    file: UploadFile = File(...),
    current_admin: Annotated[Admin, Depends(get_current_admin)] = None,
):
    _ = current_admin
    upload_dir = UPLOAD_DIRS.get(entity_type)
    if upload_dir is None:
        raise HTTPException(status_code=400, detail="Invalid entity type")

    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(file.file.read())
    url = f"/api/public/media/{entity_type}/{filename}"
    return {"image_url": url}


# ── Combined endpoint (frontend expects this shape) ──


@router.get("/api/public/vision-roadmap")
def get_public_vision_roadmap_combined(
    db: Annotated[Session, Depends(get_db)],
):
    vision_items = list(
        db.scalars(select(VisionMission).order_by(VisionMission.display_order, VisionMission.id))
    )
    roadmap_items = list(db.scalars(select(Roadmap).order_by(Roadmap.id)))
    milestone_items = list(
        db.scalars(select(Milestone).order_by(Milestone.display_order, Milestone.id))
    )

    vision_data = []
    for i, v in enumerate(vision_items):
        icon = "Rocket" if v.section_type == "vision" else "Target"
        vision_data.append({
            "id": f"vision-{i + 1:02d}",
            "number": f"{i + 1:02d}",
            "icon": icon,
            "title": v.heading,
            "heading": v.description.split(" — ")[0] if v.description and " — " in v.description else v.heading,
            "description": v.description.split(" — ")[1] if v.description and " — " in v.description else (v.description or ""),
            "image": v.image_url or "",
        })

    roadmap_data = None
    if roadmap_items:
        roadmap_data = {
            "image": roadmap_items[0].image_url or "",
            "title": "Strategic Roadmap",
        }

    timeline_years = []
    for m in milestone_items:
        timeline_years.append({
            "year": m.year_label,
            "image": m.image_url or "",
            "label": m.tagline or "",
        })

    return {
        "visionData": vision_data,
        "roadmapData": roadmap_data or {"image": "", "title": "Strategic Roadmap"},
        "timelineYears": timeline_years,
    }


# ── Public Endpoints ──────────────────────────────────────────────────────


@router.get("/api/public/vision-mission", response_model=List[VisionMissionResponse])
def get_public_vision_mission(db: Annotated[Session, Depends(get_db)]) -> List[VisionMission]:
    return list(
        db.scalars(select(VisionMission).order_by(VisionMission.display_order, VisionMission.id))
    )


@router.get("/api/public/roadmap", response_model=List[RoadmapResponse])
def get_public_roadmap(db: Annotated[Session, Depends(get_db)]) -> List[Roadmap]:
    return list(db.scalars(select(Roadmap).order_by(Roadmap.id)))


@router.get("/api/public/milestones", response_model=List[MilestoneResponse])
def get_public_milestones(db: Annotated[Session, Depends(get_db)]) -> List[Milestone]:
    return list(
        db.scalars(select(Milestone).order_by(Milestone.display_order, Milestone.id))
    )


# ── Admin: Vision / Mission ───────────────────────────────────────────────


@router.get("/api/admin/vision-mission", response_model=List[VisionMissionResponse])
def get_admin_vision_mission(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[VisionMission]:
    _ = current_admin
    return list(
        db.scalars(select(VisionMission).order_by(VisionMission.display_order, VisionMission.id))
    )


@router.post("/api/admin/vision-mission", response_model=VisionMissionResponse, status_code=status.HTTP_201_CREATED)
def create_vision_mission(
    item_data: VisionMissionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> VisionMission:
    _ = current_admin
    item = VisionMission(**item_data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/api/admin/vision-mission/{item_id}", response_model=VisionMissionResponse)
def update_vision_mission(
    item_id: int,
    item_data: VisionMissionUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> VisionMission:
    _ = current_admin
    item = db.get(VisionMission, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    for field, value in item_data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/api/admin/vision-mission/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vision_mission(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    item = db.get(VisionMission, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ── Admin: Roadmap ────────────────────────────────────────────────────────


@router.get("/api/admin/roadmap", response_model=List[RoadmapResponse])
def get_admin_roadmap(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[Roadmap]:
    _ = current_admin
    return list(db.scalars(select(Roadmap).order_by(Roadmap.id)))


@router.post("/api/admin/roadmap", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
def create_roadmap(
    item_data: RoadmapUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Roadmap:
    _ = current_admin
    item = Roadmap(**item_data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/api/admin/roadmap/{item_id}", response_model=RoadmapResponse)
def update_roadmap(
    item_id: int,
    item_data: RoadmapUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Roadmap:
    _ = current_admin
    item = db.get(Roadmap, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found")
    for field, value in item_data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/api/admin/roadmap/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_roadmap(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    item = db.get(Roadmap, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found")
    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ── Admin: Milestones ─────────────────────────────────────────────────────


@router.get("/api/admin/milestones", response_model=List[MilestoneResponse])
def get_admin_milestones(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[Milestone]:
    _ = current_admin
    return list(
        db.scalars(select(Milestone).order_by(Milestone.display_order, Milestone.id))
    )


@router.post("/api/admin/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
def create_milestone(
    item_data: MilestoneCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Milestone:
    _ = current_admin
    item = Milestone(**item_data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/api/admin/milestones/{item_id}", response_model=MilestoneResponse)
def update_milestone(
    item_id: int,
    item_data: MilestoneUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Milestone:
    _ = current_admin
    item = db.get(Milestone, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    for field, value in item_data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/api/admin/milestones/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    item = db.get(Milestone, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/api/admin/milestones/reorder", status_code=status.HTTP_200_OK)
def reorder_milestones(
    items: List[ReorderItem],
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Dict[str, str]:
    _ = current_admin
    for reorder_item in items:
        milestone = db.get(Milestone, reorder_item.id)
        if milestone:
            milestone.display_order = reorder_item.order
    db.commit()
    return {"status": "success"}
