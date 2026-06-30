from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.page_section import PageSection
from app.schemas.page_section import PageSectionCreate, PageSectionUpdate


def get_home_sections(db: Session) -> list[PageSection]:
    return list(
        db.scalars(
            select(PageSection)
            .where(PageSection.page == "home")
            .order_by(PageSection.id)
        )
    )


def create_section(db: Session, section_data: PageSectionCreate) -> PageSection:
    section = PageSection(**section_data.model_dump())

    try:
        db.add(section)
        db.commit()
        db.refresh(section)
    except IntegrityError:
        db.rollback()
        raise

    return section


def update_section(
    db: Session,
    section_id: int,
    section_data: PageSectionUpdate,
) -> PageSection | None:
    section = db.get(PageSection, section_id)

    if section is None:
        return None

    for field, value in section_data.model_dump(exclude_unset=True).items():
        setattr(section, field, value)

    try:
        db.commit()
        db.refresh(section)
    except IntegrityError:
        db.rollback()
        raise

    return section
