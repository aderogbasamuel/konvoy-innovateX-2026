import re

import pytest

from app import create_app
from app.config import TestConfig
from app.extensions import db
from app.services.sms import ConsoleSMSProvider


@pytest.fixture()
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        ConsoleSMSProvider.outbox.clear()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def last_code():
    def _last_code() -> str:
        return re.search(r"\b(\d{6})\b", ConsoleSMSProvider.outbox[-1][1]).group(1)

    return _last_code


@pytest.fixture()
def login(client, last_code):
    def _login(phone="08012345678"):
        client.post("/api/auth/otp/request", json={"phone": phone})
        return client.post("/api/auth/otp/verify", json={"phone": phone, "code": last_code()})

    return _login
