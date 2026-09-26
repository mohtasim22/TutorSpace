# TutorSpace 🎓

**"Connect with Expert Tutors, Learn Anything"** — a full-stack online tutoring marketplace where students discover verified tutors, book time-slotted sessions (one-on-one or group), pay securely, and leave reviews.

This is a **monorepo** containing both applications:

```
TutorSpace/
├── TutorSpace-Backend/    → REST API (Express + TypeScript + Prisma + PostgreSQL)
└── TutorSpace-Frontend/   → Web app (Next.js 16 + React 19 + Tailwind + shadcn/ui)
```

## Tech stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, Better Auth, Stripe
- **Backend:** Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL, Better Auth, Stripe, Nodemailer

## Getting started

### Backend
```bash
cd TutorSpace-Backend
npm install
cp .env.example .env      # fill in your values
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd TutorSpace-Frontend
npm install
cp .env.example .env      # fill in your values
npm run dev
```

Open http://localhost:3000

> Environment files (`.env`, `.env.local`) are git-ignored and must be created locally — never commit secrets.
