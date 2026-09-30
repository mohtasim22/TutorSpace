# TutorSpace 🎓

**"Connect with Expert Tutors, Learn Anything"** — a full-stack online tutoring platform where students discover verified tutors, book time-slotted sessions (one-on-one or group), pay securely, attend the lesson over video with a shared whiteboard, and carry on with assignments and course materials afterwards.

Most products in this space are either a **marketplace** (discovery, booking, payment, a video link — and nothing after the call) or a **learning management system** (coursework, but no tutors to hire and no payments). TutorSpace does both, organised around a single session: one `CourseSlot` carries its own video room, whiteboard, booking, payment and saved materials.

This is a **monorepo** containing both applications:

```
TutorSpace/
├── TutorSpace-Backend/    → REST API (Express + TypeScript + Prisma + PostgreSQL)
└── TutorSpace-Frontend/   → Web app (Next.js 16 + React 19 + Tailwind + shadcn/ui)
```

---

## Features

**Accounts & roles** — email/password and Google sign-in via Better Auth, with three roles: student, tutor, admin. Tutors are verified by an admin before appearing as verified.

**Discovery & booking** — browse tutors and published session slots, filter by subject and price. A tutor sets only a slot's seat capacity; the server derives the session type from it (1 seat is `ONE_ON_ONE`, more is `GROUP`), so the two can never contradict each other. Capacity is enforced on the server, cancelled bookings release their seat, and an edit cannot reduce capacity below the seats already booked.

**Payments** — Stripe Checkout in BDT, confirmed by a signature-verified webhook. Students can cancel: more than 24 hours before the session a paid booking is refunded in full through Stripe, inside that window it is not. A cancellation by the *tutor* is always refunded regardless of timing.

**Live sessions** — a video call per session, backed by Daily.co, and a shared whiteboard backed by tldraw. Both are gated by one entitlement rule: you must be the session's tutor, or a student with a confirmed and paid booking, and the session must be inside its time window (from 15 minutes before the start until 15 minutes after the end). Rooms are private and each participant is issued a short-lived token; the tutor gets moderator rights. The tutor can save the whiteboard into the course's materials, so the lesson survives the call.

**Coursework** — assignments with file submissions, grading and written feedback; course materials; announcements; a calendar of upcoming sessions; reminder emails before a session and before an assignment is due.

**AI study tools** — for any PDF a tutor uploads to a course, a student with a paid booking in that course can generate a practice quiz and read a summary. Claude reads only that PDF and is told to use nothing else. Quizzes are interactive (multiple choice marked instantly, every answer explained with reference to the material), private to the student, and labelled as not reviewed by the tutor. A summary is generated once per material and shared by the whole course. Tutors can also generate a quiz for the whole course, which stays unpublished until they review and publish it.

**Admin** — manage users (ban/activate), courses, tutor verification and review moderation. Tutors get an earnings view.

---

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, Better Auth, Stripe, tldraw
- **Backend:** Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL, Better Auth, Stripe, Nodemailer, Anthropic SDK
- **Managed services:** Daily.co (video), Cloudinary (file uploads), Neon (PostgreSQL)

---

## Prerequisites

You will need a PostgreSQL database and accounts for the services the features depend on. Everything except the database degrades gracefully — a missing key disables that one feature with a clear error rather than breaking the app.

