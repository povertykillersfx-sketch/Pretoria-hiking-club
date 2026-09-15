# Pretoria Hiking Club

The website for a South African hiking and outdoor community — built around
**events and bookings**, not just informational pages. Visitors discover a hike,
book a spot in about two minutes and get an instant email confirmation. The club
administrator manages events, capacity and attendees from a built-in admin area.

> Hike. Connect. Explore.

## What's inside

**For hikers**

- Homepage with hero, club stats, upcoming events, the standard hike-day
  schedule, what the club does, about, community and an immersive gallery
- Events index with category filters (hikes, camping, getaways, socials)
- Dedicated event pages with their own programme, what's included, what to
  bring, gallery and a sticky booking card (plus a mobile booking bar)
- Four-step booking flow: trail distance → details → payment → confirmation
- Confirmation page with booking reference, EFT instructions, calendar download
  (`.ics`) and WhatsApp sharing
- Automatic confirmation email to the hiker and a notification to the club
- About, gallery, contact (with FAQ) and terms / cancellation / privacy pages

**For the club administrator** (`/admin`)

- Dashboard: upcoming events, booked hikers, open spots, payments received and
  the latest bookings
- Create and edit events: date, location, meeting point, arrival and start
  times, 5KM / 10KM options, difficulty, price, capacity, cover photo, gallery
  photos, per-event schedule, what's included and what to bring
- Photo uploads straight from the event form, plus a picker for existing photos
- Publish / unpublish, close / reopen bookings, delete events
- Attendee list per event with trail split, outstanding EFT payments, mark-paid
  and cancel actions
- CSV export of attendees for an event

**Booking rules that are enforced server-side**

- Capacity is checked inside an immediate SQLite transaction, so the last spot
  can never be sold twice
- When an event fills up, "Book Your Spot" is automatically replaced with
  "Sold Out" everywhere (cards, event page, sticky bar, booking page)
- Past events, unpublished events and manually closed events refuse bookings
- Trail distances that an event does not offer are rejected

## Tech

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite via `better-sqlite3` |
| Email | Nodemailer (SMTP), with a local outbox fallback |
| Validation | Zod |

No client-side state library and no animation library: scroll reveals and the
hero animation are plain CSS driven by a small `IntersectionObserver` component.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database is created and
seeded automatically on first run at `.data/pretoria-hiking-club.db` with eight
example events (including a sold-out one) and sample bookings.

The admin area is at [http://localhost:3000/admin](http://localhost:3000/admin).
The development password is `trailboss` until you set `ADMIN_PASSWORD`.

```bash
npm run build   # production build
npm start       # run the production server
npm run lint    # eslint
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. Everything is
optional in development.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used for metadata, sitemap and emails |
| `ADMIN_PASSWORD` | Admin password. **Set this before going live.** |
| `ADMIN_SESSION_SECRET` | Secret used to sign the admin session cookie |
| `ADMIN_EMAIL` | Where new-booking notifications are sent |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | SMTP credentials for confirmation emails |
| `MAIL_FROM` | From address, e.g. `Pretoria Hiking Club <hello@…>` |
| `PHC_DATA_DIR` | Where the SQLite file and outbox live (default `.data`) |

Without SMTP credentials, emails are written to `.data/outbox/*.html` and logged
to the console so the booking flow still works end to end locally.

## Payments

The booking flow supports two methods:

- **Card** — marks the booking as paid immediately and confirms the spot. This
  is wired as a single step so a real South African gateway (Yoco, Payfast,
  Peach) can be dropped in: redirect to the gateway after `createBooking()` and
  update `payment_status` from the gateway webhook.
- **EFT** — holds the spot, emails the banking details with the booking
  reference, and shows in the admin attendee list as "Awaiting EFT" until the
  administrator marks it paid.

Free events skip the payment step entirely.

Bank details and club contact information live in `src/lib/site.ts`.

## Data model

Two tables, created and migrated on boot in `src/lib/db.ts`:

- `events` — slug, title, category, copy, location, meeting point, date, arrival
  and start times, 5KM/10KM flags, difficulty, price (cents), capacity, cover
  photo, gallery, per-event schedule, includes, bring, published and
  bookings-closed flags
- `bookings` — reference, event, trail distance, name, email, phone, number of
  people, amount (cents), payment method and status, booking status and notes

Spots remaining is always derived from confirmed bookings
(`capacity − SUM(people)`), so cancellations return spots to the pool
automatically.

## Project structure

```
src/
  app/
    (site)/            public pages: home, events, book, booking, about,
                       gallery, contact, legal
    admin/             login, dashboard, event CRUD, attendee lists
    actions/           server actions for bookings, contact and admin
    api/               CSV export, photo upload, calendar (.ics)
  components/          UI, homepage sections, booking form, admin form
  lib/                 db, events, bookings, email, auth, formatting, site config
public/images/         curated outdoor photography
```

## Branding

The club's logo artwork lives in `brand-source/logo-original.png`. It is a flat
two-colour lockup: brand green (`#00BF63`) scenery with a white overlay for the
hiker, mountain outlines and sparkles.

`brand-source/trace-logo.py` vectorises it, because the supplied file is only
500px and the mark needs to stay sharp at every size. It drops the "PRETORIA
HIKING CLUB" lettering (the site sets that as live text) and writes:

| Output | Used for |
| --- | --- |
| `public/brand/mark-on-dark.svg` | the mark over dark backgrounds |
| `public/brand/mark-on-light.svg` | the same mark with an ink overlay, for pale backgrounds |
| `src/app/icon.svg`, `favicon.ico`, `apple-icon.png` | tab and home-screen icons |
| `public/brand/icon-*.png` | Android install icons, including a maskable one |
| `public/brand/og-image.jpg` | the WhatsApp / Instagram / X share card |

`LogoMark` renders both mark variants and cross-fades between them, so the
header can flip tone on scroll without the swap ever flashing. Keeping the mark
in `/public` rather than inline saves ~16KB of gzipped HTML on every page.

To regenerate after new artwork lands:

```bash
pip install pillow numpy scipy potracer
python3 brand-source/trace-logo.py   # writes /tmp/brand.json, then re-emit assets
```

Club photography lives in `brand-source/club-photos/`. `brand-source/replace-photos.py`
crops those portraits into the landscape, portrait and square files the site
uses under `public/images/`. Existing filenames are kept so event, gallery and
page references do not have to change.

```bash
python3 brand-source/replace-photos.py
```

## SEO and performance

- Per-page metadata, Open Graph and Twitter cards
- JSON-LD: `SportsClub` on the homepage and `Event` (with offers and
  availability) on every event page
- `sitemap.xml` including all published events, `robots.txt`, web manifest
- `next/image` with AVIF/WebP, responsive `sizes` and priority hints
- Mobile-first layouts, sticky mobile booking bar and reduced-motion support
  (important: most traffic arrives from Instagram, TikTok and WhatsApp)

## Deploying

Any Node host works (a small VPS, Fly.io, Railway, Render). Two things to keep
in mind:

1. **SQLite needs a persistent disk.** Mount a volume and point `PHC_DATA_DIR`
   at it. On a read-only or ephemeral filesystem (for example a serverless
   platform) the database and uploaded photos will not survive.
2. Set `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` and the SMTP variables before
   opening bookings to the public.
