# Konvoy API: endpoints for the backend

Flask REST API consumed by the Next.js frontend. This list comes from the screens already built, plus the PRD. Anything marked **P0** is needed for the pilot (booking and tracking on 1 to 2 routes). **P1** comes next, **P2** later.

## Conventions

- Base path `/api/v1`, JSON only, UTF-8, ISO 8601 UTC timestamps (`2026-10-27T09:30:00Z`). The frontend formats them for Lagos time.
- Phone numbers stored and returned in E.164 (`+2348012345678`). The frontend sends whatever the user typed after stripping non-digits, so the API should normalise `0801...`, `801...` and `+234801...`.
- Prices are **integers in naira** (the frontend shows `18000` as ₦18,000). Convert to kobo only when calling the payment gateway.
- Auth: `Authorization: Bearer <access_token>`. Endpoints marked **Public** need no token.
- Errors: `{ "error": { "code": "seat_taken", "message": "That seat was just booked.", "fields": { "seat": "..." } } }` with the right HTTP status. `code` is stable, `message` is plain English for display.
- Lists are paginated with `?limit=20&cursor=...` and return `{ "items": [...], "nextCursor": "..." | null }`.
- Money-moving POSTs (`/bookings`) accept an `Idempotency-Key` header.
- Keep payloads small (gzip, no unused fields). Users are on low-end phones and weak networks.
- Publish an OpenAPI spec (flask-smorest or apispec) so the frontend can generate TypeScript types from it.
- CORS: allow the Next.js origin only.

## 1. Auth (P0)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/otp/request` | Public | Body `{ phone }`. Text a 6-digit code. Returns `{ resendAfterSeconds: 30 }`. Rate limit per phone and per IP. |
| POST | `/auth/otp/verify` | Public | Body `{ phone, code }`. Returns `{ accessToken, refreshToken, user, isNewUser }`. Sign up and sign in are the same call, `isNewUser` tells the app which it was. Code expires in about 5 minutes, max 5 attempts. |
| POST | `/auth/refresh` | Public | Body `{ refreshToken }`. New access token. |
| POST | `/auth/logout` | User | Revoke the refresh token. |

