"""
Thin client around the Bachs API (https://docs.bachs.io).

Only what Konvoy's pilot needs: start a checkout for one booking, verify
inbound webhooks, and issue a refund. Not a full SDK — if the team later
wants subscriptions/products/etc., reach for the official `bachs-sdk-python`
package instead of growing this file.
"""
import hashlib
import hmac
import time

import requests

from ..errors import ApiError

SANDBOX_BASE_URL = "https://sandbox-api.bachs.io"
LIVE_BASE_URL = "https://api.bachs.io"

# See guides/checkout/checkout-sessions.md -> "Restrict payment methods".
# Konvoy only ever wants NGN, so these are the only two corridors offered.
CORRIDORS_BY_METHOD = {
    "card": ["NGN_CARD"],
    "transfer": ["NGN_BANK_TRANSFER"],
}


class BachsError(Exception):
    def __init__(self, message: str, status_code: int | None = None, error_code: str | None = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code


def _base_url(secret_key: str) -> str:
    # "The environment is inferred from the API key prefix" (bachs-sdk-python README)
    if secret_key.startswith("sk_live_"):
        return LIVE_BASE_URL
    return SANDBOX_BASE_URL


class BachsClient:
    def __init__(self, secret_key: str, timeout: float = 15.0):
        if not secret_key:
            raise ValueError("Bachs secret key is not configured")
        self.secret_key = secret_key
        self.base_url = _base_url(secret_key)
        self.timeout = timeout

    def _headers(self, idempotency_key: str | None = None) -> dict:
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key
        return headers

    def create_checkout_session(
        self,
        *,
        amount_naira: int,
        reference: str,
        method: str,
        customer_email: str | None = None,
        customer_name: str | None = None,
        customer_phone: str | None = None,
        success_url: str,
        cancel_url: str,
        idempotency_key: str | None = None,
    ) -> dict:
        """
        Raw-amount checkout (guides/checkout/checkout-sessions.md -> "Charge a
        raw amount") since Konvoy prices rides dynamically and has no Bachs
        product catalog. Amount is NGN, a decimal string per Bachs convention
        ("29.00"), converted here from the integer-naira amount Konvoy stores
        internally (API.pdf money convention).
        """
        if method not in CORRIDORS_BY_METHOD:
            raise ValueError(f"Unsupported payment method for Bachs: {method}")

        payload = {
            "pricing": {"currency": "NGN", "amount": f"{amount_naira}.00"},
            "reference": reference,
            "success_url": success_url,
            "cancel_url": cancel_url,
            "payment_method_types": CORRIDORS_BY_METHOD[method],
        }
        customer = {}
        if customer_email:
            customer["email"] = customer_email
        if customer_name:
            customer["name"] = customer_name
        if customer_phone:
            customer["phone_number"] = customer_phone
        if customer:
            payload["customer"] = customer

        resp = requests.post(
            f"{self.base_url}/v1/checkout-sessions",
            json=payload,
            headers=self._headers(idempotency_key),
            timeout=self.timeout,
        )
        return _parse_or_raise(resp)

    def create_refund(self, *, charge_id: str, reference: str, amount_naira: int | None = None) -> dict:
        """Full refund when amount_naira is None, partial otherwise. See guides/refunds.md."""
        payload = {"charge_id": charge_id, "reference": reference}
        if amount_naira is not None:
            payload["amount"] = f"{amount_naira}.00"

        resp = requests.post(
            f"{self.base_url}/v1/refunds",
            json=payload,
            headers=self._headers(),
            timeout=self.timeout,
        )
        return _parse_or_raise(resp)


def _parse_or_raise(resp: requests.Response) -> dict:
    try:
        body = resp.json()
    except ValueError:
        body = {}
    if resp.status_code >= 400:
        # Bachs error bodies carry error_code + detail/message (see bachs-sdk-python
        # BachsError). Read leniently, top-level or nested under "error".
        src = body if isinstance(body, dict) else {}
        nested = src.get("error") if isinstance(src.get("error"), dict) else {}
        code = src.get("error_code") or nested.get("error_code") or nested.get("code")
        detail = src.get("detail") or src.get("message") or nested.get("message") or nested.get("detail")
        parts = [f"Bachs {resp.status_code}"]
        if code:
            parts.append(str(code))
        if detail:
            parts.append(str(detail))
        raise BachsError(": ".join(parts), status_code=resp.status_code, error_code=code)
    return body


def verify_webhook_signature(
    *,
    raw_body: bytes,
    secret: str,
    timestamp_header: str | None,
    signature_header: str | None,
    tolerance_seconds: int = 300,
) -> bool:
    """
    Verifies X-Bachs-Signature (the simple, non-"-V2" header): HMAC-SHA256 of
    "{timestamp}.{raw_body}". See guides/webhooks/overview.md. Using the plain
    header (not -V2) is fine for a single, never-rotated secret; switch to
    verifying -V2 if the team starts rotating BACHS_WEBHOOK_SECRET.
    """
    if not timestamp_header or not signature_header:
        return False
    try:
        timestamp = int(timestamp_header)
    except ValueError:
        return False

    if abs(time.time() - timestamp) > tolerance_seconds:
        return False  # too old — reject to guard against replay

    message = f"{timestamp}.".encode() + raw_body
    expected = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)


def raise_as_api_error(exc: BachsError) -> None:
    """Translate a BachsError into Konvoy's standard { error: { code, message } } shape."""
    raise ApiError(exc.message, 502, "payment_provider_error") from exc