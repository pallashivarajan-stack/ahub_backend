"""add category, industry, founded_year, funding_stage, featured, popularity to startups

Revision ID: 5a6b7c8d9e0f
Revises: 3f4e5d6c7b8a
Create Date: 2026-06-27 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5a6b7c8d9e0f"
down_revision: Union[str, None] = "3f4e5d6c7b8a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("startups", sa.Column("category", sa.String(100), nullable=True))
    op.add_column("startups", sa.Column("industry", sa.String(100), nullable=True))
    op.add_column("startups", sa.Column("founded_year", sa.Integer(), nullable=True))
    op.add_column("startups", sa.Column("funding_stage", sa.String(100), nullable=True))
    op.add_column("startups", sa.Column("featured", sa.Boolean(), server_default="0", nullable=False))
    op.add_column("startups", sa.Column("popularity", sa.Integer(), server_default="0", nullable=True))


def downgrade() -> None:
    op.drop_column("startups", "popularity")
    op.drop_column("startups", "featured")
    op.drop_column("startups", "funding_stage")
    op.drop_column("startups", "founded_year")
    op.drop_column("startups", "industry")
    op.drop_column("startups", "category")