| Service | Needed for | Free tier |
|---|---|---|
| PostgreSQL (e.g. [Neon](https://neon.tech)) | everything | yes |
| [Stripe](https://stripe.com) | payments, refunds | yes (test mode) |
| [Daily.co](https://daily.co) | video calls | yes |
| [Cloudinary](https://cloudinary.com) | assignment & material uploads | yes |
| [Google Cloud](https://console.cloud.google.com) | Google sign-in | yes |
| [Anthropic](https://console.anthropic.com) | AI features | prepaid credits |
| Gmail SMTP app password | reminder & reset emails | yes |

---

## Getting started

### 1. Backend

```bash
cd TutorSpace-Backend
npm install
cp .env.example .env        # then fill it in — see below
npx prisma generate
npx prisma migrate deploy   # use `migrate dev` if you intend to change the schema
npm run dev                 # http://localhost:5000
```

### 2. Frontend

In a second terminal:

```bash
cd TutorSpace-Frontend
npm install
cp .env.example .env        # then fill it in — see below
npm run dev                 # http://localhost:3000
```

Open **http://localhost:3000**.

### 3. Seed demo data (optional)

```bash
cd TutorSpace-Backend
npm run seed:admin                 # creates the admin account
npm run seed:data                  # DRY RUN — prints what it would do
npm run seed:data -- --apply       # actually writes
```

`seed:data` **deletes all existing tutor accounts** and replaces them with ten varied demo tutors, four students, bookable slots and real reviews (so ratings are genuinely derived, not hard-coded). It requires `--apply` precisely because it is destructive.

Seeded accounts use the domain `tutorspace.demo` and the password `password123` — e.g. `rafiqul.islam@tutorspace.demo` (tutor), `rakib.hasan@tutorspace.demo` (student).

---

## Environment variables

### `TutorSpace-Backend/.env`

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | any long random string; **also derives whiteboard room ids**, so changing it orphans boards in progress |
| `FRONTEND_URL` | origin of the frontend, e.g. `http://localhost:3000`. Auth callbacks and CORS are built from this — a mismatch is the usual cause of "Invalid origin" |
| `BETTER_AUTH_URL` | origin of this API, e.g. `http://localhost:5000` |
| `STRIPE_SECRET_KEY` | use a `sk_test_…` key in development |
| `STRIPE_WEBHOOK_SECRET` | from the Stripe webhook endpoint (`whsec_…`) |
| `STRIPE_CURRENCY` | defaults to `bdt` |
| `DAILY_API_KEY` | from the Daily dashboard |
| `ANTHROPIC_API_KEY` | for the AI features |
| `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | Gmail address and app password |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth web client |
| `CRON_SECRET` | shared secret for the scheduled-reminders endpoint |

### `TutorSpace-Frontend/.env`

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_APP_URL` | must match the origin you actually open in the browser — the session cookie is scoped to it |
| `API_BASE` | origin of the API, no path. Baked into the rewrite at **build time**, so changing it requires a rebuild |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | must be an **unsigned** upload preset |

Environment files are git-ignored and must be created locally. Never commit secrets — the API key is server-side only and must never appear in a `NEXT_PUBLIC_*` variable, which is shipped to the browser.

### Google OAuth redirect URI

Register this in Google Cloud Console → Credentials, as an authorised **redirect URI**:

```
<FRONTEND_URL>/api/v1/auth/callback/google
```

Note it is the **frontend** origin, not the API's. The frontend proxies `/api/v1/*` through to the API, so the whole auth flow stays on one origin.

---

## Local development notes

Three things that cost time if you don't know them:

**Use `127.0.0.1` for `API_BASE`, not `localhost`.** On Windows, `localhost` resolves to IPv6 `::1` first; if Express is bound to IPv4 only, every server-side request stalls on the failed attempt before retrying.

**But open the site at whatever `NEXT_PUBLIC_APP_URL` says.** The session cookie is scoped to the origin that set it, so typing `127.0.0.1:3000` when the variable says `localhost:3000` produces a login that appears to succeed and then behaves as though you are signed out.

**Cookies are relaxed in development on purpose.** In production the session cookie is `Secure; SameSite=None`, which browsers reject over plain HTTP. The code checks `NODE_ENV` and relaxes the attributes locally, so don't set `NODE_ENV=production` in a local `.env`.

### Testing Stripe locally

```bash
cd TutorSpace-Backend
npm run stripe:webhook      # needs the Stripe CLI, prints a whsec_… to use locally
```

Test card `4242 4242 4242 4242`, any future expiry, any CVC.

---

## Scheduled jobs

Session and assignment reminder emails run from one endpoint rather than an in-process timer, because the API is deployed serverless and has no long-lived process to hold a scheduler.

```
GET /api/v1/cron/reminders
Authorization: Bearer <CRON_SECRET>
```

Point any external scheduler at it (e.g. [cron-job.org](https://cron-job.org)) **every 5 minutes** — session reminders look for sessions starting within the next 30 minutes, so a longer interval lets some slip through unnotified.

---

## Deployment

Both apps deploy to Vercel as two projects from this one repository, differing only in **Root Directory** (`TutorSpace-Frontend` and `TutorSpace-Backend`).

> ### ⚠️ The backend deploys a committed bundle
>
> `TutorSpace-Backend/deploy/server.js` is a **build artifact that is committed on purpose**, and `vercel.json` serves it directly.
>
> This is necessary because Prisma 7's generated client contains extensionless relative imports, which are invalid ESM and fail at runtime unless the application is bundled. Vercel does not bundle your application, so the bundle has to be built here. `tsup` inlines all application code — including the generated client — leaving only bare package imports.
>
> **Run `npm run build` in `TutorSpace-Backend` before committing any backend change**, or you will deploy the previous bundle with nothing to warn you.

After the first deploy of each project, set the cross-referencing variables (`FRONTEND_URL`, `BETTER_AUTH_URL`, `API_BASE`, `NEXT_PUBLIC_APP_URL`) to the real deployment URLs and redeploy both — Vercel bakes environment variables in at build time, so changing a value does nothing until the project is rebuilt.

Then update the three external services with the deployed URLs:

- **Google Cloud Console** → authorised redirect URI and JavaScript origin
- **Stripe** → webhook endpoint `<API_URL>/api/v1/payments/webhook`, and copy the new signing secret into `STRIPE_WEBHOOK_SECRET`
- **Scheduler** → `<API_URL>/api/v1/cron/reminders`

Finally, run the migrations against the production database:

```bash
cd TutorSpace-Backend
npx prisma migrate deploy
```

---

## Project structure

```
TutorSpace-Backend/
├── prisma/
│   ├── schema.prisma          # data model
│   └── migrations/            # complete history — a fresh database builds from these
├── src/
│   ├── app.ts                 # Express app: middleware + route registration
│   ├── server.ts              # entry; listens locally, exports the app on Vercel
│   ├── lib/
│   │   ├── auth.ts            # Better Auth configuration
│   │   ├── sessionAccess.ts   # the single entitlement rule for live sessions
│   │   ├── select.ts          # field allow-lists, so password hashes never leave
│   │   ├── pick.ts            # request-body allow-list helper
│   │   └── anthropic.ts       # Claude client
│   ├── middlewares/           # auth, validation, error handling
│   ├── modules/<feature>/     # router + controller + service + zod validation
│   └── seed/                  # demo data scripts
└── deploy/server.js           # committed build artifact (see Deployment)

TutorSpace-Frontend/
├── src/
│   ├── app/
│   │   ├── (CommonLayout)/    # public pages
│   │   └── (DashboardLayout)/ # @student / @tutor / @admin parallel routes
│   ├── components/
│   │   ├── modules/<feature>/ # feature UI
│   │   ├── shared/            # skeletons, responsive-table helpers
│   │   └── ui/                # shadcn primitives
│   ├── services/<feature>/    # server actions that call the API
│   ├── lib/                   # api base, currency, cancellation policy preview
│   └── proxy.ts               # middleware: session check + role routing
└── next.config.ts             # /api/v1/* rewrite to API_BASE
```

Each backend feature follows the same four-file shape — `*.router.ts` declares routes and auth, `*.controller.ts` handles HTTP, `*.service.ts` holds the logic and authorisation, `*.validation.ts` is the Zod schema.

---

## Notes on a few design decisions

**Authorisation lives in the service layer, not the UI.** Every rule that matters — who may join a session, who may edit a booking, which fields a request may set — is enforced server-side. The UI hides buttons for convenience, never for security.

**Requests are allow-listed, not spread.** Services use `pick()` to take only the fields a caller may set, so no request can write to a column it shouldn't, and responses use explicit `select` allow-lists so password hashes cannot leak through a relation include.

**Live-session access has one definition.** The video call and the whiteboard both call `resolveSessionAccess()`. Two features answering "may this person be here?" separately is how they drift apart.

**AI grounded in the course, and honest about it.** Quizzes and summaries are generated only from the tutor's own PDF, every quiz answer carries an explanation pointing back to the material, and anything a tutor hasn't reviewed is labelled as such. Access follows the same idea as live sessions: a paid booking in the course, checked on the server before anything else.
