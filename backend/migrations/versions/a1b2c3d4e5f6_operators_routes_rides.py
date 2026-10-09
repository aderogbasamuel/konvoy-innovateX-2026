"""operators routes rides

Revision ID: a1b2c3d4e5f6
Revises: df4a5b0ef4c1
"""
from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = "df4a5b0ef4c1"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "operators",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("contact_phone", sa.String(length=16), nullable=True),
        sa.Column("license_number", sa.String(length=64), nullable=True),
        sa.Column("license_verified", sa.Boolean(), nullable=False),
        sa.Column("vehicle_inspection_verified", sa.Boolean(), nullable=False),
        sa.Column("driver_id_verified", sa.Boolean(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False),
        sa.Column("rating_avg", sa.Float(), nullable=False),
        sa.Column("rating_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_operators_is_verified"), "operators", ["is_verified"], unique=False)

    op.create_table(
        "routes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("origin_state", sa.String(length=64), nullable=False),
        sa.Column("destination", sa.String(length=120), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("origin_state", "destination", name="uq_route_origin_destination"),
    )
    op.create_index(op.f("ix_routes_origin_state"), "routes", ["origin_state"], unique=False)
    op.create_index(op.f("ix_routes_destination"), "routes", ["destination"], unique=False)

    op.create_table(
        "rides",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("operator_id", sa.Integer(), nullable=False),
        sa.Column("route_id", sa.Integer(), nullable=False),
        sa.Column("departs_at", sa.DateTime(), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("vehicle_type", sa.String(length=40), nullable=False),
        sa.Column("seats_total", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["operator_id"], ["operators.id"]),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_rides_operator_id"), "rides", ["operator_id"], unique=False)
    op.create_index(op.f("ix_rides_route_id"), "rides", ["route_id"], unique=False)
    op.create_index(op.f("ix_rides_departs_at"), "rides", ["departs_at"], unique=False)


def downgrade():
    op.drop_index(op.f("ix_rides_departs_at"), table_name="rides")
    op.drop_index(op.f("ix_rides_route_id"), table_name="rides")
    op.drop_index(op.f("ix_rides_operator_id"), table_name="rides")
    op.drop_table("rides")
    op.drop_index(op.f("ix_routes_destination"), table_name="routes")
    op.drop_index(op.f("ix_routes_origin_state"), table_name="routes")
    op.drop_table("routes")
    op.drop_index(op.f("ix_operators_is_verified"), table_name="operators")
    op.drop_table("operators")
