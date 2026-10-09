"""tracking sessions

Revision ID: b7c8d9e0f1a2
Revises: a1b2c3d4e5f6
"""
from alembic import op
import sqlalchemy as sa

revision = "b7c8d9e0f1a2"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "tracking_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("token", sa.String(length=64), nullable=False),
        sa.Column("last_lat", sa.Float(), nullable=True),
        sa.Column("last_lng", sa.Float(), nullable=True),
        sa.Column("last_seen_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tracking_sessions_booking_id"), "tracking_sessions", ["booking_id"], unique=False)
    op.create_index(op.f("ix_tracking_sessions_token"), "tracking_sessions", ["token"], unique=True)


def downgrade():
    op.drop_index(op.f("ix_tracking_sessions_token"), table_name="tracking_sessions")
    op.drop_index(op.f("ix_tracking_sessions_booking_id"), table_name="tracking_sessions")
    op.drop_table("tracking_sessions")
