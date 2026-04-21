# LocalStake — Complete Technical & Product Guide

## What Is LocalStake

LocalStake is India's platform for fractional investing in local businesses. It enables salaried individuals to invest ₹1–10L into tangible businesses like gyms, pickleball courts, cafés, salons, EV fleets, and cloud kitchens using a royalty-based return model.

---

## The Problem

- MSMEs lack access to flexible capital for expansion
- Banks require collateral and have rigid repayment structures
- Investors lack access to understandable, tangible investment options
- Trust gap between small investors and small business owners

## The Solution

- Marketplace connecting business owners and investors
- Royalty model for predictable returns
- Escrow-based secure transactions
- Transparent dashboards for tracking performance

---

## Three Actors in the System

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   INVESTOR   │     │  BUSINESS OWNER   │     │    ADMIN     │
│              │     │                   │     │              │
│ Browse       │     │ Register biz      │     │ Verify KYC   │
│ Invest       │     │ Create listing    │     │ Approve list │
│ Track returns│     │ Report revenue    │     │ Manage escrow│
│ Get payouts  │     │ Trigger payouts   │     │ Handle issues│
└──────────────┘     └───────────────────┘     └──────────────┘
```

---

## End-to-End User Journeys

### Investor Journey
```
Landing Page
  → Browse Explore page (filter by category, city, ROI)
  → Open Listing Detail page
  → View ROI Calculator, financials, risk factors
  → Click "Invest Now"
  → Enter amount → Review summary → Accept agreement → Pay via Razorpay
  → Funds held in ESCROW
  → When listing fully funded → escrow released to owner
  → Owner reports monthly revenue
  → Investor receives monthly royalty payouts
  → Track everything on Dashboard + Payouts page
  → Payouts stop when return multiple (e.g. 1.6x) achieved
```

### Owner Journey
```
Sign up as Owner
  → Submit business details + documents (GST, PAN, photos)
  → Admin verifies and approves business
  → Create Listing (funding goal, royalty %, return multiple, duration)
  → Listing goes live after admin approval
  → Track funding progress on Owner Dashboard
  → When fully funded → receive capital from escrow
  → Every month: submit revenue report
  → Platform auto-calculates and distributes payouts to all investors
  → Continue until all investors reach their return multiple
```

### Admin Journey
```
Login as Admin
  → View platform stats (users, listings, funded amount, pending KYC)
  → Verify user KYC (approve/reject)
  → Approve/reject business listings
  → Monitor escrow balances
  → Force release or refund escrow if needed
  → View all transactions
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript + Vite | SPA framework |
| UI Library | Material UI (MUI) v9 | Components, theming, responsive design |
| State | Zustand | Global auth state management |
| Routing | React Router v6 | Client-side navigation |
| Backend | Node.js + Express | REST API server |
| ORM | Prisma 6 | Database queries, schema, migrations |
| Database | PostgreSQL | Relational data storage |
| Payments | Razorpay | Payment collection, escrow, refunds |
| KYC | Digio | PAN, Aadhaar, Bank, GST verification |
| eSign | Leegality | Investment agreement digital signing |
| Email | Resend | Transactional emails |
| Auth | JWT + bcrypt | Token-based authentication |
| Validation | Zod | Request body validation |
| File Upload | Multer | Document uploads |
| Hosting (FE) | Vercel | Frontend deployment (deployed) |
| Hosting (BE) | Railway / Render | Backend deployment |
| Hosting (DB) | Neon / Railway | Managed PostgreSQL |

---

## What Each Integration Does

### Razorpay — Money Movement
- Creates payment orders when investor clicks "Invest"
- Verifies payment signatures after checkout
- Holds funds in escrow until funding goal met
- Processes refunds if listing fails
- RazorpayX for sending payouts to investor bank accounts
- Webhook for payment.captured, payment.failed, refund.processed events

### Digio — Identity Verification (KYC)
- PAN card verification (name match against database)
- Aadhaar eKYC via OTP (identity + address + photo)
- Bank account verification (penny drop test)
- GST verification (for business owners)
- Required before an investor can make any investment

### Leegality — Legal Agreements
- Generates investment agreements from templates
- Sends to both investor and owner for digital signature
- Supports Aadhaar eSign and electronic signature
- Stores signed PDFs as documents
- Webhook callback when all parties have signed

### Resend — Email Notifications
- OTP emails for passwordless login
- Investment confirmation emails (amount, expected return, duration)
- Monthly payout notification emails (amount received, progress)
- KYC status update emails (verified/rejected)
- Funding complete notification to business owners

---

## Database Schema (10 Models)

### User
Stores all users (investors, owners, admins).
Fields: id, name, email, phone, role, kycStatus, panNumber, aadhaarNumber, digioKycId, otpCode, city, budgetMin, budgetMax, categories

### Business
A business registered by an owner.
Fields: id, ownerId, name, category, city, address, description, verified, gstNumber, panNumber

### Listing
A funding opportunity created for a business.
Fields: id, businessId, title, description, fundingGoal, raisedAmount, ownerContribution, royaltyPercent, returnMultiple, estimatedDuration, minInvestment, maxInvestment, monthlyRevenue, expectedRevenue, status, investorCount, escrowBalance, escrowReleased, agreementTemplateId

### Investment
An investor's investment in a listing.
Fields: id, userId, listingId, amount, expectedReturn, totalPaid, status, razorpayOrderId, razorpayPaymentId, agreementId, agreementSignedAt

### RevenueReport
Monthly revenue submitted by the owner.
Fields: id, listingId, month, revenue, payoutPool, distributed

### Payout
Individual payout to an investor from a revenue report.
Fields: id, investmentId, revenueReportId, amount, status, razorpayPayoutId

### Transaction
Audit log of all money movements.
Fields: id, investmentId, type (INVESTMENT/ESCROW_RELEASE/PAYOUT/REFUND), amount, status, razorpayId, metadata

### Document
Files uploaded by users (KYC docs, business photos, agreements).
Fields: id, userId, businessId, listingId, type, fileName, fileUrl, fileSize, mimeType

### Notification
In-app notifications for users.
Fields: id, userId, title, message, read, link

### Enums
- UserRole: INVESTOR, OWNER, ADMIN
- KycStatus: PENDING, IN_REVIEW, VERIFIED, REJECTED
- ListingStatus: DRAFT, PENDING_REVIEW, ACTIVE, FUNDED, CLOSED, REJECTED
- InvestmentStatus: ESCROW, ACTIVE, COMPLETED, REFUNDED
- PayoutStatus: PENDING, PROCESSING, PAID, FAILED
- TransactionType: INVESTMENT, ESCROW_RELEASE, PAYOUT, REFUND
- DocumentType: PAN, AADHAAR, GST_CERTIFICATE, BANK_STATEMENT, BUSINESS_PHOTO, FINANCIAL_DOC, EXPANSION_PLAN, INVESTMENT_AGREEMENT, OTHER

---

## Entity Relationship Diagram

```
User ──1:N──▶ Business ──1:N──▶ Listing ──1:N──▶ Investment ──1:N──▶ Payout
  │                                  │                │                  │
  │                                  │                │                  │
  ├──1:N──▶ Investment               ├──1:N──▶ RevenueReport ◀──1:N── Payout
  │                                  │
  ├──1:N──▶ Document                 ├──1:N──▶ Document
  │
  └──1:N──▶ Notification             Investment ──1:N──▶ Transaction
```

---

## Frontend Pages (12 Total)

