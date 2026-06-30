from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate


def get_events(db: Session) -> list[Event]:
    return list(db.scalars(select(Event).order_by(Event.event_date, Event.id)))


def get_event(db: Session, event_id: int) -> Event | None:
    return db.get(Event, event_id)


def create_event(db: Session, event_data: EventCreate) -> Event:
    event = Event(**event_data.model_dump())

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def update_event(
    db: Session,
    event_id: int,
    event_data: EventUpdate,
) -> Event | None:
    event = db.get(Event, event_id)

    if event is None:
        return None

    for field, value in event_data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)

    return event


def delete_event(db: Session, event_id: int) -> bool:
    event = db.get(Event, event_id)

    if event is None:
        return False

    db.delete(event)
    db.commit()

    return True
