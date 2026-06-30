"""create_impact_metrics_table

Revision ID: c2cd60d0eb3d
Revises: d6e7f8a9b0c1
Create Date: 2026-06-29 16:53:53.486834

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c2cd60d0eb3d'
down_revision: Union[str, Sequence[str], None] = 'd6e7f8a9b0c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('impact_metrics',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('metric_id', sa.String(length=100), nullable=False),
    sa.Column('value', sa.String(length=50), nullable=False),
    sa.Column('label', sa.String(length=255), nullable=False),
    sa.Column('sub_label', sa.String(length=255), nullable=True),
    sa.Column('display_order', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_impact_metrics_display_order'), 'impact_metrics', ['display_order'], unique=False)
    op.create_index(op.f('ix_impact_metrics_metric_id'), 'impact_metrics', ['metric_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_impact_metrics_metric_id'), table_name='impact_metrics')
    op.drop_index(op.f('ix_impact_metrics_display_order'), table_name='impact_metrics')
    op.drop_table('impact_metrics')
