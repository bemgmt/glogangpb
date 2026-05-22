# Project Handoff: Glo Gang Worldwide Community Portal

## Background

We are building a new web application for **Glo Gang Worldwide** — a music label/brand founded by Chief Keef. The goal is to create a **fan community & member portal** modeled after an existing codebase: the **Monterey Park Chamber of Commerce website** (`chambersite`).

The chambersite is a fully custom Next.js application — not a website builder — that we built from scratch. It serves as the technical blueprint for this new project.

---

## Reference Codebase: Monterey Park Chamber Site

**GitHub Repo:** `bemgmt/chambersite`
**Local Path:** `e:\Projects\MP Chamber\chambersite`
**Deployed at:** `https://www.montereyparkchamber.org`

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety throughout |
| Styling | TailwindCSS v4 + shadcn/ui + Radix UI | Component library & design system |
| CMS | Sanity v5 | Content management (businesses, events, news) |
| Database / Auth | Supabase (PostgreSQL + Auth) | User accounts, memberships, RLS |
| AI / Search | OpenAI Embeddings + pgvector | Semantic search over directory |
| Email | Resend | Transactional & bulk emails |
| Payments | Zeffy (webhook) | Membership dues & event payments |
| Hosting | Vercel | Serverless deployment |
| Analytics | Vercel Analytics + Google Search Console API | Traffic & SEO |
| Image Gen | OpenAI DALL-E (via AI SDK) | Admin image generation tool |

### Key Dependencies (package.json)
```json
"next": "^16.1.6",
"react": "19.2.4",
"typescript": "5.7.3",
"@sanity/client": "^7.3.0",
"@supabase/supabase-js": "^2.98.0",
"@supabase/ssr": "^0.9.0",
"tailwindcss": "^4.2.0",
"resend": "^4.0.0",
"openai": "^6.29.0",
"ai": "^4.0.0",
"lucide-react": "^0.564.0",
"zod": "^3.24.1",
"react-hook-form": "^7.54.1"
```

---

## Chambersite Architecture

### Route Groups (4 separate "portals" in one codebase)

```
app/
├── (public)/        # Public website — no login required
├── (auth)/          # Login, Register, Forgot Password
├── (member)/member/ # Member portal — requires Supabase session
├── (admin)/admin/   # Admin dashboard — requires role = 'admin'
└── api/             # Serverless API route handlers
```

### Public Pages
- `/` — Homepage
- `/directory` — AI-powered searchable business directory
- `/businesses/[slug]` — Individual business profiles
- `/events` — Events listing
- `/news` — News/blog
- `/membership` — Membership info & application
- `/about`, `/history`, `/contact` — Info pages
- `/certificate-of-origin` — Service portal
- `/pageant` — Pageant info
- `/scan-card` — Business card scanner

### Member Portal Routes
- `/member/dashboard` — Welcome dashboard
- `/member/profile` — Edit profile
- `/member/my-business` — Claim & manage a business listing
- `/member/events` — Browse & RSVP
- `/member/dues` — Membership tier & payments
- `/member/messages` — Member-to-member messaging
- `/member/requests` — Submit support requests
- `/member/referrals` — Referral tracking

### Admin Dashboard Routes
- `/admin` — Stats overview
- `/admin/members` — Manage all users
- `/admin/members/[id]` — Individual member editor
- `/admin/applications` — Review membership applications
- `/admin/directory` — Business directory management
- `/admin/events` — Create & manage events
- `/admin/news` — Create & manage posts
- `/admin/analytics` — Analytics dashboard
- `/admin/image-generator` — AI image generation
- `/admin/requests` — Member support queue
- `/admin/card-leads` — Business card scan leads
- `/admin/claims` — Business claim requests

---

## Database (Supabase)

Migrations are in `supabase/migrations/` (19 migrations total), run via `node scripts/run-migrations.mjs`.

### Key Tables

| Table | Description |
|---|---|
| `profiles` | All registered users. Synced from `auth.users` via DB trigger. Stores `membership_status`, `membership_tier`, `industry`, `organization`, `phone`, `role`. |
| `membership_applications` | Applications with `status` (pending/approved/rejected), `business_name`, `email`, `contact_number`, `membership_tier` |
| `member_requests` | Support requests from members |
| `event_rsvps` | Links `user_id` to Sanity event ID |
| `business_claims` | Members claiming ownership of a Sanity listing |
| `business_card_leads` | Leads from card scanner |
| `card_referrals` | Referral tracking |
| `business_messages` + `message_threads` | Member-to-member messaging |
| `thread_read_status` | Read receipts for message threads |
| `content_embeddings` | OpenAI vector embeddings (pgvector) for AI search |
| `search_logs` | All AI search queries |
| `contact_submissions` | Contact form submissions |
| `pageant_applications` | Pageant applicant data |

### Key Database Triggers
1. `on_auth_user_created` — Auto-creates a `profiles` row on signup
2. `on_profile_created_link_membership` — Links new profile to matching pending application
3. `on_profile_before_insert_auto_approve` — Auto-activates accounts for pre-registered members (matches against `membership_applications` where `status = 'approved'`)

### Row Level Security
All tables are protected by Supabase RLS. Users can only access their own records. Admins have elevated access. Defined in `002_rls_policies.sql`.

---

## CMS (Sanity)

Embedded Sanity Studio at `/studio`. Schemas in `sanity/schemaTypes/`.

