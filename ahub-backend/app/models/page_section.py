from datetime import datetime

from sqlalchemy import DateTime, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class PageSection(Base):
    __tablename__ = "page_sections"
    __table_args__ = (
        UniqueConstraint("page", "section_key", name="uq_page_sections_page_section_key"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    page: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    section_key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
