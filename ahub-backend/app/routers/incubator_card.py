from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.admin import Admin
from app.models.incubator_card import IncubatorCard
from app.schemas.incubator_card import (
    IncubatorCardCreate,
    IncubatorCardResponse,
    IncubatorCardUpdate,
)
from app.services.incubator_card_service import (
    create_incubator_card,
    delete_incubator_card,
    get_incubator_card,
    get_incubator_cards,
    update_incubator_card,
)

router = APIRouter(prefix="/incubator-cards", tags=["incubator-cards"])


@router.get("", response_model=list[IncubatorCardResponse])
def read_incubator_cards(
    db: Annotated[Session, Depends(get_db)],
) -> list[IncubatorCard]:
    return get_incubator_cards(db)


@router.get("/{card_id}", response_model=IncubatorCardResponse)
def read_incubator_card(
    card_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> IncubatorCard:
    card = get_incubator_card(db, card_id)

    if card is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incubator card not found",
        )

    return card


@router.post(
    "",
    response_model=IncubatorCardResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_incubator_card_route(
    card_data: IncubatorCardCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> IncubatorCard:
    _ = current_admin
    return create_incubator_card(db, card_data)


@router.put("/{card_id}", response_model=IncubatorCardResponse)
def update_incubator_card_route(
    card_id: int,
    card_data: IncubatorCardUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> IncubatorCard:
    _ = current_admin
    card = update_incubator_card(db, card_id, card_data)

    if card is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incubator card not found",
        )

    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incubator_card_route(
    card_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    deleted = delete_incubator_card(db, card_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incubator card not found",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
