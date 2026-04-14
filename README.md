# InjuryFlow

> A gamified, Gen-Z friendly law firm operations platform for personal injury firms

InjuryFlow streamlines case management, client communication, medical coordination, and team collaboration for personal injury law practices. Built with modern web technologies and gamification principles to boost team engagement and productivity.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Row-Level Security (RLS)
- **Animation**: Framer Motion
- **Charts & Data**: Recharts
- **State Management**: Zustand
- **UI Components**: Lucide Icons
- **Date Handling**: date-fns
- **Deployment**: Vercel

## Features

### Core Case Management
- **Case Intake**: Streamlined new case creation with comprehensive injury details
- **Case Tracking**: Multi-stage case progression (New → TRT → Liability → Property Damage → DEM → SRL)
- **Client Management**: Track client info, contact details, DOB, insurance, medical status
- **Medical Coordination**: Assign medical managers, track treatment status, manage LORs
- **Insurance Integration**: Track UM/BI policies, manage BI/UM LOR status, monitor policy limits

### Intelligent Case Assignment
- Smart case routing to case managers and medical managers
- Role-based access control with Row-Level Security
- Workload distribution and case monitoring

### Client Communication Hub
- **Call Logging**: Record and track client interactions
- **Case Notes**: Detailed notes with type categorization (notes, call logs, treatment logs, stage changes)
- **Treatment Tracking**: Monitor ongoing medical treatment and recovery progress
- **Notifications**: Real-time alerts for case updates, deadlines, and team activity

### Team Collaboration & Gamification
- **Checklist System**: Task management with category organization and due dates
- **Team Posts**: Share announcements, celebrations, and shoutouts
- **Reaction System**: React to posts with emojis for quick team engagement
- **Badge System**: Earn achievements for milestones (First Case, Speed Demon, Settlement Master, etc.)
- **XP Points & Leveling**: Accumulate experience points for case progress
- **Leaderboard**: Team performance tracking and recognition

### Dashboards & Analytics
- Real-time case status overview
- Team performance metrics
- Case stage distribution
- Treatment completion rates
- Settlement tracking

