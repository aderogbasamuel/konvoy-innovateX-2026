import phonenumbers

from ..errors import ApiError


def normalize_ng_phone(raw: str) -> str:
    """Return the number in E.164 (+2348012345678) or raise a 400.

    Only Nigerian numbers are accepted: the users are NYSC corpers, and
    restricting the country also limits SMS-pumping abuse.
    """
    if not isinstance(raw, str) or not raw.strip():
        raise ApiError("Phone number is required", 400, "invalid_phone")
    try:
        parsed = phonenumbers.parse(raw.strip(), "NG")
    except phonenumbers.NumberParseException:
        raise ApiError("Enter a valid Nigerian phone number", 400, "invalid_phone")
    if parsed.country_code != 234 or not phonenumbers.is_valid_number(parsed):
        raise ApiError("Enter a valid Nigerian phone number", 400, "invalid_phone")
    return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
