# Razorpay Payment Integration & Webhook Testing Guide

## 1. Local Setup (Razorpay + Webhook Testing with ngrok)

### Prerequisites
- Node.js and npm installed
- Razorpay account (https://razorpay.com)
- ngrok installed (https://ngrok.com) for webhook tunneling

### Step 1: Install dependencies and set up environment

```bash
npm install
npx prisma db push
```

### Step 2: Create `.env` file with Razorpay credentials

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then populate it with your credentials:

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Razorpay (from https://dashboard.razorpay.com/app/settings/api-keys)
RAZORPAY_KEY_ID=rzp_test_xxxx...
RAZORPAY_KEY_SECRET=xxx...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx...

# Cloudinary (optional, for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Featured listing settings
FEATURED_FEE_INR=499
FEATURED_DAYS=7
```

### Step 3: Start the development server

```bash
npm run dev
```

The app will be running on `http://localhost:3000`.

### Step 4: Expose local server to the internet with ngrok

In a new terminal window, run:

```bash
ngrok http 3000
```

This will output something like:
```
Forwarding    https://abc123def456.ngrok.io -> http://localhost:3000
```

Copy the HTTPS URL (e.g., `https://abc123def456.ngrok.io`).

### Step 5: Register webhook in Razorpay Dashboard

1. Go to https://dashboard.razorpay.com/app/webhooks
2. Click **Add webhook** (if testing) or **Create webhook**
3. Enter webhook URL as:
   ```
   https://abc123def456.ngrok.io/api/razorpay/webhook
   ```
4. Select events: **payment.captured**, **payment.authorized**, **order.paid**
5. Save webhook

### Step 6: Test the payment flow

1. Open `http://localhost:3000/browse`
2. Click on any listing and click **Make Featured (₹499)** button
3. In Razorpay Checkout:
   - Use test card: **4111 1111 1111 1111**
   - Expiry: any future date (e.g., 12/25)
   - CVV: any 3 digits (e.g., 123)
4. Click **Pay**
5. Check your ngrok terminal — you should see a webhook POST to `/api/razorpay/webhook`
6. Verify in the database that the listing's `isFeatured` and `featuredUntil` fields were updated
7. Visit `/admin/transactions` to view the payment record

### Troubleshooting Local Testing

**Webhook not being received?**
- Check ngrok terminal for requests
- Verify webhook URL in Razorpay dashboard matches ngrok URL
- Check `.env` for `RAZORPAY_KEY_SECRET` (must match dashboard)

**Payment not updating listing?**
- Check browser console for errors
- Check server logs for webhook errors
- Verify Prisma migration was applied (`npx prisma migrate status`)

---

## 2. Production Deployment

### Prerequisites
- Vercel account (https://vercel.com)
- Production Postgres database (Neon, Supabase, PlanetScale, or Heroku)

### Step 1: Prepare production environment variables

Create a production `.env.production`:

```
DATABASE_URL=postgresql://user:password@prod.db.host/dbname
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

RAZORPAY_KEY_ID=rzp_live_xxxx...    # LIVE keys, not test!
RAZORPAY_KEY_SECRET=xxx...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx...

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

FEATURED_FEE_INR=499
FEATURED_DAYS=7
```

### Step 2: Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

During setup:
- Link to your GitHub repo
- Set environment variables (paste contents of `.env.production`)
- Vercel will auto-detect Next.js and build

Or use Vercel dashboard to add environment variables:
- Go to your project → Settings → Environment Variables
- Add each variable from `.env.production`

### Step 3: Run production database migration

After deploying to Vercel, run the Prisma migration on production:

```bash
npx prisma migrate deploy
```

Or via Vercel CLI:

```bash
vercel env pull .env.production.local
npx prisma migrate deploy --preview-feature
```

### Step 4: Register webhook in Razorpay (Production)

1. Switch to LIVE mode in Razorpay dashboard
2. Go to https://dashboard.razorpay.com/app/webhooks
3. Add webhook pointing to your Vercel deployment:
   ```
   https://your-app.vercel.app/api/razorpay/webhook
   ```
4. Select events: **payment.captured**, **payment.authorized**, **order.paid**
5. Use your LIVE **RAZORPAY_KEY_SECRET** for signature verification

### Step 5: Verify deployment

1. Visit your production URL
2. Test a real payment (or test card on live mode)
3. Check `/admin/transactions` to see payment recorded
4. Monitor logs in Vercel dashboard for any errors

---

## 3. Admin Dashboard

View all payments and featured listings at:
```
https://localhost:3000/admin/transactions
```

Features:
- Recent payment history (last 50 transactions)
- Payment status, amount, and dates
- List of currently featured listings
- Direct links to view listings and payments

---

## 4. Image Uploads (Cloudinary)

### Setup Cloudinary

1. Sign up at https://cloudinary.com
2. Get your **Cloud Name**, **API Key**, and **API Secret**
3. Create an **unsigned upload preset** in the Cloudinary dashboard:
   - Go to Settings → Upload → Upload presets
   - Add preset with name `unsigned_preset` (or change in code)
   - Set to unsigned mode
4. Add to `.env`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   ```

### Using image uploads

- When creating a listing, upload an image in Step 1
- Image URL is automatically saved to `Listing.imageUrl`
- Displayed in listing detail page and browse cards

---

## 5. Environment Variable Reference

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `DATABASE_URL` | string | ✓ | PostgreSQL connection string |
| `RAZORPAY_KEY_ID` | string | ✓ | Razorpay API key (test or live) |
| `RAZORPAY_KEY_SECRET` | string | ✓ | Razorpay API secret (server-side only) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | string | ✓ | Public Razorpay key ID (exposed to client) |
| `FEATURED_FEE_INR` | number | ✗ | Featured listing price in INR (default: 499) |
| `FEATURED_DAYS` | number | ✗ | Days to feature a listing (default: 7) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | string | ✗ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | string | ✗ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | string | ✗ | Cloudinary API secret (server-side) |

---

## 6. Security Checklist

- [ ] Use LIVE Razorpay keys in production (not test keys)
- [ ] Never expose `RAZORPAY_KEY_SECRET` to the client
- [ ] Verify webhook signatures server-side (already done in `/api/razorpay/webhook.ts`)
- [ ] Use HTTPS for all production webhooks
- [ ] Rate-limit `/api/razorpay/create-order` endpoint
- [ ] Add input validation for all form fields
- [ ] Enable CSRF protection in Next.js
- [ ] Monitor Sentry/logs for errors

---

## 7. Revenue Model

**Current setup**: Featured listing fee (₹499 for 7 days)

**Revenue calculation**:
- Razorpay charges ~2% + GST (≈ ₹10–15 per transaction)
- Net per payment ≈ ₹480–490
- Monthly revenue = (number of payments) × ₹485

**Example**: 100 featured listings/month = ₹48,500–49,000 gross revenue

**Next phases** (for future):
- Commission-based marketplace (seller payouts via Stripe Connect alternative)
- Listing promotion tiers
- Featured + Featured+ + Premium plans

---

## Support & Debugging

**Razorpay webhook test tool**: https://dashboard.razorpay.com/app/webhooks (send test event)

**Common issues**:
1. **"Invalid signature"** → Check `RAZORPAY_KEY_SECRET` matches dashboard
2. **Webhook not firing** → Check ngrok URL matches in Razorpay dashboard
3. **Payment shows but listing not featured** → Check Prisma migration was applied
4. **Cloudinary upload fails** → Verify API credentials and unsigned preset exists

---

## Next Steps

1. Test local payments with ngrok
2. Deploy to production
3. Set up monitoring (Sentry, LogRocket)
4. Add email notifications on payment success
5. Consider seller payout integrations (Phase 2)
