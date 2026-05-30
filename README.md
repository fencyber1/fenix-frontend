# Fenix — Frontend

The web client for **Fenix**, a production-grade Student Management System.
React + Vite + TypeScript (strict) + Tailwind, with a custom design-token system,
role-based routing, and a fully typed API layer talking to the Fenix backend.

## Stack

| Concern          | Choice                                                       |
| ---------------- | ----------------------------------------------------------- |
| Framework        | React 18 + Vite 5 + TypeScript (strict, no `any`)           |
| Styling          | Tailwind CSS with a custom token system (no default colors) |
| Server state     | TanStack Query (caching, pagination, mutations)             |
| Client state     | Zustand (auth session, theme)                               |
| Routing          | React Router v6 with per-role protected routes              |
| Forms            | React Hook Form + Zod (schemas mirror the backend)          |
| Tables           | TanStack Table with server-side pagination & sorting        |
| Charts           | Recharts (all data from API)                                |
| PDF              | @react-pdf/renderer (report cards & invoices, lazy-loaded)  |
| Uploads          | Presigned S3/local URLs — browser never holds credentials   |
| Toasts           | Sonner                                                      |

## Design system

- **Palette:** deep navy `#0F1C3F`, electric teal `#00C2CB`, warm white `#F9FAFB`,
  amber `#F59E0B`. Semantic surface/content tokens swap for light/dark via CSS
  variables and Tailwind's `class` dark-mode strategy (persisted to localStorage).
- **Type:** Sora (headings) + IBM Plex Sans (body/data) from Google Fonts.
- **Component library** (`src/components/ui`): `Button`, `Input`, `PasswordInput`,
  `Select`, `Textarea`, `Card`, `StatCard`, `StatusBadge`, `Avatar`, `Modal`,
  `Drawer`, `ConfirmDialog` (typed-confirmation), `DataTable`, `Skeleton`,
  `Spinner`, `EmptyState` — zero external UI-kit dependency.

## Pages

`/login`, `/forgot-password`, `/reset-password`, `/verify-email`,
`/dashboard` (KPIs + charts), `/students` (+ slide-over form, CSV import),
`/students/:id` (tabbed: Overview · Attendance · Grades · Fees · Documents),
`/attendance` (class → date → bulk mark grid), `/grades` (entry sheet),
`/fees` (invoices, record payment, waive, invoice PDF), `/classes` (+ roster),
`/staff` (+ invite), `/reports` (report-card & attendance builders, PDF export),
`/audit`, `/settings` (school profile, notification preferences, password).

## Getting started

```bash
cp .env.example .env          # optional: set VITE_API_URL (defaults to dev proxy)
npm install
npm run dev                    # http://localhost:5173  (proxies /api -> :4000)
```

Run the [Fenix backend](../sms-backend) on port 4000 first. The Vite dev server
proxies `/api` and `/files` to it; in production set `VITE_API_URL`.

## Scripts

| Script             | Purpose                          |
| ------------------ | -------------------------------- |
| `npm run dev`      | Dev server (HMR)                 |
| `npm run build`    | Type-check + production build    |
| `npm run preview`  | Preview the production build     |
| `npm run typecheck`| `tsc --noEmit` (strict)          |
| `npm run lint`     | ESLint (bans `any`)              |
| `npm test`         | Vitest (utils, schemas, UI)      |

## Architecture notes

- **Auth:** access token kept in memory; refresh token in an HTTP-only cookie.
  An axios interceptor performs a single transparent refresh on `401` and
  redirects to `/login` if it fails.
- **Authorization:** routes guarded by role via `ProtectedRoute`; the sidebar and
  action buttons hide what a role can't do — but the **server is the source of
  truth** and re-checks every request.
- **Resilience:** every data view has skeleton loaders, contextual empty states,
  and surfaces API errors as inline field errors + toasts (no silent failures).
- **Performance:** heavy routes (charts) and the PDF renderer are code-split and
  loaded on demand.