Screens: `/signup`, `/signin`. Needs an SMS provider (for example Termii or Africa's Talking).

## 2. Me (P0)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/me` | User | Current user: `id, phone, firstName, lastName`. Home greets by `firstName`. |
| PATCH | `/me` | User | Update `firstName, lastName`. |
| POST | `/me/push-tokens` | User | Register a web push token (P2). |

## 3. Places and ride search (P0)

"Ride" here means one scheduled departure by one transport company. The ride `id` goes straight into the URL `/book/:id`.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/places?q=` | Public | Suggestions for the search boxes: states, camps, major cities. Free text must still work. |
| GET | `/rides?from=&to=&date=&sort=` | User | Search departures. `sort` is `price`, `rating` or omitted. Only verified operators, only rides with seats left. |
| GET | `/rides/{id}` | User | One ride with full verification detail (licence, vehicle inspection, driver ID: status and expiry) and recent reviews. Company detail screen. |
| GET | `/rides/{id}/seats` | User | `{ capacity, taken: [3, 7, ...] }`. Seats are numbered from 1, laid out 2 + aisle + 2 per row. |

`GET /rides` item (matches the frontend `Ride` type):

```json
{
  "id": "greenline-2026-10-27-0700",
  "operator": { "id": "op_12", "name": "Greenline Travels", "rating": 4.8, "reviewCount": 1300, "verified": true },
  "vehicle": "Luxury Bus (AC)",
  "seatsLeft": 42,
  "price": 18000,
  "departsAt": "2026-10-27T06:00:00Z",
  "squad": { "count": 12, "preview": ["AO", "CE", "FB"] }
}
```

The response also needs a top-level `route: { from, to, distanceKm }`.

## 4. Seats, bookings and payments (P0)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/rides/{id}/seat-holds` | User | Body `{ seat }`. Hold a seat for about 10 minutes so two people cannot pay for it. 409 `seat_taken` if gone. |
| POST | `/bookings` | User | Body `{ rideId, seat, paymentMethod: "card" \| "transfer" \| "ussd" }`. Creates a `pending_payment` booking and starts the payment. Returns `{ bookingId, status, payment }` where `payment` carries what the screen needs: card gives `authorizationUrl` or `accessCode`, transfer gives bank details plus `expiresAt`, USSD gives the code to dial. |
| GET | `/bookings/{id}` | User | Booking and payment status. The app polls this after payment: `pending_payment`, `paid`, `failed`, `expired`, `cancelled`. |
| GET | `/bookings?status=upcoming\|past` | User | My Trips. |
| POST | `/bookings/{id}/cancel` | User | Cancel and refund per the refund policy. |
| POST | `/webhooks/paystack` | Public, signature checked | Verify `x-paystack-signature`, mark the payment paid, confirm the booking, release or keep the seat. Must be idempotent. (Use the Flutterwave equivalent if that is the gateway.) |

Must support card, bank transfer and USSD.

## 5. Live tracking (P0)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/bookings/{id}/tracking` | User | `{ token, url }` for the share link. Create the token when the booking is paid. Token must be unguessable (128 bits or more). |
| DELETE | `/tracking/{token}` | User | Stop sharing. The link then returns 410. |
| POST | `/bookings/{id}/trip/start` | User | Start the trip, begin sharing. |
| POST | `/bookings/{id}/location` | User | Body `{ points: [{ lat, lng, accuracy, recordedAt }] }`. Accepts a batch so a phone can upload what it buffered offline. |
| POST | `/bookings/{id}/trip/end` | User | End the trip. Also end automatically when the position reaches the destination. |
| GET | `/track/{token}` | **Public** | What the family page reads, polled every 15 seconds. |

`GET /track/{token}` response. Share only what family needs, never the phone number, seat or payment info:

```json
{
  "corperFirstName": "Samuel",
  "route": { "from": "Lagos", "to": "Kaduna" },
  "operator": "Greenline Travels",
  "vehicle": "Luxury Bus (AC)",
  "status": "in_transit",
  "progress": 0.64,
  "position": { "lat": 8.49, "lng": 4.54 },
  "updatedAt": "2026-10-27T14:02:11Z",
  "etaAt": "2026-10-27T15:40:00Z"
}
```

`status` is `scheduled`, `in_transit`, `arrived` or `ended`. `updatedAt` is the last GPS fix, not the time of the request. The frontend shows "last known location" when it is older than 2 minutes. `progress` is 0 to 1 along the route. Add short caching (a few seconds) and rate limiting, since this endpoint is public. Links expire a few hours after arrival.

## 6. Squads (built)

A squad is everyone with a paid booking on the same route and day, across operators. Squads are WhatsApp-based, so there is no in-app group chat in the MVP.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/rides/{id}/squad` | User | `{ rideId, count, others, joined, whatsappGroupUrl }`. `joined` is true when the caller has a paid booking. `whatsappGroupUrl` is only returned when `joined`. |
| PATCH | `/admin/rides/{id}/whatsapp-group` | Admin | Body `{ url }` (must start with `https://chat.whatsapp.com/`, or `null` to clear). |

## 7. State Buddies (built)

Contact happens on WhatsApp through a `wa.me` link with a prefilled message, so there is no in-app buddy chat in the MVP. Buddies must consent to sharing their number, and every new or changed listing goes back to `pending` for admin review.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/buddies?state=` | User | Approved buddies: `{ items: [{ id, name, state, bio, whatsappUrl }] }`. Rate limited to 60 per hour. |
| GET | `/buddies/me` | User | `{ buddy: null }` or `{ buddy: { ...item, status: "approved" \| "pending" } }`. |
| POST | `/buddies/me` | User | Body `{ state, whatsapp, bio?, consent: true }`. Returns `201 { status: "pending" }`. Limited to 10 per hour. |
| DELETE | `/buddies/me` | User | Remove my listing. |
| GET | `/admin/buddies?status=pending\|approved` | Admin | Moderation queue. |
| PATCH | `/admin/buddies/{id}` | Admin | Body `{ approved: true \| false }`. |

## 8. Reviews and issues (P1)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/bookings/{id}/review` | User | Body `{ rating: 1-5, comment? }`. Only after the trip ended. Updates the operator rating. |
| GET | `/operators/{id}/reviews` | User | Paginated reviews. |
| POST | `/bookings/{id}/issues` | User | Body `{ type: "late" \| "no_show" \| "other", details }`. Starts a dispute for the admin team. |

## 9. Notifications (P2)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/notifications` | User | The bell icon on home. |
| POST | `/notifications/{id}/read` | User | Mark read. |

Also a scheduled job to text or push a reminder the day before travel.

## 10. Admin (P0 for onboarding, P1 for moderation)

Separate admin accounts and roles. Not used by the public app.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/admin/operators` | Onboard a transport company. |
| PATCH | `/admin/operators/{id}/verification` | Set licence, vehicle inspection and driver ID status, with expiry dates. Operators must be verified by hand before they are listed. |
| POST | `/admin/operators/{id}/documents` | Upload documents (signed upload URL to file storage). |
| POST / PATCH | `/admin/routes` and `/admin/rides` | Create routes and departures, set price, vehicle and capacity. The pilot needs this since operators have no portal yet. |
| GET | `/admin/bookings` | Search bookings, see payment status. |
| GET | `/admin/buddies?status=pending` | Moderation queue. |
| POST | `/admin/buddies/{id}/approve` or `/reject` | Moderate. |
| GET | `/admin/reports` | Reported messages and open issues. |

## Suggested tables

`users`, `operators`, `vehicles`, `drivers`, `verification_records`, `routes`, `rides`, `seat_holds`, `bookings`, `payments`, `tracking_links`, `location_pings`, `squads`, `squad_members`, `messages`, `buddies`, `conversations`, `reviews`, `issues`, `admins`.

## Testing OTPs without SMS (dev and staging only)

Sending real SMS costs money and slows testing. Add one function the OTP endpoint calls, and switch behaviour with environment variables. Production must always use real SMS.

| Variable | Values | Meaning |
| --- | --- | --- |
| `APP_ENV` | `development`, `staging`, `production` | Where the API is running. |
| `OTP_DELIVERY` | `sms`, `console`, `webhook` | How codes are delivered. `sms` is the only allowed value in production. |
| `OTP_WEBHOOK_URL` | URL | A Discord or Slack incoming webhook for a private team channel. |
| `OTP_WEBHOOK_STYLE` | `discord`, `slack` | Payload format for the webhook. |
| `OTP_TEST_NUMBERS` | comma-separated E.164 numbers | Optional. These numbers always get the code `123456` outside production, handy for automated tests. |

```python
# otp_delivery.py
import logging
import os
import secrets

import requests

log = logging.getLogger("otp")


def mask(phone: str) -> str:
    return f"{phone[:7]}****{phone[-2:]}"          # +234801****78


def make_code(phone: str) -> str:
    test_numbers = {n for n in os.getenv("OTP_TEST_NUMBERS", "").split(",") if n}
    if phone in test_numbers and os.getenv("APP_ENV") != "production":
        return "123456"
    return f"{secrets.randbelow(10**6):06d}"


def deliver_otp(phone: str, code: str) -> None:
    env = os.getenv("APP_ENV", "production")
    mode = os.getenv("OTP_DELIVERY", "sms")

    # Safety net: refuse to start leaking codes in production
    if env == "production" and mode != "sms":
        raise RuntimeError("OTP_DELIVERY must be 'sms' in production")

    if mode == "sms":
        send_sms(phone, f"Your Konvoy code is {code}. It expires in 5 minutes.")  # your SMS provider
    elif mode == "console":
        log.warning("OTP for %s: %s", phone, code)
    elif mode == "webhook":
        text = f"OTP for {mask(phone)}: {code} (expires in 5 min)"
        style = os.getenv("OTP_WEBHOOK_STYLE", "discord")
        payload = {"content": text} if style == "discord" else {"text": text}
        try:
            requests.post(os.environ["OTP_WEBHOOK_URL"], json=payload, timeout=5)
        except requests.RequestException:
            log.exception("Could not post OTP to the webhook")  # never fail signup because of this
```

Notes:

- Store only a hash of the code in the database, as you would in production. The webhook is the one place the plain code appears.
- Use a private channel and rotate the webhook URL if it leaks. Anyone in that channel can sign in as any test number.
- The phone number is masked in the message so the channel does not become a list of real users' numbers. Use test numbers for team testing.
- Delete the webhook URL from the staging environment before any public beta.