from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.admin import Admin
from app.models.event import Event
from app.schemas.event import EventCreate, EventResponse, EventUpdate
from app.services.event_service import (
    create_event,
    delete_event,
    get_event,
    get_events,
    update_event,
)

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventResponse])
def read_events(db: Annotated[Session, Depends(get_db)]) -> list[Event]:
    return get_events(db)


@router.get("/{event_id}", response_model=EventResponse)
def read_event(event_id: int, db: Annotated[Session, Depends(get_db)]) -> Event:
    event = get_event(db, event_id)

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return event


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event_route(
    event_data: EventCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Event:
    _ = current_admin
    return create_event(db, event_data)


@router.put("/{event_id}", response_model=EventResponse)
def update_event_route(
    event_id: int,
    event_data: EventUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Event:
    _ = current_admin
    event = update_event(db, event_id, event_data)

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event_route(
    event_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> Response:
    _ = current_admin
    deleted = delete_event(db, event_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
