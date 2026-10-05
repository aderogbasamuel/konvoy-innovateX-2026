import logging

import requests
from flask import current_app

log = logging.getLogger(__name__)


class SMSError(Exception):
    pass


class ConsoleSMSProvider:
    """Dev/test provider: logs the message and keeps it in `outbox`."""

    outbox: list[tuple[str, str]] = []

    def send(self, phone: str, message: str) -> None:
        ConsoleSMSProvider.outbox.append((phone, message))
        log.warning("SMS to %s: %s", phone, message)


class TermiiSMSProvider:
    """Written against Termii's /api/sms/send endpoint. Check it against their
    current docs, and note that Nigerian routes need a registered sender ID."""

    URL = "https://api.ng.termii.com/api/sms/send"

    def send(self, phone: str, message: str) -> None:
        cfg = current_app.config
        payload = {
            "api_key": cfg["TERMII_API_KEY"],
            "to": phone.lstrip("+"),
            "from": cfg["TERMII_SENDER_ID"],
            "sms": message,
            "type": "plain",
            "channel": cfg["TERMII_CHANNEL"],
        }
        try:
            resp = requests.post(self.URL, json=payload, timeout=10)
            resp.raise_for_status()
        except requests.RequestException as exc:
            raise SMSError(str(exc)) from exc


def get_sms_provider():
    name = current_app.config["SMS_PROVIDER"]
    if name == "termii":
        return TermiiSMSProvider()
    return ConsoleSMSProvider()
