# IDX Stocks Dashboard

Frontend for an Indonesia Stock Exchange (IDX) dashboard — stocks listing, watchlist, portfolio, market charts, and authentication flows.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Zustand (state), Zod (validation), Axios (HTTP)
- Recharts (charts)
- Mock data layer (`src/lib/mock`, `src/services/exodus`) — swap to live backend by changing `NEXT_PUBLIC_API_BASE_URL`

## Getting Started

```bash
npm install
npm run dev
```

App runs on http://localhost:3000.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |

## Environment

Copy `.env.local` (gitignored) and set:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

When unset, the app falls back to the bundled mock services.

## Project Layout

```
src/
├── app/                  # Next.js App Router routes
│   ├── (dashboard)/      # Authenticated layout group (dashboard, stocks, watchlist, portfolio, settings)
│   ├── api/auth/         # Auth route handlers
│   ├── register/         # Public auth pages
│   └── login/
├── components/
│   ├── auth/             # Login/register forms + provider
│   ├── charts/           # Recharts wrappers
│   ├── dashboard/        # Dashboard page
│   ├── layout/           # App shell, sidebar, top/bottom nav
│   ├── portfolio/        # Portfolio page
│   ├── settings/         # Settings page
│   ├── stocks/           # Stock list, detail, watchlist pages
│   └── ui/               # shadcn/ui primitives
├── lib/
│   ├── api-client.ts     # Axios instance + interceptors
│   ├── mock/             # Mock data fixtures
│   ├── utils.ts          # cn() helper
│   └── validators/       # Zod schemas
├── services/             # Per-domain API clients (auth, stocks, portfolio, watchlist, exodus)
├── stores/               # Zustand stores
└── types/                # Shared TypeScript types
```

## Features

- **Auth**: register, login, refresh, session via Zustand + Axios interceptors
- **Dashboard**: market overview, top movers, allocation summary
- **Stocks**: searchable list + detail page with price history
- **Watchlist**: add/remove tickers
- **Portfolio**: holdings, P/L, allocation
- **Settings**: user preferences
- **Responsive**: desktop sidebar + mobile drawer/bottom nav

## Notes

- `src/lib/mock` ships the demo dataset used when no backend is configured
- API client auto-attaches auth token and refreshes on 401
- Path aliases: `@/*` → `src/*`