### Security & Compliance
- Supabase PostgreSQL with Row-Level Security (RLS)
- Role-based access control (Admin, Case Manager, Intake Agent, Medical Manager)
- Encrypted data at rest
- HIPAA-ready architecture

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free at supabase.com)
- Twilio account (optional, for SMS features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/injuryflow.git
   cd injuryflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase and Twilio credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## Supabase Setup

### 1. Create a Supabase Project
- Visit [supabase.com](https://supabase.com)
- Click "New Project"
- Enter your project details
- Wait for the database to initialize
- Copy your project URL and API keys to `.env.local`

### 2. Initialize Database Schema
- In Supabase Dashboard, go to SQL Editor
- Create a new query
- Copy and paste contents of `supabase/schema.sql`
- Run the query
- This creates all tables, enums, indexes, and RLS policies

### 3. Seed Sample Data
- In Supabase Dashboard SQL Editor, create a new query
- Copy and paste contents of `supabase/seed.sql`
- Run the query
- Sample users, cases, notes, and badges will be populated

### 4. Verify Setup
- Go to Table Editor
- You should see: `users`, `cases`, `case_notes`, `checklist_items`, `badges`, `user_badges`, `team_posts`, `notifications`
- Data should be populated from seed script

## Deployment to Vercel

### 1. Push to GitHub
```bash
git remote add origin https://github.com/yourusername/injuryflow.git
git push -u origin main
```

### 2. Deploy via Vercel CLI
```bash
npm i -g vercel
vercel
```
Or visit [vercel.com/new](https://vercel.com/new) and select your GitHub repo.

### 3. Configure Environment Variables in Vercel
- In Vercel Dashboard, go to Project Settings > Environment Variables
- Add all variables from `.env.example`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL)
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`

### 4. Deploy
- Your app will automatically deploy on every push to `main`
- Monitor deployments in Vercel Dashboard

## Project Structure

```
injuryflow/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities and helpers
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand state management
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── supabase/
│   ├── schema.sql        # Database schema and RLS policies
│   └── seed.sql          # Sample data
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── README.md             # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL for redirects | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | No |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | No |
| `TWILIO_PHONE_NUMBER` | Twilio phone number for SMS | No |

## Screenshots

Screenshots will be added here once the app is live.

- Dashboard Overview
- Case Management Interface
- Team Collaboration Hub
- Gamification & Leaderboard
- Admin Analytics

## Database Schema Overview

### Users
Stores team members with roles (Admin, Case Manager, Intake Agent, Medical Manager) and gamification data (XP, level, badges).

### Cases
Complete case records with client info, accident details, insurance policies, assignment, and status tracking across case stages.

### Case Notes
Time-stamped notes, call logs, treatment logs, and stage change records for each case.

### Checklist Items
Task management system for case managers with categories and completion tracking.

### Badges & User Badges
Achievement system with XP rewards for milestones.

### Team Posts
Internal communication platform with reactions for announcements, celebrations, and shoutouts.

### Notifications
Real-time alerts for assignments, reminders, and achievements.

## API Routes

All data is accessed through Supabase directly with client-side authentication. Key operations:
- Get cases assigned to current user
- Create/update case with validation
- Add notes and checklist items
- Track badge achievements
- Post team updates
- Mark notifications as read

## Security

InjuryFlow implements security best practices:
- **Row-Level Security (RLS)** ensures users only access their authorized data
- **Role-based policies** restrict actions by user role
- **Encrypted credentials** stored in environment variables
- **No secrets in code** - all sensitive data in `.env.local`
- **HTTPS only** in production

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and feature requests, please open a GitHub Issue.

---

Built with passion for personal injury law firms. Let's make case management fun and efficient!

---

## Deploy Setup (canonical)

### Required environment variables

Set these in `.env.local` for local dev and in Vercel → Settings → Environment Variables (Production + Preview + Development):

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server Supabase clients, middleware |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server Supabase clients, middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only admin client (`src/lib/supabase/admin.ts`) — never ship to browser |

### Supabase setup

Using the Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push            # runs everything in supabase/migrations/ in order
```

Or paste each migration into the SQL editor in order:

1. `supabase/migrations/20260101000000_initial_schema.sql` — tables, enums, indexes, baseline RLS.
2. `supabase/migrations/20260413000000_rls_policies.sql` — per-role RLS (self / case_manager / admin), service-role helper, `cases_case_number_seq` with `IF-######` default.
3. `supabase/migrations/20260413100000_handle_new_user.sql` — `auth.users` → `public.users` trigger that auto-provisions a profile row on signup (defaults to `intake_agent`, honors `raw_user_meta_data.role` and `full_name`).

Sample data (optional): `supabase/seed.sql`.

### Supabase Auth URL settings

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: your deployed origin (e.g., `https://injuryflow.vercel.app`) or `http://localhost:3000` for local.
- **Redirect URLs**: add both the Vercel production URL and `http://localhost:3000` for local development.

### First admin user

This app does **not** expose public signup. New users are provisioned one of two ways:

**A. Admin dashboard.** Any existing admin can create users at `/admin` (uses the service-role key server-side via `createAdminClient`).

**B. Bootstrap the first admin.** Since `/admin` itself requires an admin, seed one:

```sql
-- In Supabase SQL editor, after running all migrations:
-- 1. Create the auth user via Dashboard → Auth → Add user (email + password).
-- 2. Promote it to admin:
update public.users
set role = 'admin', full_name = 'Your Name'
where email = 'you@example.com';
```

The `handle_new_user` trigger already inserts the `public.users` row on auth signup, so you only need the `update` — no manual insert.

### Local development

```bash
npm install
cp .env.example .env.local     # fill in your Supabase project values
npm run dev                    # http://localhost:3000
```

### Vercel deploy

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Add the three env vars above to **Production**, **Preview**, and **Development** scopes.
3. Deploy. The root `middleware.ts` refreshes the Supabase session cookie on every request and redirects unauthenticated traffic to `/login`.
4. Every push to `main` triggers a new production deploy.

### Auth flow summary

- Login: `/login` → `supabase.auth.signInWithPassword`, redirects to `next` param or `/dashboard`.
- Session: refreshed per-request by `middleware.ts`; server components read via `src/lib/supabase/server.ts` (`await cookies()` → `createServerClient`).
- Logout: `POST`/`GET /api/auth/logout`, or the **Sign out** button on `/settings`.

### Intake flow summary

`/intake` fires the `createCase` server action (`src/app/(dashboard)/intake/actions.ts`):

1. Inserts into `public.cases` with flags (`is_minor`, `has_insurance_warning`) computed server-side.
2. DB returns the auto-generated `case_number` (`IF-NNNNNN` from `cases_case_number_seq`).
3. Case manager with fewest non-`srl` cases is auto-assigned.

### Case management

- `/cases` lists cases visible to the current user (RLS-enforced).
- `/cases/[id]` wires **Add note**, **Change stage** (inserts a `stage_change` note automatically), and **Toggle urgent** via server actions.
- `/team` posts, reactions, and deletions hit `team_posts` via server actions.
- `/leaderboard` ranks `public.users` by `xp_points`.
- `/admin` creates/promotes/deactivates users via the service-role admin client.
- `/settings` updates profile (`public.users`), changes password (`auth.updateUser`), or signs out.

