"""community: buddies and squad group links

Revision ID: d4e5f6a7b8c9
Revises: b7c8d9e0f1a2
"""
from alembic import op
import sqlalchemy as sa

revision = "d4e5f6a7b8c9"
down_revision = "b7c8d9e0f1a2"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "buddies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("state", sa.String(length=64), nullable=False),
        sa.Column("whatsapp", sa.String(length=16), nullable=False),
        sa.Column("bio", sa.String(length=280), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_buddies_user_id"), "buddies", ["user_id"], unique=True)
    op.create_index(op.f("ix_buddies_state"), "buddies", ["state"], unique=False)
    op.create_index(op.f("ix_buddies_is_approved"), "buddies", ["is_approved"], unique=False)
    with op.batch_alter_table("rides") as batch_op:
        batch_op.add_column(sa.Column("whatsapp_group_url", sa.String(length=255), nullable=True))


def downgrade():
    with op.batch_alter_table("rides") as batch_op:
        batch_op.drop_column("whatsapp_group_url")
    op.drop_index(op.f("ix_buddies_is_approved"), table_name="buddies")
    op.drop_index(op.f("ix_buddies_state"), table_name="buddies")
    op.drop_index(op.f("ix_buddies_user_id"), table_name="buddies")
    op.drop_table("buddies")
