from typing import Annotated, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.admin import Admin
from app.models.press import PressItem, PressPage
from app.schemas.press import (
    PressItemCreate,
    PressItemResponse,
    PressItemUpdate,
    PressPageCreate,
    PressPageResponse,
    PressPageUpdate,
)

router = APIRouter(tags=["press"])


class ReorderItem(BaseModel):
    id: int
    order: int


# === PressItem ===


@router.get("/api/public/press", response_model=List[PressItemResponse])
def get_public_press_items(db: Annotated[Session, Depends(get_db)]) -> List[PressItem]:
    return list(db.scalars(select(PressItem).order_by(PressItem.display_order, PressItem.id)))


@router.get("/api/admin/press", response_model=List[PressItemResponse])
def get_admin_press_items(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> List[PressItem]:
    _ = current_admin
    return list(db.scalars(select(PressItem).order_by(PressItem.display_order, PressItem.id)))


# IMPORTANT: Specific routes (/reorder) MUST come BEFORE /{item_id}
# to prevent FastAPI matching "reorder" as an item_id parameter (422 error).

@router.put("/api/admin/press/reorder", status_code=status.HTTP_200_OK)
def reorder_press_items(
    items: List[ReorderItem],
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Dict[str, str]:
    _ = current_admin
    for item in items:
        press_item = db.get(PressItem, item.id)
        if press_item:
            press_item.display_order = item.order
    db.commit()
    return {"status": "success"}


@router.post("/api/admin/press", response_model=PressItemResponse, status_code=status.HTTP_201_CREATED)
def create_press_item(
    item_data: PressItemCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> PressItem:
    _ = current_admin
    item = PressItem(**item_data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/api/admin/press/{item_id}", response_model=PressItemResponse)
def update_press_item(
    item_id: int,
    item_data: PressItemUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> PressItem:
    _ = current_admin
    item = db.get(PressItem, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Press item not found",
        )

    for field, value in item_data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/api/admin/press/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_press_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    item = db.get(PressItem, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Press item not found",
        )

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# === PressPage (singleton) ===


@router.get("/api/public/press-page", response_model=PressPageResponse)
def get_public_press_page(db: Annotated[Session, Depends(get_db)]):
    return db.scalar(select(PressPage))


@router.get("/api/admin/press-page", response_model=PressPageResponse)
def get_admin_press_page(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
):
    _ = current_admin
    return db.scalar(select(PressPage))


@router.put("/api/admin/press-page", response_model=PressPageResponse)
def update_press_page(
    page_data: PressPageUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> PressPage:
    _ = current_admin
    page = db.scalar(select(PressPage))
    if page is None:
        page = PressPage(**page_data.model_dump(exclude_unset=True))
        db.add(page)
    else:
        for field, value in page_data.model_dump(exclude_unset=True).items():
            setattr(page, field, value)
    db.commit()
    db.refresh(page)
    return page
