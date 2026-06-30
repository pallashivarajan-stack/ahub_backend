"""create page sections table

Revision ID: 8b7c2f4a1d3e
Revises: c41e5dd8e8e1
Create Date: 2026-06-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8b7c2f4a1d3e"
down_revision: Union[str, Sequence[str], None] = "c41e5dd8e8e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "page_sections",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("page", sa.String(length=100), nullable=False),
        sa.Column("section_key", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "page",
            "section_key",
            name="uq_page_sections_page_section_key",
        ),
    )
    op.create_index(op.f("ix_page_sections_page"), "page_sections", ["page"], unique=False)
    op.create_index(
        op.f("ix_page_sections_section_key"),
        "page_sections",
        ["section_key"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_page_sections_section_key"), table_name="page_sections")
    op.drop_index(op.f("ix_page_sections_page"), table_name="page_sections")
    op.drop_table("page_sections")
