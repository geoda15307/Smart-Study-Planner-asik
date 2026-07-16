# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # next lint (ESLint, eslint-config-next)
```

There is no test runner configured. Setup: `npm install`, then `cp .env.example .env.local`.

Demo login: `demo@smartstudy.app` / `password123`. Auth is now real Supabase Auth (see below), not a mock — arbitrary emails/domains no longer work, since Supabase validates them. "Confirm email" is OFF on this project's Auth settings for now (no SMTP provider configured), so `signUp()` returns an active session immediately.

## Big Picture

Smart Study Planner is a Next.js 14 App Router / TypeScript / Tailwind / Zustand app that is **mid-migration from a frontend-only MVP to a Supabase backend**. A Supabase project (`smart-study-planner-web`, ref `wktyqplwjfikdmgzufna`) is connected — see "Supabase connection" below. **Auth is real** (login/register/logout go through Supabase Auth, not a mock) but the rest of the domain data (tasks/courses/categories/etc.) still runs entirely on the Zustand store described next — that data-layer migration hasn't happened yet. UI copy and many domain string-literals are in **Bahasa Indonesia**.

Path alias: `@/*` → `./src/*`.

### Supabase connection
`src/lib/supabase/client.ts` (Client Components, via `createBrowserClient`) and `src/lib/supabase/server.ts` (Server Components/Route Handlers, via `createServerClient` + `next/headers` cookies) are the two entry points, following Supabase's standard `@supabase/ssr` pattern, both typed with `Database` from `src/lib/supabase/database.types.ts`. Both read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the environment — real values live in the gitignored `.env.local`, `.env.example` only has placeholders. Root `middleware.ts` (+ `src/lib/supabase/middleware.ts`'s `updateSession`) refreshes the session cookie on every request — it does **not** do route-based redirects; that's still `AppShell.tsx` client-side (see below).

**Auth settings:** "Confirm email" is OFF for this project (Authentication → Sign In / Providers → Email in the dashboard) — there's no custom SMTP provider configured, and Supabase's shared/default email service has a very low send quota that gets exhausted almost immediately, so leaving confirmation on blocks signups with `email rate limit exceeded`. Revisit this once a real email provider (Resend, SendGrid, etc.) is wired up. Also: Supabase validates email domains for real now — fake domains like `student.com` or `example.com` get rejected as invalid, unlike the old mock `authService`.

### Supabase schema (Auth is wired; domain tables aren't yet)
The `public` schema has 11 tables (migrations `smart_study_planner_initial_schema`, `harden_functions_and_optimize_rls`, `handle_new_user_include_profile_fields`), mirroring `src/types/index.ts`: `profiles` (extends `auth.users`, auto-populated via the `handle_new_user()` trigger from signup metadata — name/university/major/semester), `courses`, `categories`, `tasks`, `subtasks`, `class_schedules`, `study_sessions`, `preferences`, `widget_preferences`, `achievements`, `chat_messages`. Every user-owned table has `user_id -> auth.users(id)` with RLS (`(select auth.uid()) = user_id`). Only `profiles` is actually read/written today (via signup/login in `authService.ts`) — `tasks`/`categories`/etc. are all still Zustand-only; that data-layer migration is separate, not-yet-started work. Domain literals (`priority`, `difficulty`, `status`, `theme`, etc.) are `text` + `CHECK` constraints, not native Postgres enums — deliberately, since these values have already changed twice in this app's history and `CHECK` is cheaper to alter than `ALTER TYPE`.

`courses` is included for parity with `src/types/index.ts`, but `TaskForm.tsx` no longer links tasks to it by id (a frontend change repurposed that into a free-text `tasks.activity` column) — it's a real dead-code candidate on the frontend worth a follow-up decision.

Regenerate `database.types.ts` after any schema change via the Supabase MCP `generate_typescript_types` tool (or `supabase gen types typescript` if using the CLI locally) — it's hand-copied, not auto-synced.

### State & persistence
`src/store/useAppStore.ts` is a Zustand store with `persist` middleware. It holds the entire app domain (user, tasks, courses, categories, schedules, preferences, widgets, achievements, chat), still seeded from dummy data in `src/lib/data.ts` on first load — `isAuthenticated`/`user` are the only parts actually sourced from Supabase now (set via `authenticate()` after a real login/register in `authService.ts`). Two independent LocalStorage layers exist:
- `smart-study-planner-store` — the Zustand store (persist middleware)
- `sb-<project-ref>-auth-token` — Supabase's own session, managed entirely by the `@supabase/ssr` browser client, not by app code. `authService.ts` no longer writes its own token key directly (that was the old mock's `smart-study-planner-token`, which no longer exists).

When debugging auth/state weirdness, clear **both** LocalStorage layers, or just call `supabase.auth.signOut()`.

Every task mutation (`addTask`/`updateTask`/`completeTask`) runs through the local `score()` helper, which **recomputes `priorityScore` and `updatedAt`**. Don't set `priorityScore` manually — go through the store actions so it stays consistent.

### Auth gating happens in the layout component, not middleware
`src/components/layout/AppShell.tsx` is still the gate for route protection. It waits for Zustand hydration (`persist.hasHydrated()`), then `router.replace("/auth/login")` if `!isAuthenticated`; it also subscribes to `supabase.auth.onAuthStateChange` as a safety net, so a session that expires/gets revoked elsewhere flips `isAuthenticated` back off instead of leaving the UI stuck showing a dead session. Root `middleware.ts` exists now too, but only for session-cookie refresh — it does not redirect. **Any new authenticated page must render its content inside `<AppShell>`** or it won't be protected. The root `/` (`src/app/page.tsx`) simply `redirect`s to `/auth/login`. `AppShell` also owns the nav: `appRoutes` (desktop sidebar + mobile drawer) and `mobileQuickRoutes` (bottom bar) — add new pages to these arrays to make them reachable.

### Pages are thin wrappers
Files under `src/app/*/page.tsx` are mostly one-liners that render a component from `src/components/`. Notably, several distinct routes (category, widget, themes, account, achievement, premium, settings) all import their component from the single **`src/components/feature/FeaturePage.tsx`** — look there, not for a per-feature folder.

### "AI" is rule-based mock behind internal API routes
The frontend never calls an AI provider. `src/services/ai/aiService.ts` POSTs to internal routes `src/app/api/ai/analyze/route.ts` and `.../chat/route.ts`, which return **deterministic rule-based responses** (chat branches on keyword `includes`; analyze derives everything from `priorityScore`). To make AI real, implement the provider call inside these route handlers — the client contract stays the same.

### Core domain logic (pure functions in `src/utils/`)
- **`priorityScore.ts`** — the weighted scoring formula: `deadline*0.40 + priority*0.25 + difficulty*0.15 + duration*0.10 + statusRisk*0.10`, clamped 0–100. `status === "Selesai"` forces score 0. `scoreToPriority` and `riskLevel` bucket the score. This is the heart of the app; the store, both API routes, and sorting all depend on it.
- **`smartSchedule.ts`** — rule-based session generator: sorts active tasks by score, splits into 45–90 min sessions, respects `preference.maxStudyHoursPerDay` and `productiveTime` start hour.
- **`date.ts`** — all date handling (date-fns, `id` locale). `sortTasks` (score desc, then deadline asc) is the canonical task ordering used everywhere.

## Gotchas

- **Domain string literals are load-bearing.** `TaskStatus` values are Indonesian (`"Belum Mulai"`, `"Selesai"`, `"Terlambat"`) while `Priority`/`Difficulty` are English. These strings are keys into the maps in `priorityScore.ts` and are matched by equality across the app (e.g. `status === "Selesai"`). Changing a literal means updating every map and comparison. Types live in `src/types/index.ts`.
- Components touching the store must be Client Components (`"use client"`), as must anything using `AppShell`.
- `resetDemoData()` reseeds domain data from `src/lib/data.ts` but preserves the current auth session.
