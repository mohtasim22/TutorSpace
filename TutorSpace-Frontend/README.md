# TutorSpace Frontend

A modern tutoring platform frontend built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui. Connect students with verified tutors for one-on-one learning sessions, complete with secure payments and comprehensive dashboard management.

## 🔗 Live App

**Frontend:** `https://tutorspace-frontend-wheat.vercel.app/`
**Backend API:** `https://tutorspace-api-seven.vercel.app/api/v1`

## 🛠 Tech Stack

- **Framework:** Next.js 16.1.6 (App Router + Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI)
- **Forms & Validation:** React Hook Form + Zod
- **Notifications:** Sonner
- **Animations:** Framer Motion & Embla Carousel
- **Theme:** next-themes (Dark/Light mode)
- **Authentication:** Better Auth (Cookie-based JWT, Password Recovery)
- **Payments:** Stripe Integration
- **Deployment:** Vercel

## 📁 Project Structure

```
src/
├── app/
│   ├── (CommonLayout)/          → Public routes
│   │   ├── page.tsx             → Home
│   │   ├── tutors/              → Tutors listing & details
│   │   ├── course-slots/        → Course slots listing & details
│   │   ├── about-us/            → About page
│   │   ├── login/               → Login page
│   │   ├── register/            → Register + Tutor profile setup
│   │   ├── forget-password/     → Password recovery form
│   │   └── reset-password/      → Reset password form
│   ├── (DashboardLayout)/       → Protected dashboard routes
│   │   ├── @admin/dashboard/    → Admin parallel slot
│   │   ├── @student/dashboard/  → Student parallel slot
│   │   └── @tutor/dashboard/    → Tutor parallel slot
│   └── proxy.ts                 → Next.js 16 middleware
├── components/
│   ├── modules/                 → Feature-specific components
│   │   ├── auth/                → Login, Register & Recovery forms
│   │   ├── admin/               → Admin management pages
│   │   ├── bookings/            → Booking components & Stripe checkout
│   │   ├── courseSlots/         → Slot management
│   │   ├── courses/             → Course management
│   │   ├── profile/             → Profile forms
│   │   ├── reviews/             → Review components
│   │   └── tutors/              → Tutor cards & details
│   ├── shared/                  → Navbar, Footer, ThemeToggle
│   └── ui/                      → shadcn/ui components
└── services/                    → API service functions
```

## 👥 User Roles & Features

### 🎓 Student
- Browse and search tutors and course slots
- Book course slots with **Stripe Secure Checkout**
- View and manage bookings & payment history
- Leave, edit, and delete reviews on completed sessions
- Secure password recovery support

### 📚 Tutor
- Create and manage courses
- Create, edit, and delete course slots
- Manage booking requests (confirm/cancel/complete)
- View ratings and reviews
- Edit tutor profile

### 🛡 Admin
- Manage all users (activate/deactivate)
- Verify/unverify tutors
- Manage all bookings and track Stripe payments
- Manage all courses (edit/delete)
- Manage all reviews (approve/reject/delete)
- View platform statistics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see [tutorspace-backend](https://github.com/mohtasim22/tutorspace-backend))

### Installation

```bash
# Clone the repository
git clone https://github.com/mohtasim22/tutorspace-frontend.git
cd tutorspace-frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:5000/api/v1
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe Public Key
```

### Run Locally

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Home page with featured tutors | Public |
| `/tutors` | Browse & filter all tutors | Public |
| `/tutors/[id]` | Tutor profile with reviews & slots | Public |
| `/course-slots` | Browse & search all course slots | Public |
| `/course-slots/[id]` | Course slot details & booking | Auth |
| `/about-us` | About TutorSpace | Public |
| `/login` | Login page | Public |
| `/register` | Register as student or tutor | Public |
| `/register/tutor-profile` | Tutor profile setup after register | Public |
| `/forget-password` | Request password reset email | Public |
| `/reset-password` | Set a new password | Public |
| `/dashboard` | Role-based dashboard overview | Auth |
| `/dashboard/bookings` | Manage bookings & payments | Auth |
| `/dashboard/booking-history` | Booking history & reviews | Student |
| `/dashboard/slots` | Manage course slots | Tutor |
| `/dashboard/courses` | Manage courses | Tutor |
| `/dashboard/reviews` | Reviews & ratings | Tutor/Admin |
| `/dashboard/profile` | Profile settings | Auth |
| `/dashboard/users` | Manage users | Admin |
| `/dashboard/tutors` | Verify tutors | Admin |

## 🎨 Features

- **Stripe Payments** — Secure payment gateway for booking courses and processing webhooks seamlessly.
- **Better Auth Integration** — Advanced authentication logic including password recovery and role-based access.
- **Dark/Light mode** — system preference + manual toggle.
- **Responsive design** — mobile-first with collapsible sidebar.
- **Search & filters** — search tutors and slots by name, course, rating.
- **Real-time updates** — optimistic UI updates without page refresh.
- **Loading skeletons** — smooth loading states for all pages.
- **Toast notifications** — success/error feedback via Sonner.
- **Protected routes** — JWT-based middleware for dashboard access.
- **Redirect after login** — preserves intended destination.

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Required Environment Variables on Vercel

```env
NEXT_PUBLIC_BASE_URL=https://your-backend.vercel.app/api/v1
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 👤 Author

**Mohtasim** — [github.com/mohtasim22](https://github.com/mohtasim22)