### Schema Types
| Schema | Description |
|---|---|
| `business` | Directory listings — has `isMember`, `membershipTier`, address, phone, email, category, AI embedding |
| `event` | Public events with title, date, image, description |
| `newsPost` | News articles with rich text (Portable Text) |
| `boardMember` | Board of Directors profiles |
| `membershipTier` | Tier definitions |
| `membershipBenefit` | Benefits shown on membership page |
| `pageContent` | Generic editable content blocks for static pages |
| `chatbotContext` | Context documents for AI chatbot |
| `generatedImage` | AI-generated images from admin tool |

---

## AI Semantic Search Pipeline
1. Each `business` Sanity document → converted to a text blob
2. Embedded via OpenAI `text-embedding-3-small`
3. Stored in `content_embeddings` (Supabase, pgvector)
4. User search query → embedded → cosine similarity vector search
5. Results returned, optionally re-ranked
6. Synced via `scripts/sync-embeddings.mjs`

---

## Authentication Flow
1. User registers at `/register` (email + password)
2. Supabase sends a confirmation email with magic link
3. User clicks link → `/auth/callback` → `profiles` row auto-created
4. If email matches a pre-approved `membership_applications` row → profile auto-upgraded to `active`
5. `middleware.ts` guards all `/member` and `/admin` routes using Supabase session cookie

---

## Key API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/search` | POST | AI semantic search |
| `/api/contact` | POST | Contact form + Resend email |
| `/api/membership-apply` | POST | Submit membership application |
| `/api/applications/[id]` | PATCH | Approve/reject application (admin) |
| `/api/members/[id]` | GET/PATCH | Member profile |
| `/api/business-messages` | POST | Send message |
| `/api/save-card-lead` | POST | Card scanner lead capture |
| `/api/seo/performance` | GET | Google Search Console data |
| `/api/webhooks/zeffy` | POST | Payment webhook |
| `/api/generate-image` | POST | AI image generation |

---

## Scripts (Node.js one-off utilities)

| Script | Purpose |
|---|---|
| `enrich-members.mjs` | Fuzzy-match a membership CSV into Sanity |
| `seed-approved-applications.mjs` | Pre-register CSV members in Supabase |
| `send-member-invitations.mjs` | Bulk Resend invite emails (--test / --live flags) |
| `sync-embeddings.mjs` | Regenerate all AI search embeddings |
| `import-businesses.mjs` | Bulk import businesses into Sanity |
| `run-migrations.mjs` | Apply all SQL migrations |
| `create-admin.mjs` | Promote a user to admin role |

---

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_PASSWORD=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=

# OpenAI
OPENAI_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_SITE_URL=
```

---

## About Glo Gang Worldwide

**Website:** https://glogangworldwide.com  
**What it is:** Official Shopify merch store for Glo Gang, the music label/collective founded by rapper Chief Keef. Sells apparel (hoodies, tees, etc.) via standard Shopify e-commerce.

**What the current site does NOT have:**
- Fan/member accounts or a community portal
- Events, news, or blog content
- A directory of affiliated artists, collaborators, or vendors
- Admin dashboard or back-office tooling
- Membership tiers or exclusive content gating
- AI-powered search

**Recommendation:** Keep the existing Shopify store for e-commerce. Build the new site as a **separate fan community & member portal** that links back to the Shopify store for merch purchases.

---

## New Project Goals: Glo Gang Community Portal

Build a new Next.js application using the chambersite as a template, adapted for a music label/fan community context.

### Features to Replicate (Adapted)
| Chambersite Feature | Glo Gang Equivalent |
|---|---|
| Business Directory | Artist / Affiliate Directory |
| Member Portal | Fan / VIP Member Portal |
| Membership Tiers | Fan tiers (e.g., Free, Glo Fan, GloGang VIP) |
| Events & RSVPs | Shows, drop events, listening parties |
| News/Blog | Label news, release announcements |
| Admin Dashboard | Label management back-office |
| AI Search | Search artists, releases, events |
| Messaging | Fan-to-fan or fan-to-artist messaging |
| Image Generator | Promo image creation for admins |

### Features to Remove or Swap
- Certificate of Origin → not needed
- Business card scanner → could adapt for artist/collab outreach
- Pageant portal → not needed
- Zeffy payments → swap for **Stripe** (more appropriate for a music/retail brand)
- Chamber-specific branding & copy → replace entirely

### Design Direction
The current chambersite uses a clean, professional civic aesthetic. The Glo Gang portal should feel:
- **Dark mode first** — deep blacks, dark grays
- **Bold and energetic** — Chief Keef's brand is raw, urban streetwear-adjacent
- **High-contrast accent colors** — blues, reds, or neons consistent with Glo Gang's existing visual identity (the flame/star logo palette)
- **Heavy typography** — thick display fonts, uppercase headers
- **Animated** — subtle micro-interactions, glowing effects, entrance animations

---

## How to Start

1. **Set up services:** Create new Supabase project, Sanity project, Vercel project, Resend account
2. **Clone or fork the chambersite repo** as a starting point
3. **Strip out Chamber-specific content:** pageant portal, certificate of origin, city-life/discover pages
4. **Rename/adapt schemas:** Replace `business` schema with `artist` or `affiliate`; adapt `event` and `newsPost`
5. **Restyle the public site:** New color scheme, logo, fonts, and homepage design
6. **Run migrations** on the new Supabase project (`node scripts/run-migrations.mjs`)
7. **Set environment variables** on Vercel
8. **Seed initial data** — import any known artists/affiliates into Sanity

---

*This document was generated from the Monterey Park Chamber of Commerce project on 2026-05-22.*
