---
description: Eyris project overview, tech stack, folder structure, app config, and naming conventions.
alwaysApply: true
---

# Eyris — Project Overview

Eyris is a modern React admin template built with TypeScript, Next.js, and Tailwind CSS. It provides a comprehensive foundation for building admin dashboards and management interfaces with a focus on modularity, robust architecture, and developer experience.

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js | 16 |
| Language | TypeScript | 5+ |
| Runtime | React | 19 |
| Styling | Tailwind CSS | 4 |
| Auth | NextAuth.js | v5 |
| i18n | next-intl | latest |
| Client state | Zustand | 5 |
| Client data | SWR | 2 |
| Forms | React Hook Form + Zod | latest |
| Tables | TanStack React Table | 8 |
| Charts | Recharts | 3 |
| Animation | Framer Motion (motion) | 12 |
| Date | dayjs | 1 |
| HTTP | Axios | 1 |
| DnD | DND Kit | 6 |
| Icons | Self-built library | — |

## Folder Structure

```
src/
├── @types/                 TypeScript type definitions
│     auth.ts               User, Session, Authority types
│     common.tsx            CommonProps, TypeAttributes (ControlSize, Status, etc.)
│     navigation.ts         NavigationTree, nav item types
│     routes.ts             Routes map, RouteMetadata, RouteAccessType
│     theme.ts              ThemeConfig, LayoutType
│
├── app/                    Next.js App Router
│     (auth-pages)/         Sign-in/up — shown without PostLogin layout
│     (protected-pages)/    Requires auth + PostLogin layout
│       apps/               App modules (sales, analytics, customers, hrm, etc.)
│     (public-pages)/       No auth required
│     api/                  API Routes (NextAuth + mock data endpoints)
│     layout.tsx            Root layout — all providers
│     page.tsx              Root page (redirect to entry path)
│
├── assets/
│     styles/               Tailwind entry + CSS custom properties (design tokens)
│
├── auth.ts                 NextAuth.js config export (handlers, signIn, signOut, auth)
│
├── components/
│     auth/                 AuthProvider (wraps session), auth form components
│     layouts/              PostLoginLayout, AuthLayout
│     shared/               DataTable, Chart, RichTextEditor, EmptyState, Loading, …
│     template/             Header, SideNav, Footer, ThemeConfigurator, LocaleProvider
│     ui/                   Core UI library (Button, Input, Select, Dialog, Card, Badge, …)
│
├── configs/
│     app.config.ts         API prefix, entry paths, locale
│     auth.config.ts        NextAuth providers (Credentials, GitHub, Google)
│     theme.config.ts       Default layout type, control size, direction, mode
│     routes.config/        protectedRoutes, authRoutes, publicRoutes maps
│     navigation.config/    Sidebar navigation tree
│     endpoint.config.ts    API endpoint paths
│
├── constants/              Application-wide constants (camelCase.constant.ts)
│
├── i18n/                   next-intl request config (locale detection)
│
├── icons/                  Self-built SVG icon library
│
├── mock/
│     data/                 Static mock data objects (server-side only)
│
├── proxy.ts                NextAuth middleware — route protection at the edge
│
├── server/
│     actions/              Server Actions ('use server')
│       theme.ts            getTheme / setTheme (cookies)
│       locale.ts           getLocale / setLocale (cookies)
│       navigation/         getNavigation (builds nav tree)
│       <feature>.ts        Feature-specific server actions
│
├── services/
│     client/               Axios services for SWR client-side refetches
│     server/               Server-side utilities
│
└── utils/                  Pure utilities and custom hooks (camelCase.ts)
      hooks/                Custom React hooks
      hoc/                  Higher-order components
```

## App Configuration

`src/configs/app.config.ts` — change these when setting up a real backend:

```typescript
const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/apps/sales/dashboard',  // redirect after sign-in
    unAuthenticatedEntryPath: '/sign-in',             // redirect if not authenticated
    locale: 'en',
    activeNavTranslation: true,
}
```

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase.tsx | `UserTable.tsx` |
| Hooks | camelCase.ts with `use` prefix | `useUserData.ts` |
| Utilities | camelCase.ts | `formatDate.ts` |
| Types | camelCase.ts in `@types/` | `user.ts` |
| Constants | camelCase.constant.ts | `status.constant.ts` |
| Configs | camelCase.config.ts | `app.config.ts` |
| Store slices | camelCase + Store suffix | `filterStore.ts` |
| Server Actions | camelCase in `server/actions/` | `getSalesDashboard.ts` |
| Services | PascalCase + Service suffix | `SalesService.ts` |
