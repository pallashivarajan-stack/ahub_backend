from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.incubator_card import IncubatorCard
from app.schemas.incubator_card import IncubatorCardCreate, IncubatorCardUpdate


def get_incubator_cards(db: Session) -> list[IncubatorCard]:
    return list(
        db.scalars(
            select(IncubatorCard).order_by(
                IncubatorCard.display_order,
                IncubatorCard.id,
            )
        )
    )


def get_incubator_card(db: Session, card_id: int) -> IncubatorCard | None:
    return db.get(IncubatorCard, card_id)


def create_incubator_card(
    db: Session,
    card_data: IncubatorCardCreate,
) -> IncubatorCard:
    card = IncubatorCard(**card_data.model_dump())

    db.add(card)
    db.commit()
    db.refresh(card)

    return card


def update_incubator_card(
    db: Session,
    card_id: int,
    card_data: IncubatorCardUpdate,
) -> IncubatorCard | None:
    card = db.get(IncubatorCard, card_id)

    if card is None:
        return None

    for field, value in card_data.model_dump(exclude_unset=True).items():
        setattr(card, field, value)

    db.commit()
    db.refresh(card)

    return card


def delete_incubator_card(db: Session, card_id: int) -> bool:
    card = db.get(IncubatorCard, card_id)

    if card is None:
        return False

    db.delete(card)
    db.commit()

    return True
