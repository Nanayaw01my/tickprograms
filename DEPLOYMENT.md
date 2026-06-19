# TicketHub — Deployment Guide

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Paystack account (test or production)
- Arkesel account for SMS
- SMTP email credentials (Gmail or SendGrid)
- Google OAuth credentials (optional)

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd tickprograms
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in all values in `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Random 32+ character string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (sk_test_... or sk_live_...) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `ARKESEL_API_KEY` | Arkesel API key |
| `SMTP_*` | Email SMTP credentials |

### 3. Database Setup

```bash
# Push schema to MongoDB
npm run db:push

# Seed with sample data + admin account
npm run db:seed
```

Default admin login: `admin@tickethub.com` / `admin123456`

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Build for Production

```bash
npm run build
npm start
```

## Paystack Webhook Setup

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/paystack`
3. Select event: `charge.success`
4. Copy webhook secret and add to environment

## Google OAuth Setup

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`

## Deploy on Vercel

```bash
npm install -g vercel
vercel --prod
```

Set all environment variables in Vercel dashboard.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth pages)        # login, register, forgot-password
│   ├── events/             # Event browsing & details
│   ├── dashboard/          # User dashboard & tickets
│   ├── admin/              # Admin panel
│   ├── checkout/           # Payment verification
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Navbar, Footer
│   ├── events/             # Event-specific components
│   ├── tickets/            # Ticket download/display
│   └── admin/              # Admin charts
├── lib/
│   ├── prisma.ts           # Database client
│   ├── auth.ts             # NextAuth configuration
│   ├── paystack.ts         # Paystack integration
│   ├── arkesel.ts          # SMS integration
│   ├── email.ts            # Email service
│   ├── qrcode.ts           # QR code generation
│   └── utils.ts            # Utility functions
├── types/                  # TypeScript types
└── middleware.ts            # Route protection
```

## Key Features

- **Authentication**: Email/password + Google OAuth
- **Event Browsing**: Search, filter by category, featured events
- **Ticket Purchase**: Paystack payment gateway
- **Digital Tickets**: QR code generation + PDF download
- **SMS Notifications**: Arkesel integration
- **Admin Dashboard**: Revenue charts, event management
- **QR Scanner**: Ticket validation at venue
- **Webhook**: Secure Paystack webhook verification
