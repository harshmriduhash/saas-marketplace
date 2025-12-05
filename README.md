# Online Marketplace App

## Overview

Online store for selling digital products (Software applications related to artificial intelligence). Users can list their own apps, make offers for other listings, and **feature their listings via Razorpay payments**.

For authentication, this app uses Clerk, a solution that provides out of the box user management.
The database is a PostgreSQL that runs in a Docker container (dev) or managed Postgres (production). The NextJS app uses Prisma ORM to communicate with the database.

## Quick Start

### Prerequisites
- Node.js and npm
- PostgreSQL (Docker or managed)
- Clerk account (free tier available)
- Razorpay account (for payments)

### Run Locally

1. Start the Docker database (development):
```bash
./run-docker.sh
```

2. Install dependencies and set up environment:
```bash
npm install
cp .env.example .env
# Edit .env with your Clerk and Razorpay credentials
```

3. Apply database migrations:
```bash
npx prisma db push
```

4. Start the dev server:
```bash
npm run dev
```

Visit `http://localhost:3000`.

### Testing Payments Locally

See [RAZORPAY_WEBHOOK_GUIDE.md](./RAZORPAY_WEBHOOK_GUIDE.md) for:
- Setting up Razorpay test keys
- Using ngrok to test webhooks locally
- Testing the full payment flow
- Deployment to production

## Features

### User Features
- **User authentication** via Clerk
- **Browse listings** with search and filtering
- **Create & sell listings** of AI SaaS products with details:
  - Financial metrics (TTM profit, revenue)
  - Company overview (tech stack, business model, competitors)
  - Acquisition details (reason for selling, financing)
  - **Image uploads** (Cloudinary)
- **Make offers** by sending messages to listing owners
- **Like/Save listings** to wishlist
- **Feature listings** via Razorpay payment (₹499 for 7 days)

### Admin Features
- **Admin dashboard** at `/admin/transactions`
- **View all payments** and transaction history
- **View featured listings** with expiry dates

### Payment Integration
- **Razorpay** for payment processing (India-focused)
- **Featured listing model** → earn ₹499 per featured listing
- **Webhook verification** with signatures for security
- **Admin transactions view** for monitoring revenue

## Project Structure

```
src/
  ├── pages/
  │   ├── index.tsx              # Homepage
  │   ├── browse.tsx              # Browse listings
  │   ├── sell-an-item.tsx        # Create listing (4-step form + image upload)
  │   ├── listings/[id].tsx       # View listing detail + Make Featured button
  │   ├── api/
  │   │   ├── trpc/[trpc].ts      # tRPC endpoint
  │   │   ├── razorpay/
  │   │   │   ├── create-order.ts # Create Razorpay order
  │   │   │   └── webhook.ts      # Webhook handler (signature verification)
  │   │   └── cloudinary/
  │   │       └── signature.ts    # Image upload signature generator
  │   ├── admin/
  │   │   └── transactions.tsx    # Admin dashboard (payments + featured listings)
  │   ├── sign-in/[...index].tsx  # Clerk sign-in
  │   └── sign-up/[...index].tsx  # Clerk sign-up
  ├── server/
  │   ├── api/
  │   │   ├── root.ts             # tRPC app router
  │   │   ├── trpc.ts             # tRPC context & procedures
  │   │   └── routers/
  │   │       ├── listings.ts     # Listing CRUD + messaging
  │   │       └── admin.ts        # Admin queries (payments, featured)
  │   └── db.ts                   # Prisma client
  ├── utils/
  │   ├── api.ts                  # tRPC client setup
  │   └── useCloudinaryUpload.ts  # Image upload hook
  └── components/
      ├── NavBar.tsx
      ├── MakeOfferModal.tsx
      └── ... (other UI components)

prisma/
  ├── schema.prisma               # Data models (Listing, Message, Like, Payment)
  └── migrations/                 # Database migration files

docker-compose.yml                # Local Postgres setup (development)
```

## Database Models

- **Listing** → Product/app listings with metadata
  - Fields: `isFeatured`, `featuredUntil`, `paid`, `imageUrl`, `payments` (relation)
- **Message** → Communication between buyers and sellers
- **Like** → User wishlist/saves
- **Payment** → Transaction records (Razorpay integration)
  - Tracks order ID, payment ID, amount, status, timestamp

## Environment Variables

See `.env.example` and [RAZORPAY_WEBHOOK_GUIDE.md](./RAZORPAY_WEBHOOK_GUIDE.md) for full details.

Key variables:
- `DATABASE_URL` → PostgreSQL connection
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` → Razorpay API keys
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` → Cloudinary for images
- `FEATURED_FEE_INR`, `FEATURED_DAYS` → Pricing configuration

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Vercel will auto-detect Next.js, install dependencies, and build. Configure environment variables in Vercel dashboard.

### Other Platforms

Deploy to Netlify, Railway, Render, or any Node.js hosting by:
1. Building: `npm run build`
2. Starting: `npm run start`
3. Setting environment variables

See [RAZORPAY_WEBHOOK_GUIDE.md](./RAZORPAY_WEBHOOK_GUIDE.md) for production webhook setup.

## Development

### Run tests
```bash
npm test
```

### Format code
```bash
npm run lint
```

### Generate Prisma client
```bash
npx prisma generate
```

### View database
```bash
npx prisma studio
```

## Revenue Model

**Current**: Featured listing fee (₹499 for 7 days)

**Estimation** (12-month projection):
- Conservative: 20→300 listings/month (15% growth) = ₹9k–₹150k/month
- Moderate: 100→1,200 listings/month (20% growth) = ₹50k–₹600k/month
- Aggressive: 300→4,000 listings/month (30% growth) = ₹150k–₹2M+/month

Actual revenue depends on market traction, marketing, and marketplace adoption.

## Roadmap (Phase 2+)

- [ ] Commission-based sales (buyer pays, seller receives minus commission)
- [ ] Seller payout system (Stripe Connect or equivalent for India)
- [ ] Advanced search and filtering
- [ ] Listing analytics (views, clicks, conversions)
- [ ] Testimonials and reviews
- [ ] Email notifications
- [ ] Monitoring and analytics (Sentry, LogRocket)
- [ ] KYC for sellers (compliance)

## Security

- Razorpay webhook signatures verified server-side
- API keys secured in environment variables
- Clerk handles authentication and user management
- CSRF protection via Next.js
- Prisma ORM prevents SQL injection

## Support & Resources

For integration help:
1. **Payments**: [RAZORPAY_WEBHOOK_GUIDE.md](./RAZORPAY_WEBHOOK_GUIDE.md)
2. **Razorpay docs**: https://razorpay.com/docs
3. **Clerk docs**: https://clerk.com/docs
4. **Prisma docs**: https://www.prisma.io/docs
5. **Cloudinary docs**: https://cloudinary.com/documentation

---

**Built with**: Next.js 13, React 18, TypeScript, Prisma, Tailwind CSS, tRPC, Clerk, Razorpay, Cloudinary
