# Loan Picks Dashboard

AI-powered loan product discovery and comparison built with Next.js, TypeScript, shadcn/ui, Supabase, and OpenAI. Currency display is formatted in INR for all product amounts.

## Overview
- Personalized dashboard with top loan matches and “Best Match” highlight.
- Full products catalog with advanced filtering (category, amount, rate, pre-approval, search).
- Product-specific AI chat with grounding and fail-safes.
- Smart badge system (3–5 badges per product) driven by product attributes.
- Production-ready setup: Vercel config, Zod validation, TypeScript strict, linting.

## Tech Stack
- Next.js App Router, React 19, TypeScript.
- UI: shadcn/ui (Radix) + Tailwind CSS v4.
- Backend: Next.js API routes with Zod validation.
- Data: Supabase (PostgreSQL) + mock data for local.
- AI: OpenAI GPT-4o-mini with grounding.

## Architecture (high level)
- Next.js App Router with server API routes under `src/app/api`.
- Feature pages: dashboard (`src/app/page.tsx`) and products (`src/app/products/page.tsx`).
- UI layer: shadcn/ui primitives + custom components (`src/components`).
- Business logic: validation, badge logic, AI grounding, utilities (`src/lib`).
- Data: Supabase client + mock data; schema in `supabase/schema.sql`.

```text
┌─────────────────────┐
│      Client UI      │
│  • Dashboard (/)    │
│  • Products page    │
│    - Filters/cards  │
│    - AI chat dialog │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│  Next.js API Routes │
│  • /api/products    │
│  • /api/recommend   │
│  • /api/chat        │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│  Business Logic     │
│  • schemas (Zod)    │
│  • badge-logic      │
│  • ai-grounding     │
│  • utils (INR fmt)  │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│    Data Sources     │
│  • Supabase/Postgres│
│  • Mock data        │
│  • OpenAI (chat)    │
└─────────────────────┘
```

## Request Flow (diagram)
```text
┌─────────────────────┐
│ User action         │
│ (view/filter/chat)  │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│ Client UI fetches   │
│ /api/*              │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│ Next.js API routes  │
│ • products          │
│ • recommendations   │
│ • chat              │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│ Business logic      │
│ • schemas (Zod)     │
│ • badge-logic       │
│ • ai-grounding      │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│ Data sources        │
│ • Supabase/Postgres │
│ • Mock data (local) │
│ • OpenAI (chat)     │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│ Response to UI      │
└─────────────────────┘
```

## AI Grounding (chat)
- System prompt forces product-only answers; no inventing data.
- Scope guard: out-of-scope keywords like “compare with/other lender” trigger a polite fail-safe.
- Context: full product context + last 6 messages sent on every request.
- Response guard: falls back to product summary if AI/KEY is unavailable or response lacks product context.
- Offline fallback: if the chat API errors, UI shows product details from local data.

## Folder Structure
- `src/app/` – Routes and layouts (`page.tsx`, `products/page.tsx`, API routes under `api/`).
- `src/components/` – UI primitives and feature components (`ai-chat`, `loan-card`, `product-filters`).
- `src/lib/` – Types, schemas, utils (INR currency formatting), badge logic, AI grounding, Supabase client, mock data.
- `supabase/` – `schema.sql` with tables, indexes, and RLS policies.
- `vercel.json`, `next.config.ts`, `.env.example` – Deployment and config.

## API Contracts
### GET `/api/products`
- Filters: `category`, `minAmount`, `maxAmount`, `minTermMonths`, `maxTermMonths`, `minInterestRate`, `maxInterestRate`, `isPreApproved`, `searchQuery`.
- Returns filtered products or `400` on invalid params.

### POST `/api/recommendations`
- Body: `userId` (required) plus optional `creditScore`, `income`, `loanAmount`, `preferredTermMonths`, `loanPurpose`.
- Returns top 5 products sorted by calculated eligibility score; falls back to defaults on validation issues.

### POST `/api/chat`
- Body: `message` (required), `productId` (required), `history` (optional).
- Grounded to the selected product; out-of-scope questions return a fail-safe.

## Badge Logic (auto-generated)
| Badge | Variant | Priority | Condition |
|-------|---------|----------|-----------|
| Pre-Approved | success | 1 | `isPreApproved === true` |
| Low Rate | success | 2 | `interestRate < 5%` |
| Competitive Rate | default | 3 | `5% <= interestRate < 8%` |
| Fast Approval | success | 2 | Processing includes “24 hours”/“Same day” |
| Quick Processing | default | 4 | Processing includes “48 hours”/“2 days” |
| High Match | success | 2 | `eligibilityScore >= 85` |
| Good Match | default | 5 | `70 <= eligibilityScore < 85` |
| Flexible Terms | default | 4 | Term span ≥ 60 months |
| High Limit | default | 5 | `maxAmount >= 500000` |
| No Credit Check | secondary | 3 | `creditScoreMin === null` |
| Low Minimum | default | 6 | `minAmount <= 1000` |
| High LTV | default | 4 | `category === "home" && maxLtv >= 90` |
| Available (fallback) | outline | 10 | Always present if <3 badges |

## AI Grounding (chat)
- System prompt enforces product-only answers; no inventing data.
- Out-of-scope detection: keywords like “compare with”, “other lender”, etc.; returns a polite fail-safe.
- Context: last 6 messages + full product context per call.
- Response guard: falls back to product summary if AI/KEY unavailable or response lacks product context.

## Data Model (key fields)
- LoanProduct: `id`, `name`, `description`, `interestRate`, `minAmount`, `maxAmount`, `minTermMonths`, `maxTermMonths`, `eligibilityScore`, `category`, `features[]`, `requirements[]`, `isPreApproved`, `processingTime`, optional `maxLtv`, `creditScoreMin`, `incomeMin`, timestamps.
- ChatMessage: `id`, `role`, `content`, `productId`, `timestamp`.

## Setup
1) Install: `npm install --legacy-peer-deps`  
2) Env: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY` (optional; chat falls back to product summary).  
3) Database (optional): run `supabase/schema.sql` in Supabase/Postgres.  
4) Develop: `npm run dev` → http://localhost:3000  
5) Lint/Build: `npm run lint` | `npm run build`

## Deployment (Vercel)
- Import repo, add env vars, deploy.  
- `vercel.json` sets build/install commands and env mapping.  
- Turbopack root pinned in `next.config.ts` to avoid parent lockfile issues.

## Notes
- Currency formatting uses INR across UI and chat fallbacks.
- Mock data included for local development; Supabase client warns if creds are missing. 
"# The-Loan-Picks-Dashboard-" 