| # | Page | Route | Actor | Description |
|---|------|-------|-------|-------------|
| 1 | Landing | `/` | Public | Hero section, platform stats, trust signals, how it works, featured listings, ROI example, CTA |
| 2 | Explore | `/explore` | Public | Browse all listings with filters (category, city, sort by ROI/progress/recent), search |
| 3 | Listing Detail | `/listing/:id` | Public | Full business details, ROI calculator with slider, financial overview table, risk factors, invest modal with stepper |
| 4 | Dashboard | `/dashboard` | Investor | Stats cards (invested, returns, active deals, portfolio value), investment list with progress bars |
| 5 | Payouts | `/payouts` | Investor | Payout history table (month, business, revenue, your share, status, date), summary stats |
| 6 | Login | `/login` | Public | Email + password login, demo account credentials shown |
| 7 | Signup | `/signup` | Public | 2-step: role selection (Investor/Owner) → details form (name, email, phone, password) |
| 8 | How It Works | `/how-it-works` | Public | Step-by-step for investors (Explore→Invest→Earn) and owners (Register→List→Grow), royalty explainer |
| 9 | Owner Dashboard | `/owner/dashboard` | Owner | Stats (raised, investors, listings), listing cards with funding progress |
| 10 | Create Listing | `/owner/create-listing` | Owner | 3-step stepper: business info → financials → investment terms |
| 11 | Owner Payouts | `/owner/payouts` | Owner | Submit monthly revenue, see estimated payout pool, past revenue reports table |
| 12 | Admin Panel | `/admin` | Admin | Tabs: Listings (approve/reject), Users (verify KYC), Payments overview |

---

## Backend API Endpoints (40+)

### Auth (`/api/auth`)
- `POST /register` — Create account (investor or owner)
- `POST /login` — Email + password login → returns JWT
- `POST /send-otp` — Send OTP to email
- `POST /verify-otp` — Verify OTP → returns JWT
- `GET /me` — Get current user profile
- `PATCH /me` — Update profile

### KYC (`/api/kyc`)
- `POST /verify-pan` — Verify PAN via Digio
- `POST /aadhaar/send-otp` — Send Aadhaar OTP via Digio
- `POST /aadhaar/verify-otp` — Verify Aadhaar OTP
- `POST /verify-bank` — Verify bank account
- `POST /verify-gst` — Verify GST number
- `GET /status` — Get KYC status

### Listings (`/api/listings`)
- `GET /` — Browse with filters, pagination, sorting
- `GET /:id` — Get single listing with business details
- `POST /` — Create listing (owner only, validates 25% owner contribution)
- `PATCH /:id` — Update listing (draft/pending only)
- `GET /owner/mine` — Get owner's listings

### Businesses (`/api/businesses`)
- `POST /` — Register business
- `GET /mine` — Get owner's businesses
- `GET /:id` — Get business details
- `PATCH /:id` — Update business

### Investments (`/api/investments`)
- `POST /` — Create investment (validates KYC, creates Razorpay order, creates Leegality agreement)
- `POST /verify-payment` — Verify Razorpay payment, update escrow, check if funding goal met
- `GET /mine` — Get investor's investments
- `GET /:id` — Get single investment with payouts

### Payouts (`/api/payouts`)
- `GET /mine` — Get investor's payout history
- `POST /submit-revenue` — Owner submits monthly revenue → triggers payout distribution
- `GET /revenue-reports/:listingId` — Get revenue reports for a listing
- `GET /investment/:investmentId` — Get payouts for specific investment

### Admin (`/api/admin`)
- `GET /stats` — Platform dashboard stats
- `GET /users` — List all users with filters
- `PATCH /users/:id/kyc` — Verify or reject KYC
- `GET /listings` — List all listings
- `PATCH /listings/:id/status` — Approve or reject listing
- `PATCH /businesses/:id/verify` — Verify business
- `POST /listings/:id/release-escrow` — Force release escrow
- `POST /listings/:id/refund-escrow` — Force refund escrow
- `GET /transactions` — View all transactions with aggregates

### Documents (`/api/documents`)
- `POST /upload` — Upload file (multer)
- `GET /mine` — Get user's documents
- `GET /business/:id` — Get business documents
- `GET /listing/:id` — Get listing documents
- `DELETE /:id` — Delete document

### Notifications (`/api/notifications`)
- `GET /` — Get notifications + unread count
- `PATCH /:id/read` — Mark as read
- `PATCH /read-all` — Mark all as read

### Webhooks (`/api/webhooks`)
- `POST /razorpay` — Razorpay payment events (captured, failed, refund)
- `POST /leegality` — Agreement signing completion
- `POST /digio` — KYC verification completion

---

## Royalty Payout Logic (Core Business Engine)

```
When owner submits monthly revenue:

Step 1: Calculate payout pool
  payout_pool = monthly_revenue × royalty_percentage
  Example: ₹9,00,000 × 8% = ₹72,000

Step 2: For each active investor
  investor_share = (investor_amount / total_raised) × payout_pool
  Example: (₹2,00,000 / ₹20,00,000) × ₹72,000 = ₹7,200/month

Step 3: Check completion
  if total_paid >= investment × return_multiple → STOP payouts, mark COMPLETED
  Example: ₹3,20,000 received >= ₹2,00,000 × 1.6x → done

Step 4: Record keeping
  - Create Payout records
  - Update Investment.totalPaid
  - Create Transaction audit log
  - Send email notification to each investor
  - Mark RevenueReport as distributed
```

---

## Payment & Escrow Flow

```
Investor clicks "Invest Now"
  │
  ▼
Backend creates Razorpay Order + Leegality Agreement
  │
  ▼
Frontend opens Razorpay Checkout popup
  │
  ▼
Payment captured → Webhook received
  │
  ▼
Investment status = ESCROW
Listing.raisedAmount += amount
Listing.escrowBalance += amount
  │
  ▼
Is funding goal met?
  │
  ├── YES → Release escrow
  │         All investments: ESCROW → ACTIVE
  │         Notify owner: "Funding complete!"
  │         Owner receives funds
  │
  └── NO → Wait for more investors
            │
            └── Admin decides to cancel?
                  │
                  └── YES → Refund all investors
                            All investments: ESCROW → REFUNDED
                            Razorpay refunds processed
```

---

## Deployment Architecture

```
┌─────────────────┐
│   User Browser   │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Vercel (FE)    │────▶│  Railway (BE)     │
│  React + MUI    │ API │  Express + Prisma │
│  ✅ DEPLOYED     │     │  Port 4000        │
└─────────────────┘     └────────┬──────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
              │ PostgreSQL │ │Razorpay│ │Digio/     │
              │ (Railway/  │ │       │ │Leegality/ │
              │  Neon)     │ │       │ │Resend     │
              └────────────┘ └───────┘ └───────────┘
```

---

## What's Done vs What's Remaining

### ✅ Phase 1 MVP — DONE (Code Complete)
- [x] 12 frontend pages with MUI
- [x] 40+ backend API endpoints
- [x] 10 database models with Prisma
- [x] Razorpay integration code
- [x] Digio KYC integration code
- [x] Leegality eSign integration code
- [x] Resend email templates
- [x] Payout engine (royalty calculation + distribution)
- [x] Escrow logic (release + refund)
- [x] Admin panel
- [x] Frontend deployed to Vercel
- [x] Code pushed to GitHub

### 🔲 Phase 1 — Remaining (Deployment + Config)
- [ ] Deploy backend to Railway
- [ ] Set up production PostgreSQL
- [ ] Push schema + seed to production DB
- [ ] Set VITE_API_URL on Vercel → backend URL
- [ ] Get Razorpay test API keys → add to env
- [ ] Get Digio sandbox credentials → add to env
- [ ] Get Leegality API key → add to env
- [ ] Get Resend API key → add to env
- [ ] Add Razorpay checkout popup in frontend invest flow (~20 lines)
- [ ] Build KYC verification page in frontend
- [ ] Add route protection (redirect unauthenticated users)
- [ ] Switch file uploads from local to S3

### 🔲 Phase 2 — Add Equity Model
- [ ] New investment type: equity (ownership + dividends + exit)
- [ ] Valuation calculator widget
- [ ] Dividend distribution engine
- [ ] Cap table management
- [ ] Updated listing creation with equity terms
- [ ] Legal: SPV/LLP structure per deal
- [ ] Equity-specific agreement templates in Leegality

### 🔲 Phase 3 — Multi-City Expansion
- [ ] Location-based discovery (GPS + map view)
- [ ] City-specific landing pages
- [ ] Automated business onboarding (reduce manual verification)
- [ ] Referral system for investors
- [ ] Business performance scoring/rating system
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced analytics dashboard

