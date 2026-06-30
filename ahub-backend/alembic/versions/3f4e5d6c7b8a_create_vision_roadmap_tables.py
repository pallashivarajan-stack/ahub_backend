"""create vision, roadmap, milestone tables

Revision ID: 3f4e5d6c7b8a
Revises: 9d8e7f6a5b4c
Create Date: 2026-06-27 14:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "3f4e5d6c7b8a"
down_revision: Union[str, None] = "9d8e7f6a5b4c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "vision_mission",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("section_type", sa.String(20), nullable=False),
        sa.Column("heading", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "roadmaps",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "milestones",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("year_label", sa.String(50), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("tagline", sa.String(255), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("vision_mission")
    op.drop_table("roadmaps")
    op.drop_table("milestones")
