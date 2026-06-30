"""rename partners is_popular to show_in_ticker

Revision ID: f0a1b2c3d4e5
Revises: e4f5g6h7i8j9
Create Date: 2026-06-29 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f0a1b2c3d4e5"
down_revision: Union[str, Sequence[str], None] = "e4f5g6h7i8j9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("partners", "is_popular", new_column_name="show_in_ticker", existing_type=sa.Boolean())


def downgrade() -> None:
    op.alter_column("partners", "show_in_ticker", new_column_name="is_popular", existing_type=sa.Boolean())