### 🔲 Phase 4 — Secondary Liquidity
- [ ] Secondary marketplace (investor-to-investor trading)
- [ ] Tokenization of investment shares
- [ ] AIF (Alternative Investment Fund) licensing
- [ ] Portfolio diversification tools
- [ ] Institutional investor onboarding
- [ ] Advanced compliance and reporting

---

## Go-To-Market Strategy

- Start with Delhi NCR or Bangalore
- Focus on one category (gyms or pickleball courts)
- Onboard 2–3 businesses manually
- Acquire 20–30 investors via personal network
- Build case study from first successful funded deal
- Use case study for organic growth

## MVP Success Metrics
- 1 successfully funded business
- 20–50 active investors
- ≥80% funding completion rate
- First payout successfully executed
- Investor NPS > 8

---

## Risk Mitigation (Built Into Platform)

| Risk | Mitigation |
|------|-----------|
| Business default | Conservative projections, owner contributes 25-30% |
| Trust | KYC verification, escrow protection, admin approval |
| Regulatory | LLP/SPV structure, platform as tech intermediary |
| Operational | Admin monitoring, transaction audit logs |
| Fraud | Document verification, bank account verification |

---

## Demo Accounts (Local + Seeded DB)

| Role | Email | Password |
|------|-------|----------|
| Investor | rahul@example.com | password123 |
| Owner | vikram@example.com | password123 |
| Admin | admin@localstake.in | password123 |

---

## Local Development

```bash
# Frontend (port 5173)
cd localstake
npm install
npm run dev

# Backend (port 4000)
cd localstake/server
npm install
npx prisma generate
npx prisma db push
npx tsx src/seed.ts    # seed demo data
npx tsx watch src/index.ts

# Requires PostgreSQL running locally
brew services start postgresql@16
```

---

## Repository Structure

```
localstake/
├── src/                    # Frontend (React)
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Navbar, Footer, Layout
│   │   ├── listings/       # ListingCard, ROICalculator
│   │   └── ui/             # Button, Card, Badge, etc.
│   ├── pages/              # Route pages
│   │   ├── admin/          # AdminPanel
│   │   └── owner/          # OwnerDashboard, CreateListing, OwnerPayouts
│   ├── hooks/              # useListings, useInvestments
│   ├── store/              # Zustand auth store
│   ├── lib/                # api.ts (API client), utils.ts
│   ├── data/               # mock.ts (fallback data)
│   ├── types/              # TypeScript interfaces
│   └── theme.ts            # MUI theme configuration
├── server/                 # Backend (Express)
│   ├── src/
│   │   ├── config/         # env.ts, db.ts
│   │   ├── middleware/     # auth, validate, errorHandler, params
│   │   ├── routes/         # auth, kyc, listings, businesses, investments,
│   │   │                   # payouts, admin, documents, notifications, webhooks
│   │   ├── services/       # razorpay, digio, leegality, email, payoutEngine
│   │   ├── index.ts        # Express app entry point
│   │   └── seed.ts         # Database seeder
│   └── prisma/
│       └── schema.prisma   # Database schema
└── GUIDE.md                # This file
```


---

## Escrow-Based Secure Transactions — Deep Dive

### The Core Idea

Investor money never goes directly to the business owner. It sits in a holding state (escrow) until the listing's funding goal is fully met. This protects investors from partial-funding scenarios where an owner gets some money but not enough to actually execute the expansion.

### Step-by-Step Flow

**1. Investor pays → money enters escrow**

When an investor pays via Razorpay, the backend creates an `Investment` record with `status: ESCROW`. The `Listing.escrowBalance` is incremented. The money is collected by Razorpay but the business owner can't touch it yet.

In the code (`server/src/routes/investments.ts`), after payment verification:
- `Investment.status` = `ESCROW`
- `Listing.raisedAmount` += amount
- `Listing.escrowBalance` += amount

**2. Funding goal met → escrow released**

When `raisedAmount` reaches `fundingGoal - ownerContribution`, the `releaseEscrow()` function in `payoutEngine.ts` fires:
- All investments move from `ESCROW` → `ACTIVE`
- `Listing.status` = `FUNDED`
- `Listing.escrowReleased` = `true`
- Transaction records created with type `ESCROW_RELEASE`
- Owner gets notified — funds are now available

**3. Funding fails → everyone gets refunded**

If the admin decides the listing won't reach its goal, they trigger `refundEscrow()`:
- All investments move from `ESCROW` → `REFUNDED`
- Razorpay refund initiated for each payment
- `Listing.status` = `CLOSED`
- `Listing.escrowBalance` = 0
- Transaction records created with type `REFUND`

### Razorpay Implementation Options

**Option A (current — application-level escrow):** Razorpay collects payment into the platform's Razorpay account. The backend tracks escrow state in the database. When funding completes, funds transfer to owner via RazorpayX (bank transfer). Simpler, works for MVP.

**Option B (production-grade — Razorpay Route):** Razorpay holds funds in a linked account and only releases them when you call the transfer API. True third-party escrow where even LocalStake can't access funds until release conditions are met. Better for trust, requires Razorpay Route activation.

### Why Escrow Matters for Trust

The escrow mechanism is the #1 trust builder for investors:
- Money doesn't go to the owner until the full amount is raised
- If the listing fails, investors get a full refund
- The platform can't misuse funds (especially with Razorpay Route)
- Every transaction is logged in the `Transaction` table as an audit trail

---

## Legal Agreement Flow (Leegality Integration) — Deep Dive

### How Agreements Are Created

When an investor clicks "Invest Now" and the backend creates the investment, it simultaneously creates a legally binding agreement via Leegality.

**Step 1: Agreement generation**

