import click
from flask import Flask

from .extensions import db
from .models.user import ROLE_ADMIN, User
from .utils.phone import normalize_ng_phone


def register_cli(app: Flask) -> None:
    @app.cli.command("create-admin")
    @click.argument("phone")
    @click.option("--name", default=None, help="Display name")
    def create_admin(phone, name):
        """Create (or promote) an admin. Admins sign in with OTP like everyone else."""
        normalized = normalize_ng_phone(phone)
        user = User.query.filter_by(phone=normalized).first()
        if user is None:
            user = User(phone=normalized)
            db.session.add(user)
        user.role = ROLE_ADMIN
        if name:
            user.full_name = name
        db.session.commit()
        click.echo(f"{normalized} is now an admin.")
