# TutorSpace Backend

A RESTful API backend for the TutorSpace tutoring platform, built with Express.js, TypeScript, Prisma, and PostgreSQL. It features a complete authentication system via Better Auth, secure payment processing via Stripe, and email notifications.

## 🔗 Live API

**Base URL:** `https://tutorspace-api-seven.vercel.app/api/v1`
*(Note: Refer to .env for the latest deployed URL)*

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** Better Auth (Email/Password & Google OAuth)
- **Payments:** Stripe
- **Email:** Nodemailer (SMTP)
- **Deployment:** Vercel

## 📁 Project Structure

```
src/
├── generated/
│   └── prisma/          → Prisma generated client
├── lib/
│   ├── prisma.ts        → Prisma client instance
│   └── auth.ts          → Better Auth configuration
├── middlewares/
│   ├── notFound.ts      
│   └── globalErrorHandler.ts
├── modules/
│   ├── user/            → User management
│   ├── tutor/           → Tutor profile management
│   ├── course/          → Course CRUD
│   ├── courseSlot/      → Course slot management
│   ├── booking/         → Booking management
│   ├── review/          → Review & ratings
│   ├── admin/           → Admin operations
│   └── payment/         → Stripe payments integration
├── seedAdmin/           → Admin seeder
├── app.ts               → Express app setup
└── server.ts            → Entry point
prisma/
└── schema.prisma        → Database schema
```

## 🗄 Database Schema

Key models: `User`, `TutorProfile`, `Course`, `CourseSlot`, `Booking`, `Review`, `Payment`

User roles: `STUDENT`, `TUTOR`, `ADMIN`

Booking statuses: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`

Review statuses: `APPROVED`, `REJECTED`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe Account
- Google OAuth Credentials (Optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/mohtasim22/tutorspace-backend.git
cd tutorspace-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Application URLs
FRONTEND_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:5000

# Better Auth Secret
BETTER_AUTH_SECRET=your_better_auth_secret_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# SMTP Configuration (For Emails)
SMTP_USER=your_smtp_email
SMTP_PASS=your_smtp_password
EMAIL_FROM=your_email_sender_name

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/callback/google
```

### Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed admin user (optional)
npm run seed:admin

```

### Run Locally

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Run Stripe Webhook locally
npm run stripe:webhook
```

## 🔐 Authentication

Authentication is managed by [Better Auth](https://better-auth.com), providing an integrated, secure solution.

It supports:
- Traditional Email/Password authentication
- Password Reset Functionality
- Google OAuth 
- Cookie-based session management

## 💳 Payments

The backend integrates with Stripe to handle secure payment processing for course bookings.

Webhooks are used to listen to Stripe events (e.g. successful checkout sessions) to automatically update booking status and confirm payments on the backend.

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Ensure you configure all environment variables via the Vercel dashboard.

## 📦 Scripts

```bash
npm run dev            # Start development server
npm run build          # Compile TypeScript code
npm run start          # Run compiled production build
npm run seed:admin     # Seed admin user to the database
npm run stripe:webhook # Listen to Stripe webhook events locally
```

## 👤 Author

**Mohtasim** — [github.com/mohtasim22](https://github.com/mohtasim22)
<!-- updated -->
