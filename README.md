# Attendance Tracker

An internal attendance system for managing events, issuing token-based check-in links, and tracking engagement from a private admin dashboard.

## What It Does

- Admin login backed by a signed session cookie.
- Event management for creating, editing, deleting, and regenerating attendance tokens.
- Public attendance check-in pages at `/attend/[token]`.
- Community leaderboard grouped by attendee email and ordered by total event reward points.
- Attendance records are unique per event and email.

## Tech Stack

- Next.js 16 App Router
- React 19
- Prisma 7 with PostgreSQL
- Tailwind CSS 4
- Zod for form validation
- bcryptjs for admin password hashing

## Routes

- `/` redirects to `/login`
- `/login` admin sign-in page
- `/admin` event dashboard
- `/admin/events/new` create a new event
- `/admin/events/[eventId]` event details and attendance token view
- `/admin/events/[eventId]/edit` edit an event
- `/admin/community` community leaderboard
- `/attend/[token]` public attendance form for an event token

## Environment Variables

Create a `.env` file with at least:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/attendance_tracker"
```

Optional variables:

```bash
ADMIN_SESSION_SECRET="some-long-random-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="adminpassword123"
```

If `ADMIN_SESSION_SECRET` is not set, the app falls back to a development-only default session secret.

## Setup

1. Install dependencies.

```bash
npm install
```

2. Run the database migrations.

```bash
npx prisma migrate dev
```

3. Seed the default admin user.

```bash
npx prisma db seed
```

4. Start the development server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in at `/login`.

## Default Admin User

The seed script creates one admin user if it does not already exist.

- Email: `admin@example.com`
- Password: `adminpassword123`

You can override both values with `ADMIN_EMAIL` and `ADMIN_PASSWORD` before running the seed.

## Core Behavior

- Events have a generated 16-character attendance token.
- Check-in is allowed only while the event is between `startsAt` and `endsAt`.
- Each attendance submission stores name, email, and an optional reason.
- A single email can only check in once per event.
- Leaderboard points come from each event's `rewardPoints` value.

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- The app uses `Poppins` for the UI typography.
- Authentication is handled with a signed, HTTP-only cookie named `admin_session`.
- Prisma is configured for PostgreSQL in `prisma/schema.prisma` and `lib/prisma.ts`.
