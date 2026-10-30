# Konvoy

Safe, trusted rides for NYSC corps members travelling to camp and to their posting states.

Konvoy lets corpers find verified transport operators, book a seat, pay, and share a live tracking link with family. It also connects them with other corpers heading the same way.

## Features

- **Find rides**: search by origin, destination and date, with filters for lowest price and top rated
- **Verified operators**: license, vehicle inspection and driver ID checks, plus ratings and reviews
- **Seat booking**: pick a seat, choose card or transfer, get instant confirmation
- **My trips**: upcoming and past bookings, with trip details
- **Live trip sharing**: share your location during a trip; family follows on a link, no login needed
- **Squad and State Buddies**: meet other corpers on the same route or posted to the same state
- **Phone sign-in**: phone number and OTP
- **PWA**: installable, with an offline page

## Tech stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS
- lucide-react icons
- Backend: Flask REST API (separate service)

## Getting started

```bash
# install
npm install

# add environment variables
cp .env.example .env.local

# run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Konvoy API, e.g. `https://your-api.example.com/api` |

If it is not set, the app falls back to the hosted API.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the code |

## Routes

| Route | Screen |
| --- | --- |
| `/` | Landing page |
| `/onboarding` | Welcome screen |
| `/signup`, `/signin` | Phone and OTP auth |
| `/home` | Trip search |
| `/rides`, `/rides/[id]` | Available rides, operator details |
| `/book/[id]` | Seat and payment selection |
| `/book/[id]/confirmed` | Booking confirmation |
| `/trips`, `/trips/[id]` | My trips, trip detail and live sharing |
| `/track/[token]` | Public family tracking view |
| `/squad`, `/buddies` | Travel squad, State Buddies |
| `/notifications`, `/profile` | Notifications, profile |

## Project structure

```
app/            Routes and pages
components/     Shared UI and landing sections
lib/            API clients (rides, booking), formatters, helpers
public/         Icons, manifest, artwork
docs/API.md     Endpoint reference for the backend
```

## API

Endpoints are listed in [`docs/API.md`](docs/API.md). Rides are public. Bookings require a bearer token, stored in `localStorage` under `konvoy_access_token` after sign-in.

## Status

Core flow works end to end: search, book, pay, confirmation, trips. Still in progress:

- Real tracking token from `GET /bookings/{id}/tracking`
- Location upload and trip start/end endpoints
- Replacing remaining mock data on the squad and buddies screens

## License

All rights reserved.