In `server/src/routes/investments.ts`, the backend calls `createAgreementFromTemplate()` from `server/src/services/leegality.ts`. This takes a pre-made agreement template (created once on Leegality's dashboard) and fills in dynamic fields:
- Investor name, email
- Business name
- Investment amount
- Expected return
- Royalty percentage, return multiple, duration

**Step 2: Both parties sign digitally**

Leegality sends signing links to both the investor and the business owner. Signing options:
- Aadhaar eSign (legally equivalent to a wet signature in India under IT Act 2000)
- Electronic signature (simpler, still legally valid)

The `Investment` record stores `agreementId` and `agreementSignedAt`.

**Step 3: Signed PDF stored**

When both parties sign, Leegality sends a webhook to `/api/webhooks/leegality`. The backend downloads the signed PDF and stores it as a `Document` record linked to both the investment and the listing. Both parties can access it anytime from their dashboard.

### What the Agreement Should Contain (draft with a lawyer)

- Parties: Investor, Business Owner, LocalStake (as facilitator)
- Investment amount and terms
- Royalty percentage and return multiple
- Monthly reporting obligation
- Default clauses (what happens if owner stops paying)
- Dispute resolution mechanism (arbitration clause)
- Governing law (Indian Contract Act)

This is a real, enforceable legal contract — not just a checkbox on a website.

---

## Default Protection — What If the Owner Doesn't Pay?

This is the biggest risk in the royalty model. Here's the multi-layered approach:

### Layer 1: Prevention (built into the platform)

- **Owner skin in the game:** Must contribute 25-30% of their own capital. If the business fails, they lose their money too.
- **KYC verification via Digio:** Platform knows exactly who the owner is — PAN, Aadhaar, bank account, GST number.
- **Admin verification:** Each business is manually verified before listing goes live.
- **Conservative projections:** Revenue estimates shown to investors are conservative, not best-case.
- **Risk disclosure:** Risk factors displayed prominently on every listing detail page.

### Layer 2: Detection (monitoring)

- Owner is required to submit monthly revenue reports via the Owner Payouts page
- If they stop submitting, the platform knows immediately (no report = red flag)
- Admin can see which listings have missing reports
- Automated reminder emails sent via Resend
- Investors see "Pending" status on their payout page

### Layer 3: Enforcement (legal)

If the owner stops paying despite having revenue:
- The signed Leegality agreement is a legally binding contract
- It includes specific clauses about monthly reporting obligations and payout timelines
- LocalStake (or the investor) can send a legal notice
- Arbitration clause means faster resolution than court
- Since we have the owner's PAN, Aadhaar, bank details, and GST — they can't disappear
- In extreme cases, the agreement can be enforced through civil court

### Layer 4: Structural protection (Phase 2+)

For larger deals, each deal is wrapped in a separate legal entity (LLP or SPV):
- Investors are actual partners/shareholders in that entity
- The business owner operates under a formal agreement with the entity
- This gives investors stronger legal standing than a simple contract
- An LLP can take legal action as an entity, not just individual investors

### Honest Gaps (not built yet)

- **No automated revenue verification:** Owner self-reports — they could underreport revenue. Phase 3 could integrate with POS systems or bank feeds to verify automatically.
- **No insurance/guarantee fund:** Some platforms create a reserve fund from platform fees to cover defaults — Phase 3/4 feature.
- **No credit scoring:** Phase 3 could add a risk rating system based on business financials, location, category performance data.

### MVP Reality

At MVP scale (2-3 businesses, 20-30 investors, all in one city), the trust model is primarily personal. You'll know the business owners. The legal agreement via Leegality gives a formal backstop, but the real protection is:
1. Small, known community
2. Owner's own money at stake (25-30%)
3. Verified identity (can't run)
4. Signed legal agreement (enforceable)
5. Platform transparency (everyone can see what's happening)

As you scale beyond personal networks (Phase 3+), you'll need automated verification, insurance fund, and SPV structures to maintain trust at scale.


---

## Automatic Monthly Payout Distribution

### Current System (Level 1 — Semi-Auto)

Owner submits monthly revenue on the Owner Payouts page → the `distributePayouts()` engine auto-calculates each investor's share, creates payout records, updates totals, checks if return multiple is reached, and sends email notifications. The calculation and distribution is fully automated — the owner just types in the revenue number.

### Fully Automatic System (Level 2 — No Owner Action)

A cron job (`server/src/services/cronJobs.ts`) runs on the 5th of every month and processes payouts for all funded listings automatically.

**How it works:**

```
5th of every month (cron trigger)
  │
  ▼
For each FUNDED listing:
  │
  ├── Has owner submitted revenue for last month?
  │     │
  │     ├── YES → Already distributed, skip
  │     │
  │     └── NO → Use estimated revenue (last known or expected)
  │               │
  │               ▼
  │           Calculate payout pool = revenue × royalty %
  │           Distribute to each active investor proportionally
  │           Send email notifications
  │           Notify owner: "Auto-payout processed, please verify"
  │
  └── No active investments? → Skip
```

### Three Options for Fully Automatic Collection

**Option A: RazorpayX eMandate (recommended)**

Set up a recurring payment mandate on the owner's bank account when their listing gets funded. Every month, Razorpay auto-debits the royalty amount from the owner's account without any action needed.

```
Listing funded → Create eMandate on owner's bank
  → 5th of month: Razorpay auto-debits royalty amount
  → Platform receives funds
  → distributePayouts() runs automatically
  → Each investor receives their share via RazorpayX
```

**Option B: NACH / UPI AutoPay**

Similar to eMandate but uses NACH (National Automated Clearing House) or UPI AutoPay. Owner authorizes a recurring debit during onboarding. More reliable for Indian bank accounts and works with all banks.

**Option C: Revenue Split at Source (most trustworthy)**

If the business uses Razorpay (or any payment gateway) for their customers, route their payment gateway through a Razorpay Route split. The royalty percentage goes directly to LocalStake before the owner gets their share. The owner never even touches the royalty portion.

```
Customer pays business via Razorpay
  → Razorpay Route auto-splits payment
  → 92% goes to owner's account
  → 8% (royalty) goes to LocalStake's account
  → End of month: LocalStake distributes the collected 8% to investors
```

This is the gold standard — zero trust required because the money is split before the owner receives it.

### Reminder System

If the owner hasn't submitted revenue by the 3rd of the month, the `sendPayoutReminders()` function sends:
- In-app notification on the Owner Dashboard
- Email reminder via Resend
- If still missing by the 5th, the cron job uses estimated revenue (last known month's data) and processes payouts anyway, notifying the owner to verify

### Implementation Status

| Feature | Status |
|---------|--------|
| Manual revenue submission + auto-distribution | ✅ Built |
| Cron job for monthly auto-processing | ✅ Built (`cronJobs.ts`) |
| Reminder notifications for overdue reports | ✅ Built |
| RazorpayX eMandate auto-debit | 🔲 Needs Razorpay activation |
| NACH/UPI AutoPay | 🔲 Phase 2 |
| Revenue split at source (Razorpay Route) | 🔲 Phase 3 |
| POS/bank feed integration for revenue verification | 🔲 Phase 3 |


---

## Hosting Recommendation ($5/month budget)

### Best Setup: Vercel (FE) + Railway (BE + DB)

| Service | What | Cost | Why |
|---------|------|------|-----|
| **Vercel** | Frontend (React) | Free | Already deployed. Auto-deploys on git push. Global CDN. Perfect for SPAs. |
| **Railway** | Backend (Express) + PostgreSQL | $5/month | No cold starts (unlike Render). Built-in PostgreSQL. Deploy from GitHub in 2 clicks. $5 free credit/month on Hobby plan. Includes cron jobs. |

**Why Railway over alternatives:**
- **Render free tier** — 30-60 second cold starts, spins down after 15 min inactivity. Unusable for a real product.
- **Fly.io** — Good but more complex setup (Docker required). Better for when you need multi-region.
- **DigitalOcean App Platform** — $5/mo but DB is separate ($15/mo minimum). Too expensive for MVP.
- **AWS** — Overkill for MVP. Save it for Phase 3 when you need auto-scaling.

**Railway $5/month gets you:**
- Always-on backend (no cold starts)
- 512MB RAM, 1 vCPU (plenty for MVP)
- Built-in PostgreSQL (no separate DB service needed)
- Auto-deploy from GitHub
- Cron job support
- Custom domains
- Environment variables management
- Logs and monitoring

### Alternative: Vercel (FE) + Neon (DB) + Fly.io (BE)

If Railway doesn't work out:
- Neon.tech — Free PostgreSQL (0.5GB storage, auto-suspend)
- Fly.io — Free tier with 3 shared VMs, no cold starts
- Total: $0 but more setup work

---

## Suggestions & Improvements — What I'd Do Next

### Immediate (Before First Real User)

**1. Add Razorpay Checkout Popup**
Currently the invest modal creates the investment record but doesn't open the actual Razorpay payment popup. This is ~20 lines of code — load Razorpay's checkout.js script, pass the order ID from the backend, handle success/failure callback.

**2. Build a KYC Page**
The backend KYC endpoints exist (PAN, Aadhaar, Bank verification via Digio) but there's no frontend page for it. Need a `/kyc` page with a stepper: PAN verification → Aadhaar OTP → Bank account. Block investing until KYC is complete.

**3. Route Protection**
Right now any user can access any page. Need middleware that:
- Redirects unauthenticated users to `/login`
- Redirects investors away from `/owner/*` routes
- Redirects non-admins away from `/admin`
- Shows "Complete KYC" prompt if user tries to invest without verified KYC

**4. Password Reset Flow**
No "Forgot Password" flow exists. Need:
- `/forgot-password` page → enter email → send reset link via Resend
- `/reset-password/:token` page → enter new password
- Backend endpoints for generating and verifying reset tokens

**5. File Uploads to S3**
Currently files save to local `uploads/` folder. Works on Railway but not scalable. Switch to AWS S3 or Cloudflare R2 (S3-compatible, cheaper). The multer config just needs to swap from `diskStorage` to `multerS3`.

### Flow Improvements

**6. Investor Onboarding Flow**
After signup, guide the investor through:
- Complete profile (city, investment budget, preferred categories)
- Complete KYC (PAN + Aadhaar)
- Browse first listing
Currently signup just dumps them on the dashboard with no guidance.

**7. Owner Onboarding Flow**
After owner signup:
- Register business (name, category, city, docs)
- Wait for admin verification
- Create first listing
Need a progress tracker showing where they are in the process.

**8. Email Notifications (Critical)**
The email templates are written but need the Resend API key to work. These emails are critical for trust:
- Investment confirmation ("You invested ₹2L in SmashZone Pickleball")
- Monthly payout received ("You received ₹7,200 for March 2026")
- Funding complete ("Your listing is fully funded!")
- KYC verified/rejected

**9. Real-time Updates**
Currently the dashboard shows data from the last page load. Add:
- WebSocket or polling for live payout notifications
- Toast notifications when a new payout arrives
- Badge count on the notification bell icon

**10. Investment Portfolio View**
The dashboard shows individual investments but no portfolio-level view:
- Total portfolio value over time (chart)
- Monthly income trend (chart)
- Diversification breakdown (pie chart by category)
- IRR (Internal Rate of Return) calculation

### Trust & Safety Improvements

**11. Business Verification Checklist**
Make the admin verification process structured:
- [ ] GST verified via Digio
- [ ] PAN verified
- [ ] Bank account verified
- [ ] Physical location verified (Google Maps + photos)
- [ ] Revenue documents reviewed
- [ ] Owner interview completed
Show this checklist status on the listing detail page.

**12. Revenue Verification**
Owner self-reporting revenue is the weakest link. Improvements:
- Integrate with owner's POS system (Razorpay POS, Pine Labs, etc.)
- Connect to owner's bank account via Account Aggregator (AA) framework
- Require monthly GST filing as proof of revenue
- Random audit system where admin verifies revenue against bank statements

**13. Investor Communication**
Add a messaging/update system:
- Owner posts monthly updates (not just revenue numbers — photos, milestones, challenges)
- Investors can ask questions (moderated Q&A)
- Admin can post platform-wide announcements
This builds community and trust beyond just numbers.

**14. Rating & Review System**
After an investment completes (return multiple achieved):
- Investor rates the experience (1-5 stars)
- Written review of the business
- This becomes social proof for future listings
- Businesses with good track records get featured

### Technical Improvements

**15. API Rate Limiting**
No rate limiting on API endpoints. Add `express-rate-limit`:
- Auth endpoints: 5 requests/minute (prevent brute force)
- General API: 100 requests/minute
- Webhook endpoints: no limit (Razorpay needs to reach you)

**16. Request Logging & Monitoring**
Add structured logging (Winston or Pino) and error tracking (Sentry). Currently errors just go to console.log. In production you need:
- Error alerts (Sentry → Slack notification)
- API response time monitoring
- Database query performance tracking

**17. Database Backups**
Railway and Neon both offer automated backups, but configure:
- Daily automated backups
- Point-in-time recovery enabled
- Test restore process before going live

**18. CORS & Security Headers**
Currently CORS allows only the frontend URL. Also add:
- Helmet.js (already included) — but verify CSP headers
- HTTPS only (Railway provides this)
- Secure cookie settings for production
- Input sanitization beyond Zod validation

**19. Pagination Everywhere**
Listings and admin endpoints have pagination. But payouts, investments, notifications don't paginate well for users with many records. Add cursor-based pagination for better performance at scale.

**20. Search & Filtering**
Current search is basic string matching. Improve with:
- Full-text search on listing titles and descriptions (PostgreSQL `tsvector`)
- Location-based search (PostGIS for geo queries)
- Saved search filters / alerts ("Notify me when a new gym listing appears in Bangalore")

### Business Model Improvements

**21. Platform Fee Structure**
The platform needs revenue. Add:
- Listing fee: ₹5,000-10,000 per listing (one-time, paid by owner)
- Success fee: 2-3% of total funded amount (deducted from escrow before release)
- Investor subscription: ₹499/month for premium features (early access, detailed analytics)
- These need new DB fields, payment flows, and admin configuration

**22. Referral System**
- Investor refers investor → both get ₹500 credit toward next investment
- Owner refers owner → listing fee waived
- Track referrals in a new `Referral` table
- Referral dashboard showing earnings

**23. Waitlist / Pre-Registration**
Before a listing goes live, allow investors to "express interest":
- Shows demand to the owner (social proof)
- Notifies interested investors when listing goes live
- Creates urgency ("12 people are waiting for this listing")

### Content & SEO

**24. Blog / Content Section**
- Investment education articles
- Business success stories
- Market insights for local business categories
- SEO-optimized pages for "invest in gym Bangalore", "pickleball court investment", etc.

**25. Landing Page Variants**
- Category-specific landing pages (`/invest/gyms`, `/invest/cafes`)
- City-specific landing pages (`/bangalore`, `/delhi`)
- These rank better in search and convert better than a generic landing page

---

## Priority Order (What to Do First)

1. **Deploy backend to Railway** — get the full stack live
2. **Get Razorpay test keys** — enable real payment flow
3. **Add Razorpay checkout popup** — complete the invest flow
4. **Build KYC page** — required before real investments
5. **Add route protection** — security basics
6. **Get Resend API key** — enable email notifications
7. **Onboard first business manually** — don't wait for perfect software
8. **Get first 5 investors from your network** — validate the concept
9. **First successful payout** — this is your proof of concept
10. Everything else can wait until you have traction


---

## Suggestions, Improvements & What's Needed Next

### Critical Necessities (Must-Have Before Going Live)

**1. Legal Entity Setup**
You need a registered company (Pvt Ltd or LLP) before collecting money from investors. LocalStake as a platform should be a technology intermediary — not a financial institution. Consult a startup lawyer to structure this correctly. Budget: ₹15-25K for incorporation + ₹20-30K for legal templates.

**2. Investment Agreement Template**
Get a lawyer to draft the royalty agreement template that Leegality will use. This is the most important legal document in the entire platform. It should cover:
- Exact royalty terms, payment schedule, return multiple
- Default clauses with specific remedies
- Dispute resolution (arbitration in your city)
- Force majeure (what if COVID-like situation)
- Platform's role and liability limitations
- Investor's acknowledgment of risk

**3. Compliance & Regulatory**
- LocalStake is NOT an AIF (Alternative Investment Fund) — don't position it as one
- Structure each deal as a revenue-sharing agreement, not a security
- Consider SEBI sandbox if you scale beyond ₹10Cr total
- GST registration for platform fees
- TDS obligations on payouts to investors (Section 194A or 194J)

**4. Insurance**
- Directors & Officers (D&O) insurance for founders
- Professional liability insurance for the platform
- Consider a small reserve fund (2-3% of platform fees) for investor protection

---

### Flow Improvements (Technical)

**1. Investor Onboarding Flow — Currently Weak**

Current: Signup → Dashboard. No KYC step in the flow.

Should be:
```
Signup → KYC Verification Page → Investment Preferences → Dashboard
         │
         ├── PAN verification (Digio)
         ├── Aadhaar eKYC (Digio)
         ├── Bank account verification (Digio)
         └── Risk acknowledgment checkbox
```
Need to build: A dedicated `/kyc` page with step-by-step verification. Block investing until KYC is VERIFIED.

**2. Owner Onboarding Flow — Currently Weak**

Current: Signup → Create Listing. No business verification step.

Should be:
```
Signup → Register Business → Upload Documents → Admin Reviews
         │                    │
         ├── Business name    ├── GST certificate
         ├── Category/city    ├── PAN card
         ├── Description      ├── Bank statements (3 months)
         └── Address          ├── Business photos
                              └── Expansion plan document
```
Need to build: A dedicated `/owner/onboarding` page with document upload. Business must be VERIFIED before owner can create listings.

**3. Investment Flow — Missing Razorpay Checkout**

Current: Click Invest → backend creates order → shows "success" (no actual payment).

Should be:
```
Click Invest → Backend creates Razorpay order
  → Frontend loads Razorpay checkout script
  → User completes payment in Razorpay popup
  → Razorpay returns payment ID + signature
  → Frontend calls /verify-payment
  → Backend verifies signature → confirms investment
```
Need to add: ~30 lines of Razorpay checkout integration in the ListingDetail invest modal. Requires Razorpay test key.

**4. Route Protection — Currently Missing**

Any user can access any page. Need:
- `/dashboard`, `/payouts` → only authenticated investors
- `/owner/*` → only authenticated owners
- `/admin` → only authenticated admins
- `/explore`, `/listing/:id` → public
- Redirect to `/login` if not authenticated

**5. Email Verification**

Current: Users can sign up with any email, no verification.

Should add: Email verification flow after signup. Send a verification link via Resend. Don't allow investing until email is verified.

**6. Password Reset**

Not built. Users who forget their password have no way to recover. Need:
- "Forgot password?" link on login page
- Send reset link via email
- Reset password page with token validation

---

### Product Improvements (UX)

**1. Listing Images**

Current: Emoji placeholders (🏸💪☕). Real listings need actual photos.

Improvement: Add image upload in Create Listing flow. Store in S3. Show carousel on listing detail page. First image as card thumbnail. This alone will 10x the trust factor.

**2. Google Maps Integration**

Add a map embed on the listing detail page showing the business location. Investors want to see that the business is real and near them. Use Google Maps Embed API (free).

**3. Investment Portfolio View**

Current dashboard shows a list. Better UX:
- Pie chart showing allocation by category
- Line chart showing cumulative returns over time
- Monthly payout trend chart
- Use a charting library like Recharts or Chart.js

**4. Notifications Bell**

Backend has notifications system built. Frontend needs:
- Bell icon in navbar with unread count badge
- Dropdown showing recent notifications
- Mark as read on click
- Link to relevant page

**5. Search & Discovery**

Current explore page has basic filters. Improvements:
- Full-text search across business name, description, city
- "Recommended for you" based on investor preferences (categories, budget)
- "Trending" listings (most investor interest)
- "Almost funded" listings (urgency)

**6. Social Proof**

Add to listing detail page:
- "X investors have invested in the last 7 days"
- Investor testimonials (after first successful payout)
- Business owner video introduction
- Google reviews / ratings of the business

**7. Mobile Responsiveness**

MUI handles basic responsiveness, but the app needs testing and optimization for mobile. Most Indian users will access via phone. Consider:
- Bottom navigation bar on mobile
- Swipeable listing cards
- Simplified invest flow for small screens
- PWA (Progressive Web App) support for "Add to Home Screen"

---

### Technical Debt & Improvements

**1. Error Handling**

Current: Basic try/catch. Needs:
- Global error boundary in React (catch rendering errors)
- Retry logic for failed API calls
- Offline detection and graceful degradation
- Better error messages (not just "Request failed")

**2. Loading States**

Current: Basic spinner. Needs:
- Skeleton loaders for cards and tables (MUI Skeleton component)
- Optimistic updates (show investment immediately, confirm in background)
- Pull-to-refresh on mobile

**3. Caching**

Current: Every page load fetches fresh data. Needs:
- React Query for data fetching with caching (already installed, not used)
- Stale-while-revalidate pattern
- Cache invalidation after mutations (invest, submit revenue)

**4. Rate Limiting**

Backend has no rate limiting. Needs:
- express-rate-limit on auth endpoints (prevent brute force)
- Rate limit on investment creation (prevent spam)
- CAPTCHA on signup/login (optional)

**5. Logging & Monitoring**

Current: console.log only. Production needs:
- Structured logging (Winston or Pino)
- Error tracking (Sentry)
- API monitoring (uptime, response times)
- Database query performance monitoring

**6. Testing**

No tests written. Priority:
- Payout engine unit tests (most critical business logic)
- Investment flow integration tests
- Auth flow tests
- Use Vitest for frontend, Jest for backend

**7. Security Hardening**

Current: Basic helmet + cors. Needs:
- CSRF protection
- Input sanitization (prevent XSS)
- SQL injection protection (Prisma handles this, but validate inputs)
- Secure cookie settings for production
- Content Security Policy headers
- API key rotation strategy

---

### Business Model Implementation (Not Built Yet)

The platform needs to make money. Revenue streams from the PRD:

**1. Listing Fee**
Charge business owners ₹5-10K to list on the platform. One-time fee. Add a payment step in the Create Listing flow.

**2. Success Fee**
Take 2-5% of the total amount raised when a listing is fully funded. Deduct from the escrow before releasing to owner. Add this to the `releaseEscrow()` function.

**3. Payout Processing Fee**
Take 1-2% of each monthly payout as a platform fee. Deduct before distributing to investors. Add this to the `distributePayouts()` function.

**4. Investor Subscription (Phase 2)**
Premium tier for investors: early access to listings, detailed analytics, priority support. ₹999/month or ₹9,999/year.

---

### Data & Analytics (Not Built Yet)

**For Investors:**
- Portfolio performance over time (chart)
- IRR (Internal Rate of Return) calculation
- Comparison with FD/mutual fund returns
- Tax report generation (for ITR filing)

**For Owners:**
- Funding velocity (how fast they're raising)
- Investor demographics
- Revenue trend analysis
- Payout schedule forecast

**For Admin:**
- Platform GMV (Gross Merchandise Value)
- Default rate tracking
- User acquisition funnel (signup → KYC → first investment)
- Cohort analysis (retention by signup month)
- Revenue dashboard (platform fees collected)

---

### Scaling Considerations (Phase 3+)

**Database:**
- Add read replicas for heavy query pages (Explore, Dashboard)
- Implement database connection pooling (PgBouncer)
- Archive old transactions and payouts to cold storage
- Add database indexes on frequently queried columns (already have some)

**API:**
- Add Redis for caching (listing data, user sessions)
- Implement API versioning (/api/v1/, /api/v2/)
- Add GraphQL layer for flexible frontend queries (optional)
- WebSocket for real-time funding progress updates

**Infrastructure:**
- Move from Railway to AWS (ECS/EKS) for production scale
- CDN for static assets (CloudFront)
- S3 for file storage with CloudFront distribution
- Separate worker service for background jobs (payouts, emails)
- Database backups (automated daily)

**Security at Scale:**
- WAF (Web Application Firewall)
- DDoS protection
- Penetration testing
- SOC 2 compliance (if targeting institutional investors)
- Data encryption at rest

---

### Immediate Next Steps (Priority Order)

1. **Deploy backend** to Railway + PostgreSQL
2. **Connect frontend** to backend (set VITE_API_URL on Vercel)
3. **Get Razorpay test keys** and add Razorpay checkout popup
4. **Build KYC page** in frontend
5. **Add route protection** (redirect unauthenticated users)
6. **Get Leegality API key** and create agreement template
7. **Get Resend API key** for email notifications
8. **Add real business images** to listings
9. **Manually onboard first business** in Bangalore/Delhi
10. **Find first 5-10 investors** from personal network
11. **Run first funded deal** end-to-end
12. **Build case study** from first success
13. **Iterate based on user feedback**


---

## AWS Deployment Guide — Backend + Database (Free Tier)

### Prerequisites
- AWS account with free tier active
- Your GitHub repo: `TheVivekGaur/LocalStake`
- Frontend already deployed on Vercel

### Architecture
```
Vercel (Frontend) → EC2 t2.micro (Backend) → RDS PostgreSQL (Database)
     FREE               FREE (12 months)         FREE (12 months)
```

---

### PART 1: Create RDS PostgreSQL Database

**1.1** Log into AWS Console → search "RDS" → click "Create database"

**1.2** Configure:
```
Choose a database creation method: Standard create
Engine type: PostgreSQL
Engine version: PostgreSQL 16.x (latest)
Templates: ✅ Free tier
```

**1.3** Settings:
```
DB instance identifier: localstake-db
Master username: postgres
Master password: [choose a strong password — SAVE THIS]
Confirm password: [same password]
```

**1.4** Instance configuration:
```
DB instance class: db.t3.micro (free tier eligible)
```

**1.5** Storage:
```
Storage type: General Purpose SSD (gp2)
Allocated storage: 20 GB
Enable storage autoscaling: ❌ uncheck (to stay in free tier)
```

**1.6** Connectivity:
```
Compute resource: Don't connect to an EC2 compute resource
Network type: IPv4
VPC: Default VPC
Public access: ✅ Yes (needed for initial setup — restrict later)
VPC security group: Create new
New VPC security group name: localstake-db-sg
Availability Zone: No preference
```

**1.7** Additional configuration:
```
Initial database name: localstake
Enable automated backups: ✅ Yes
Backup retention period: 7 days
Enable encryption: ✅ Yes
```

**1.8** Click "Create database" → wait 5-10 minutes for it to become "Available"

**1.9** Once ready, click on the database → copy the **Endpoint** under "Connectivity & security"
```
Example: localstake-db.cxxxxx.ap-south-1.rds.amazonaws.com
```

**1.10** Edit the security group to allow connections:
- Click on the VPC security group link
- Edit inbound rules → Add rule:
  - Type: PostgreSQL
  - Port: 5432
  - Source: Anywhere-IPv4 (0.0.0.0/0) — for setup only
- Save rules

**1.11** Your DATABASE_URL is now:
```
postgresql://postgres:YOUR_PASSWORD@localstake-db.cxxxxx.ap-south-1.rds.amazonaws.com:5432/localstake
```

---

### PART 2: Push Schema & Seed Data to RDS

Run these from your LOCAL machine (your Mac):

**2.1** Open terminal:
```bash
cd ~/Desktop/LocalStake/localstake/server
```

**2.2** Push the database schema:
```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/localstake" npx prisma db push
```

Expected output:
```
Your database is now in sync with your Prisma schema. Done in XXXms
```

**2.3** Seed demo data:
```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/localstake" npx tsx src/seed.ts
```

Expected output:
```
🌱 Seeding database...
✅ Seed complete!
   Admin: admin@localstake.in / password123
   Investor: rahul@example.com / password123
   Owner: vikram@example.com / password123
```

**2.4** Verify by connecting:
```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/localstake" npx prisma studio
```
This opens a web UI where you can see all your tables and data. Close it when done (Ctrl+C).

---

### PART 3: Launch EC2 Instance (Backend Server)

**3.1** Go to AWS Console → search "EC2" → click "Launch instance"

**3.2** Configure:
```
Name: localstake-api
```

**3.3** Application and OS Images:
```
Amazon Linux 2023 AMI (free tier eligible)
Architecture: 64-bit (x86)
```

**3.4** Instance type:
```
t2.micro (free tier eligible)
```

**3.5** Key pair:
```
Click "Create new key pair"
Key pair name: localstake-key
Key pair type: RSA
Private key file format: .pem
Click "Create key pair" → it downloads localstake-key.pem
⚠️ SAVE THIS FILE — you can never download it again
```

**3.6** Network settings → click "Edit":
```
Auto-assign public IP: Enable
```

**3.7** Security group → Create security group:
```
Security group name: localstake-api-sg

Add these inbound rules:
┌──────────┬──────────┬─────────────────┐
│ Type     │ Port     │ Source          │
├──────────┼──────────┼─────────────────┤
│ SSH      │ 22       │ My IP           │
│ HTTP     │ 80       │ Anywhere 0.0.0.0│
│ HTTPS    │ 443      │ Anywhere 0.0.0.0│
│ Custom   │ 4000     │ Anywhere 0.0.0.0│
└──────────┴──────────┴─────────────────┘
```

**3.8** Storage:
```
8 GB gp3 (free tier allows up to 30 GB)
```

**3.9** Click "Launch instance" → wait for it to start (1-2 min)

**3.10** Go to EC2 → Instances → click on your instance → copy the **Public IPv4 address**
```
Example: 13.234.xxx.xxx
```

---

### PART 4: Setup the Server (SSH + Install + Deploy)

**4.1** Fix key permissions and SSH in:
```bash
chmod 400 ~/Downloads/localstake-key.pem
ssh -i ~/Downloads/localstake-key.pem ec2-user@YOUR_EC2_IP
```

You should see: `[ec2-user@ip-xxx ~]$`

**4.2** Install Node.js 22:
```bash
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs
node --version  # should show v22.x.x
```

**4.3** Install Git:
```bash
sudo yum install -y git
```

**4.4** Clone your repo:
```bash
git clone https://github.com/TheVivekGaur/LocalStake.git
cd LocalStake/localstake/server
```

**4.5** Install dependencies:
```bash
npm install
npx prisma generate
```

**4.6** Create the .env file:
```bash
cat > .env << 'ENVEOF'
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/localstake"
JWT_SECRET="localstake-jwt-secret-change-this-to-random-string"
PORT=4000
NODE_ENV=production
FRONTEND_URL="https://YOUR_VERCEL_URL.vercel.app"
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
DIGIO_CLIENT_ID=""
DIGIO_CLIENT_SECRET=""
DIGIO_BASE_URL="https://api.digio.in"
LEEGALITY_API_KEY=""
LEEGALITY_BASE_URL="https://api.leegality.com"
RESEND_API_KEY=""
ENVEOF
```

⚠️ Replace:
- `YOUR_PASSWORD` with your RDS password
- `YOUR_RDS_ENDPOINT` with your RDS endpoint from Part 1
- `YOUR_VERCEL_URL` with your actual Vercel URL

**4.7** Test that the server starts:
```bash
npx tsx src/index.ts
```

You should see:
```
🚀 LocalStake API running on http://localhost:4000
📋 Environment: production
```

Press Ctrl+C to stop.

**4.8** Install PM2 (keeps server running forever):
```bash
sudo npm install -g pm2
```

**4.9** Start the server with PM2:
```bash
pm2 start "npx tsx src/index.ts" --name localstake-api
```

**4.10** Make PM2 auto-start on reboot:
```bash
pm2 save
pm2 startup
```
It will print a command starting with `sudo env PATH=...` — copy and run that command.

**4.11** Verify PM2 is running:
```bash
pm2 status
```
Should show `localstake-api` with status `online`.

---

### PART 5: Setup Nginx (Reverse Proxy)

**5.1** Install Nginx:
```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**5.2** Create Nginx config:
```bash
sudo tee /etc/nginx/conf.d/localstake.conf > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Max upload size for documents
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF
```

**5.3** Remove default config and restart:
```bash
sudo rm -f /etc/nginx/conf.d/default.conf
sudo nginx -t
sudo systemctl restart nginx
```

**5.4** Test from your browser:
```
http://YOUR_EC2_IP/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

---

### PART 6: Connect Frontend to Backend

**6.1** Go to Vercel → your LocalStake project → Settings → Environment Variables

**6.2** Add:
```
Key:   VITE_API_URL
Value: http://YOUR_EC2_IP/api
```

**6.3** Go to Deployments → click "..." on latest → "Redeploy"

**6.4** Wait for deploy → open your Vercel URL

**6.5** Test the full flow:
- Go to Login page
- Enter: `rahul@example.com` / `password123`
- Should log in and show the Dashboard with real data from RDS

---

### PART 7: Add SSL/HTTPS (Optional but Recommended)

For HTTPS you need a domain name. If you have one:

**7.1** Point your domain's A record to your EC2 IP:
```
api.localstake.in → YOUR_EC2_IP
```

**7.2** Install Certbot:
```bash
sudo yum install -y certbot python3-certbot-nginx
```

**7.3** Get SSL certificate:
```bash
sudo certbot --nginx -d api.localstake.in
```

**7.4** Auto-renew:
```bash
sudo crontab -e
# Add this line:
0 0 1 * * certbot renew --quiet
```

**7.5** Update Vercel env var:
```
VITE_API_URL = https://api.localstake.in/api
```

---

### PART 8: Security Hardening (Do After Everything Works)

**8.1** Restrict RDS access to only your EC2:
- Go to RDS → Security group → Edit inbound rules
- Change Source from `0.0.0.0/0` to your EC2's **private IP** or security group
- This means only your EC2 can talk to the database

**8.2** Restrict EC2 SSH access:
- Go to EC2 → Security group → Edit inbound rules
- Change SSH source from `My IP` to a specific IP or remove if using SSM

**8.3** Enable CloudWatch monitoring:
```bash
# On EC2:
sudo yum install -y amazon-cloudwatch-agent
```

---

### Useful Commands (SSH into EC2)

```bash
# SSH into server
ssh -i ~/Downloads/localstake-key.pem ec2-user@YOUR_EC2_IP

# View server logs
pm2 logs localstake-api

# Restart server
pm2 restart localstake-api

# Update code (after git push)
cd ~/LocalStake/localstake/server
git pull
npm install
npx prisma generate
pm2 restart localstake-api

# Check server status
pm2 status

# Check nginx status
sudo systemctl status nginx

# View nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

### Cost Summary (Free Tier — 12 months)

| Service | Free Tier Limit | Your Usage | Cost |
|---------|----------------|------------|------|
| EC2 t2.micro | 750 hrs/month | ~730 hrs (24/7) | $0 |
| RDS db.t3.micro | 750 hrs/month | ~730 hrs (24/7) | $0 |
| RDS Storage | 20 GB | ~1 GB | $0 |
| Data Transfer | 100 GB/month | ~1 GB | $0 |
| **Total** | | | **$0/month** |

After 12 months: EC2 ~$8/mo + RDS ~$13/mo = ~$21/month


---

## AWS Infrastructure — Beginner's Guide (What We Set Up & Why)

### What Is AWS?

Amazon Web Services (AWS) is Amazon's cloud computing platform. Instead of buying physical servers and putting them in your office, you rent virtual servers from Amazon's data centers. You pay only for what you use (or nothing on free tier for 12 months).

### What We Created on AWS

We created two things:

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Cloud (eu-north-1)                │
│                                                         │
│  ┌─────────────────┐      ┌──────────────────────┐     │
│  │   EC2 Instance   │      │   RDS PostgreSQL     │     │
│  │   (t2.micro)     │─────▶│   (db.t4g.micro)     │     │
│  │                  │      │                      │     │
│  │  Your backend    │      │  Your database       │     │
│  │  Express server  │      │  All tables & data   │     │
│  │  IP: 13.61.15.174│      │  localstake-db       │     │
│  └─────────────────┘      └──────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### EC2 — Elastic Compute Cloud (Your Server)

**What it is:** A virtual computer running in Amazon's data center. Think of it as a laptop that's always on, always connected to the internet, and you can access it remotely.

**What we chose:**
- Instance type: `t2.micro` — 1 CPU, 1 GB RAM (free tier)
- OS: Amazon Linux 2023 (like a lightweight Linux)
- Region: eu-north-1 (Stockholm) — where the server physically lives

**What's running on it:**
- Node.js 22 — JavaScript runtime
- Your Express backend server (the API)
- PM2 — process manager that keeps the server running 24/7, auto-restarts if it crashes
- Nginx — web server that sits in front of Express, handles incoming HTTP requests on port 80 and forwards them to your Express app on port 4000

**How to access it:**
```bash
ssh -i ~/Downloads/localstake-key.pem ec2-user@13.61.15.174
```
The `.pem` file is your private key — like a password file. Never share it. `ec2-user` is the default username on Amazon Linux.

**Key file:** `~/Downloads/localstake-key.pem` — this is the ONLY way to access your server. If you lose this file, you lose access to the server. Back it up somewhere safe.

### RDS — Relational Database Service (Your Database)

**What it is:** A managed PostgreSQL database. Amazon handles backups, updates, and keeps it running. You just store and query data.

**What we chose:**
- Engine: PostgreSQL 17
- Instance: `db.t4g.micro` — 2 CPUs, 1 GB RAM (free tier)
- Storage: 20 GB
- Region: eu-north-1 (same as EC2 for low latency)

**Connection details:**
- Endpoint: `localstake-db.cfssks8k2cb4.eu-north-1.rds.amazonaws.com`
- Port: 5432
- Username: `postgres`
- Password: `LocalStake2026Secure`
- Database: `postgres` (default)

**What's stored in it:**
All 10 tables from the Prisma schema — Users, Businesses, Listings, Investments, Payouts, RevenueReports, Transactions, Documents, Notifications. Plus the seeded demo data.

### Security Groups (Firewall Rules)

Security groups are like firewall rules that control who can connect to your EC2 and RDS.

**EC2 security group allows:**
- Port 22 (SSH) — so you can log in remotely
- Port 80 (HTTP) — so the internet can reach your API
- Port 443 (HTTPS) — for future SSL
- Port 4000 — direct access to Express (backup)

**RDS security group allows:**
- Port 5432 (PostgreSQL) — from anywhere (for setup; should restrict to EC2 only later)

### Nginx — The Reverse Proxy

**What it does:** Nginx sits between the internet and your Express server.

```
Internet → Port 80 (Nginx) → Port 4000 (Express)
```

**Why not just use Express directly on port 80?**
- Nginx handles SSL/HTTPS (when you add a domain)
- Nginx can serve static files faster
- Nginx can handle thousands of connections efficiently
- Nginx can load-balance across multiple Express instances (when you scale)
- Running Node.js on port 80 requires root privileges (security risk)

### PM2 — Process Manager

**What it does:** Keeps your Express server running forever.

Without PM2: if your server crashes or the EC2 reboots, the API goes down and stays down.
With PM2: it auto-restarts the server on crash, auto-starts on EC2 reboot, and gives you logs.

**Useful PM2 commands (run after SSH-ing into EC2):**
```bash
pm2 status              # See if server is running
pm2 logs localstake-api # View live logs
pm2 restart localstake-api  # Restart server
pm2 stop localstake-api     # Stop server
```

### How to Update the Server (After Code Changes)

When you push new code to GitHub:
```bash
# SSH into EC2
ssh -i ~/Downloads/localstake-key.pem ec2-user@13.61.15.174

# Pull latest code
cd ~/LocalStake/server
git pull

# Install any new dependencies
npm install
npx prisma generate

# If you changed the database schema:
DATABASE_URL="postgresql://postgres:LocalStake2026Secure@localstake-db.cfssks8k2cb4.eu-north-1.rds.amazonaws.com:5432/postgres" npx prisma db push

# Restart the server
pm2 restart localstake-api
```

---

## Complete Deployment Summary — What's Where

### Frontend (Vercel)
- URL: Your Vercel URL (e.g. `https://local-stake-three.vercel.app`)
- What: React app with MUI, all 12 pages
- Deploys: Automatically when you push to GitHub
- Cost: Free

### Backend (AWS EC2)
- URL: `http://13.61.15.174/api`
- What: Express API server with 40+ endpoints
- IP: `13.61.15.174`
- Access: SSH with `localstake-key.pem`
- Process: Managed by PM2
- Proxy: Nginx on port 80 → Express on port 4000
- Cost: Free (12 months)

### Database (AWS RDS)
- Endpoint: `localstake-db.cfssks8k2cb4.eu-north-1.rds.amazonaws.com`
- What: PostgreSQL with 10 tables, seeded demo data
- Port: 5432
- Cost: Free (12 months)

### Code Repository (GitHub)
- URL: `https://github.com/TheVivekGaur/LocalStake`
- Visibility: Public (changed from private for EC2 cloning)
- Branch: `main`

### How They Connect

```
User opens browser
  → Vercel serves the React frontend
  → User clicks "Login" or "Explore"
  → Frontend makes API call to http://13.61.15.174/api/...
  → Nginx on EC2 receives the request on port 80
  → Nginx forwards to Express on port 4000
  → Express processes the request
  → Prisma queries the RDS PostgreSQL database
  → Response flows back: RDS → Express → Nginx → Frontend → User
```

### Important Files & Credentials

| Item | Location |
|------|----------|
| SSH Key | `~/Downloads/localstake-key.pem` |
| EC2 IP | `13.61.15.174` |
| RDS Endpoint | `localstake-db.cfssks8k2cb4.eu-north-1.rds.amazonaws.com` |
| RDS Password | `LocalStake2026Secure` |
| Server code on EC2 | `/home/ec2-user/LocalStake/server/` |
| Server .env on EC2 | `/home/ec2-user/LocalStake/server/.env` |
| PM2 logs | `pm2 logs localstake-api` |
| Nginx config | `/etc/nginx/conf.d/localstake.conf` |

### Free Tier Limits (12 months from account creation)

| Service | Free Limit | What Happens After |
|---------|-----------|-------------------|
| EC2 t2.micro | 750 hours/month | ~$8/month |
| RDS db.t4g.micro | 750 hours/month | ~$13/month |
| RDS Storage | 20 GB | $0.115/GB/month |
| Data Transfer | 100 GB/month out | $0.09/GB |
| S3 (if added) | 5 GB | $0.023/GB/month |
