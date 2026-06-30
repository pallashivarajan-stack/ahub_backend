from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.startup import Startup
from app.schemas.startup import StartupCreate, StartupUpdate


def get_startups(db: Session) -> list[Startup]:
    return list(db.scalars(select(Startup).order_by(Startup.display_order, Startup.id)))


def get_startup(db: Session, startup_id: int) -> Startup | None:
    return db.get(Startup, startup_id)


def create_startup(db: Session, startup_data: StartupCreate) -> Startup:
    startup = Startup(**startup_data.model_dump())

    db.add(startup)
    db.commit()
    db.refresh(startup)

    return startup


def update_startup(
    db: Session,
    startup_id: int,
    startup_data: StartupUpdate,
) -> Startup | None:
    startup = db.get(Startup, startup_id)

    if startup is None:
        return None

    for field, value in startup_data.model_dump(exclude_unset=True).items():
        setattr(startup, field, value)

    db.commit()
    db.refresh(startup)

    return startup


def delete_startup(db: Session, startup_id: int) -> bool:
    startup = db.get(Startup, startup_id)

    if startup is None:
        return False

    db.delete(startup)
    db.commit()

    return True
