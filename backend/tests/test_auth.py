from datetime import timedelta

from app.extensions import db
from app.models.otp import OTPCode
from app.services.sms import ConsoleSMSProvider
from app.utils.time import utcnow


def test_request_otp_normalizes_phone_and_sends_sms(client):
    r = client.post("/api/auth/otp/request", json={"phone": "08012345678"})
    assert r.status_code == 200
    assert ConsoleSMSProvider.outbox[-1][0] == "+2348012345678"


def test_rejects_invalid_and_foreign_numbers(client):
    for bad in ["", "123", "+14155552671", None]:
        r = client.post("/api/auth/otp/request", json={"phone": bad})
        assert r.status_code == 400
        assert r.get_json()["error"]["code"] == "invalid_phone"


def test_verify_creates_user_then_logs_in_again(login):
    first = login().get_json()
    assert first["is_new_user"] is True
    assert first["user"]["phone"] == "+2348012345678"
    assert first["user"]["role"] == "corper"

    second = login("+2348012345678").get_json()
    assert second["is_new_user"] is False
    assert second["user"]["id"] == first["user"]["id"]


def test_wrong_code_then_lockout(client, last_code):
    client.post("/api/auth/otp/request", json={"phone": "08012345678"})
    good = last_code()
    wrong = "000000" if good != "000000" else "111111"
    for _ in range(5):
        r = client.post("/api/auth/otp/verify", json={"phone": "08012345678", "code": wrong})
        assert r.status_code == 400
    # Even the right code fails once locked
    r = client.post("/api/auth/otp/verify", json={"phone": "08012345678", "code": good})
    assert r.status_code == 429


def test_code_is_single_use(client, last_code):
    client.post("/api/auth/otp/request", json={"phone": "08012345678"})
    code = last_code()
    body = {"phone": "08012345678", "code": code}
    assert client.post("/api/auth/otp/verify", json=body).status_code == 200
    assert client.post("/api/auth/otp/verify", json=body).status_code == 400


def test_expired_code_rejected(client, last_code):
    client.post("/api/auth/otp/request", json={"phone": "08012345678"})
    otp = OTPCode.query.one()
    otp.expires_at = utcnow() - timedelta(seconds=1)
    db.session.commit()
    r = client.post("/api/auth/otp/verify", json={"phone": "08012345678", "code": last_code()})
    assert r.status_code == 400


def test_new_request_invalidates_old_code(client, last_code):
    client.post("/api/auth/otp/request", json={"phone": "08012345678"})
    old = last_code()
    client.post("/api/auth/otp/request", json={"phone": "08012345678"})
    new = last_code()
    if old != new:
        r = client.post("/api/auth/otp/verify", json={"phone": "08012345678", "code": old})
        assert r.status_code == 400
    r = client.post("/api/auth/otp/verify", json={"phone": "08012345678", "code": new})
    assert r.status_code == 200


def test_resend_cooldown(app, client):
    app.config["OTP_RESEND_COOLDOWN_SECONDS"] = 60
    assert client.post("/api/auth/otp/request", json={"phone": "08012345678"}).status_code == 200
    r = client.post("/api/auth/otp/request", json={"phone": "08012345678"})
    assert r.status_code == 429
    assert r.get_json()["error"]["code"] == "otp_cooldown"


def test_hourly_cap_per_phone(app, client):
    app.config["OTP_MAX_PER_HOUR"] = 2
    for _ in range(2):
        assert client.post("/api/auth/otp/request", json={"phone": "08012345678"}).status_code == 200
    assert client.post("/api/auth/otp/request", json={"phone": "08012345678"}).status_code == 429


def test_me_requires_token(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401
    assert r.get_json()["error"]["code"] == "token_missing"


def test_me_and_profile_update(client, login):
    token = login().get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/auth/me", headers=headers).get_json()["user"]["full_name"] is None
    r = client.patch("/api/auth/me", headers=headers, json={"full_name": "Ada Obi"})
    assert r.get_json()["user"]["full_name"] == "Ada Obi"
    assert client.patch("/api/auth/me", headers=headers, json={"full_name": "A"}).status_code == 400


def test_refresh_flow(client, login):
    data = login().get_json()
    r = client.post("/api/auth/refresh", headers={"Authorization": f"Bearer {data['refresh_token']}"})
    assert r.status_code == 200 and "access_token" in r.get_json()
    # an access token must not be usable as a refresh token
    r = client.post("/api/auth/refresh", headers={"Authorization": f"Bearer {data['access_token']}"})
    assert r.status_code == 401
