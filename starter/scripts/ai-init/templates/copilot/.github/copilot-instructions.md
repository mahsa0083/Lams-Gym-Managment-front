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

---

# Eyris — Data Fetching & State Management

## The Core Rule

**Server Actions fetch data in Server Components. SWR handles client-side refetches. Zustand holds client UI state. Never mix them.**

| Concern | Tool | Where |
|---|---|---|
| Initial page data | Server Action | `page.tsx` (async Server Component) |
| Client-side refetch / real-time | SWR + Axios service → API Route | `'use client'` component |
| UI state (client-only) | Zustand | sidebar open, active tab, selections |
| Component-local state | `useState` | form input, toggle, modal open |
| Form state | React Hook Form | form values, validation, submission |

---

## Server Actions — Initial Data

`page.tsx` is always an async Server Component. Call a Server Action to fetch data and pass it as props to the view.

```typescript
// app/(protected-pages)/your-feature/page.tsx
import { getFeatureData } from '@/server/actions/yourFeature'

export default async function YourFeaturePage() {
    const data = await getFeatureData()
    return <YourFeatureView data={data} />
}
```

```typescript
// server/actions/yourFeature.ts
'use server'

export async function getFeatureData() {
    // DB call, external API, or mock data import
    return data
}
```

### Mutations

For write operations, use a Server Action and revalidate the affected route:

```typescript
'use server'
import { revalidatePath } from 'next/cache'

export async function deleteItem(id: string) {
    // perform delete
    revalidatePath('/your-feature')
}
```

---

## SWR — Client-Side Refetch

Use SWR when you need live updates after the initial SSR load (real-time feeds, polling, data that changes on user action).

```typescript
'use client'
import useSWR from 'swr'
import { apiGetFeatureData } from '@/services/client/FeatureService'

const FeatureView = ({ initialData }: { initialData: FeatureData }) => {
    const { data } = useSWR('/api/your-feature', apiGetFeatureData, {
        fallbackData: initialData,  // avoids loading flash — SSR data is the initial cache
    })
    // ...
}
```

SWR calls hit API Routes in `src/app/api/`. Axios services in `src/services/client/` handle the actual requests.

---

## Zustand — Client UI State Only

Zustand is for state that never comes from the server: sidebar open/closed, active tabs, table row selection, theme, locale.

```typescript
import { create } from 'zustand'

interface FilterState {
    search: string
    setSearch: (v: string) => void
}

const useFilterStore = create<FilterState>((set) => ({
    search: '',
    setSearch: (search) => set({ search }),
}))
```

### Existing stores in `src/store/`

- `themeStore` — layout type, mode (light/dark), direction, schema
- `localeStore` — active language
- `routeKeyStore` — current route key for nav highlight

---

## Mock System

Mock data lives in `src/mock/data/` as plain static objects — no interceptors. Server Actions and API Routes import directly from there.

To connect a real backend: replace mock imports in Server Actions with DB/API calls, and update `src/configs/endpoint.config.ts`.

---

## Anti-Patterns — Never Do These

```typescript
// BANNED: Fetch in useEffect
useEffect(() => {
    fetch('/api/data').then(setData)   // bypasses SSR and caching
}, [])

// BANNED: Fetch in Zustand store
const useStore = create((set) => ({
    fetch: async () => { set({ data: await apiGetData() }) }  // use Server Actions or SWR
}))

// BANNED: Axios in Server Components for initial data
const data = await ApiService.fetchDataWithAxios({ url: '/api/sales' })
// Use a Server Action instead — they can access cookies, headers, session

// BANNED: SWR with no SSR initial data
const { data } = useSWR('/api/dashboard', apiGetDashboard)
// Always provide fallbackData from page.tsx to avoid a loading flash
```

---

# Eyris — Styling Rules

Eyris uses **Tailwind CSS 4** with a custom design token layer built on CSS custom properties. All tokens are defined in `src/assets/styles/tailwind/index.css`.

---

## Color Tokens — Semantic Names Only

Never use raw hex values or arbitrary Tailwind colors (`bg-blue-500`, `text-red-400`). Always use Eyris semantic token classes.

| Token class | Purpose |
|---|---|
| `bg-primary` / `text-primary` | Brand primary color |
| `bg-primary-deep` | Darker primary for hover/pressed states |
| `bg-primary-mild` | Lighter primary variant |
| `bg-primary-subtle` | Low-opacity primary tint (backgrounds, badges) |
| `text-error` / `bg-error-subtle` | Error and destructive states |
| `text-success` / `bg-success-subtle` | Success states |
| `text-warning` / `bg-warning-subtle` | Warning states |
| `text-info` / `bg-info-subtle` | Informational states |
| `bg-gray-50` … `bg-gray-950` | Gray scale for backgrounds and borders |
| `heading-text` | Adaptive dark/light emphasis text (see Typography) |

---

## Dark Mode

Prefer every component work in both light and dark mode. Semantic tokens adapt automatically. For non-semantic classes, always provide `dark:` variants.

```tsx
// Correct — semantic token adapts automatically
<div className="bg-primary-subtle text-primary">...</div>

// Correct — explicit dark override for non-semantic classes
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">...</div>

// Wrong — no dark override, will look broken in dark mode
<div className="bg-white text-gray-900">...</div>
```

---

## Typography — Pre-Configured, Do Not Override

Typography sizes and colors are globally configured in `src/assets/styles/tailwind/index.css` via the base layer. **Do not add explicit `text-*` size or color classes to heading elements** — they already have the correct styles applied.

### Heading hierarchy

| Tag | Use case | Applied style |
|---|---|---|
| `h4` | Page title — the main title of every view/page | `text-xl font-semibold text-gray-900 dark:text-gray-100` |
| `h5` | Section title — inside cards, panels, forms | `text-lg font-semibold text-gray-900 dark:text-gray-100` |
| `h6` | Subtitle / label — avatar+name, section indicator | `text-base font-medium text-gray-900 dark:text-gray-100` |
| `h3` | Empty state / illustrated feedback | `text-2xl font-semibold text-gray-900 dark:text-gray-100` |
| `h1`, `h2` | Error pages, hero screens only | `text-4xl/3xl font-semibold text-gray-900 dark:text-gray-100` |

```tsx
// Correct — h4 gets its size and color automatically
<h4>Customer List</h4>
<h5>Recent Orders</h5>

// Wrong — overriding what's already configured
<h4 className="text-xl font-semibold text-gray-900">Customer List</h4>
```

### Body text

Body text inherits `text-sm text-gray-500 dark:text-gray-400` from the base layer.

| Element | When to use |
|---|---|
| `p` | Longer paragraphs, multi-line descriptions |
| `span` | Short inline text within a sentence or next to UI elements |
| `div` | Short standalone text blocks, labels, brief descriptions |

### `.heading-text` utility

Apply to any `p`, `span`, or `div` to make it slightly darker for emphasis, adapting to dark/light mode automatically. Equivalent to `text-gray-900 dark:text-gray-100`.

```tsx
<span className="heading-text font-medium">{user.name}</span>
```

---

## classNames — Conditional Styling

Use `classNames` from the `classnames` package for all conditional class composition. Never use template literals or string concatenation for class names — Tailwind's JIT scanner can't detect dynamically constructed strings and won't include those classes in the build.

```typescript
import classNames from 'classnames'

const cls = classNames(
    // Base classes
    'inline-flex items-center justify-center rounded-lg transition-colors',
    // Conditional — variant
    variant === 'solid' && 'bg-primary text-white hover:bg-primary-deep',
    variant === 'plain' && 'text-primary hover:bg-primary-subtle',
    // Conditional — state
    disabled && 'opacity-50 cursor-not-allowed',
    // Consumer override — always spread last
    className,
)
```

---

## Layout & Spacing

### Rules

- Use Tailwind's spacing scale (4px increments): `p-4` = 16px, `gap-6` = 24px
- Use `gap-*` for flex/grid children — not `mr-*` / `ml-*` / `mb-*` between siblings
- Use `space-y-*` for vertically stacked siblings

### Patterns

```tsx
// Flex row with gap
<div className="flex items-center gap-2">
    <Avatar />
    <span>{user.name}</span>
</div>

// Stacked children
<div className="space-y-4">
    <SectionA />
    <SectionB />
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

---

## Control Sizes

Consistent sizing system across all interactive controls (Button, Input, Select, etc.):

| Prop value | Height | Use case |
|---|---|---|
| `size="sm"` | 32px | Dense tables, compact toolbars |
| `size="md"` | 40px | Default — forms, general use |
| `size="lg"` | 48px | Prominent CTAs |

---

## Component Styling Pattern

```tsx
import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import type { TypeAttributes } from '@/@types/common'

interface MyComponentProps extends CommonProps {
    variant?: 'primary' | 'secondary'
    size?: TypeAttributes.ControlSize
}

const MyComponent = ({
    variant = 'primary',
    size = 'md',
    className,
    children,
}: MyComponentProps) => {
    const cls = classNames(
        'inline-flex items-center rounded-lg transition-colors',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-deep',
        variant === 'secondary' && 'bg-primary-subtle text-primary',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-5 text-base',
        className,
    )

    return <div className={cls}>{children}</div>
}
```

Key rules:
- Always extend `CommonProps` for base props (`className`, `style`, `id`, `children`)
- Use `TypeAttributes.ControlSize` for size props, `TypeAttributes.Status` for status
- Always spread incoming `className` last in `classNames()` — allows consumer override

---

## CSS Layer Architecture

```css
@layer theme {
    :root {
        --primary: #286cf0;
        --primary-deep: #1f56c0;
        --primary-mild: #4c86f4;
        --primary-subtle: #286cf01a;
        --error: #eb4137;
        --success: #00a85b;
        --info: #3380fa;
        --warning: #f59e0b;
        /* ... gray-50 through gray-950 */
    }
    .dark {
        /* Dark-adjusted values */
    }
}

@layer base {
    body { @apply text-gray-500 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-950; }
    h4 { @apply text-xl font-semibold text-gray-900 dark:text-gray-100; }
    /* ... */
}

@layer components {
    .heading-text { @apply text-gray-900 dark:text-gray-100; }
}
```

Do not add `@layer theme` tokens inline. If a new token is needed, add it to `src/assets/styles/tailwind/index.css`.

---

# Eyris — Authentication System

## Overview

Authentication uses **NextAuth.js v5** with route protection handled at the middleware level via `src/proxy.ts`. Authority (roles) are stored in the JWT token and available in both Server and Client Components.

---

## Reading Auth State

### Server Components (preferred)

```typescript
import { auth } from '@/auth'

export default async function ProfilePage() {
    const session = await auth()

    if (!session) {
        // proxy.ts should have redirected already, but guard defensively
        redirect('/sign-in')
    }

    const { user } = session
    // user.name, user.email, user.authority, user.userId, user.avatar
}
```

### Client Components

```typescript
'use client'
import { useSession } from 'next-auth/react'

const UserMenu = () => {
    const { data: session } = useSession()
    const user = session?.user
    // ...
}
```

---

## Sign In / Sign Out

In a Server Action, `signIn` throws a redirect — do not wrap it in `try/catch`:

```typescript
// Server Action
'use server'
import { signIn } from '@/auth'

export async function signInAction(credentials: SignInCredential) {
    await signIn('credentials', {
        ...credentials,
        redirectTo: '/apps/sales/dashboard',
    })
    // signIn throws NEXT_REDIRECT — Next.js handles it automatically
}
```

From a Client Component use the NextAuth client methods:

```typescript
'use client'
import { signIn, signOut } from 'next-auth/react'

// redirect: false lets you handle errors in JS
const result = await signIn('credentials', { email, password, redirect: false })
if (result?.error) { /* show error */ }

await signOut({ callbackUrl: '/sign-in' })
```

Sign out from a Server Action:

```typescript
import { signOut } from '@/auth'
await signOut({ redirectTo: '/sign-in' })
```

---

## User Type (`src/@types/auth.ts`)

```typescript
type User = {
    userId?: string | null
    avatar?: string | null
    userName?: string | null
    email?: string | null
    authority?: string[]
}
```

Authority is an array of role strings (e.g., `['admin', 'user']`).

---

## Route Protection

Route protection runs at the edge in `src/proxy.ts` (NextAuth middleware):

| Route type | Behavior |
|---|---|
| `protectedRoutes` | Unauthenticated users → redirect to `/sign-in` with `?callbackUrl` |
| `authRoutes` | Already signed-in users → redirect to `authenticatedEntryPath` |
| `publicRoutes` | Always accessible — no redirect |

To add a new protected route, register it in `src/configs/routes.config/` (see routing.md) — the middleware reads from there.

### Role-Based Access (Authority Guard)

Uncomment the authority check block in `proxy.ts` to enable route-level RBAC. Each route in `protectedRoutes` has an `authority` array:

```typescript
// routes.config
'/admin/settings': {
    key: 'admin.settings',
    authority: ['admin', 'superAdmin'],    // empty [] = any authenticated user
    meta: { pageContainerType: 'default' },
},
```

If the user's `authority` doesn't include any matching role → redirect to `/access-denied`.

---

## NextAuth Configuration

`src/configs/auth.config.ts` — providers and callbacks:
- **Credentials** — email + password against `apiSignIn` endpoint
- **OAuth** — GitHub, Google (configured via env vars)
- `callbacks.jwt` — attaches `userId`, `authority`, `avatar`, `userName` to the token
- `callbacks.session` — exposes token fields on `session.user`

`src/auth.ts` — the exported entry:
```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({...authConfig})
```

`src/app/api/auth/[...nextauth]/route.ts` — routes NextAuth HTTP handlers.

---

## Auth Views

Pre-built auth pages in `src/app/(auth-pages)/`:
- `/sign-in` — credentials + OAuth sign-in
- Other auth pages (`/sign-up`, `/forgot-password`, `/reset-password`) are in `(protected-pages)/auth/` as demo pages (not real auth flows)

---

# Eyris — Routing System

## File-Based Routing (App Router)

Pages live in `src/app/`. The folder structure is the URL. Use route groups `(groupName)` to apply shared layouts without affecting the URL.

| Group | Layout | Auth |
|---|---|---|
| `(auth-pages)` | AuthLayout | No — redirects away if already signed in |
| `(protected-pages)` | PostLoginLayout | Yes — redirects to sign-in |
| `(public-pages)` | None / custom | No |

```
src/app/
├── (auth-pages)/           # /sign-in, /sign-up — AuthLayout, no PostLogin shell
│     sign-in/
│       page.tsx
├── (protected-pages)/      # All dashboard routes — PostLoginLayout (header + sidenav)
│     layout.tsx            # Shared layout for all protected pages
│     apps/
│       your-feature/
│         page.tsx          # → URL: /apps/your-feature
│         [id]/
│           page.tsx        # → URL: /apps/your-feature/123
├── (public-pages)/         # Public routes — no auth required
└── api/                    # API Routes (not pages)
```

---

## Route Configuration

Routes are also registered in `src/configs/routes.config/` for middleware-level auth checking and nav key pairing. The format is an object map (not an array like Vite).

```typescript
// src/configs/routes.config/appsRoute.ts
import type { Routes } from '@/@types/routes'

const appsRoute: Routes = {
    '/apps/your-feature': {
        key: 'apps.yourFeature',           // pairs with navigation config key
        authority: [],                     // [] = any authenticated user; ['admin'] = admin only
        meta: {
            pageContainerType: 'default',  // 'default' | 'gutterless' | 'contained'
        },
    },
    '/apps/your-feature/:id': {
        key: 'apps.yourFeature.detail',
        authority: [],
        meta: { pageContainerType: 'contained' },
        dynamicRoute: true,
    },
}

export default appsRoute
```

Then add it to `src/configs/routes.config/index.ts`:

```typescript
export const protectedRoutes: Routes = {
    ...appsRoute,
    ...yourNewRoute,
}
```

---

## Route Access Types

| Export | Where used | Behavior |
|---|---|---|
| `protectedRoutes` | `proxy.ts` middleware | Requires auth. Redirects to `/sign-in` if not authenticated. |
| `authRoutes` | `proxy.ts` middleware | Only accessible when NOT authenticated. Redirects to `authenticatedEntryPath` if signed in. |
| `publicRoutes` | `proxy.ts` middleware | Accessible to everyone. |

---

## Navigation Configuration

Sidebar navigation is defined in `src/configs/navigation.config/`.

```typescript
import type { NavigationTree } from '@/@types/navigation'
import { NAV_ITEM_TYPE_ITEM, NAV_ITEM_TYPE_COLLAPSE } from '@/constants/navigation.constant'

const navigationConfig: NavigationTree[] = [
    {
        key: 'apps.yourFeature',       // must match route config key
        path: '/apps/your-feature',
        title: 'Your Feature',
        translateKey: 'nav.apps.yourFeature',
        icon: 'yourIcon',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
]
```

### Navigation item types

| Type | Behavior |
|---|---|
| `'item'` | Clickable nav link |
| `'collapse'` | Collapsible group — reveals `subMenu` |
| `'title'` | Section header/divider |

---

## Router Navigation (Client Components)

Use `next/navigation` — not `react-router`:

```typescript
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const router = useRouter()
router.push('/apps/your-feature')
router.replace('/apps/your-feature')
router.back()
```

---

## Dynamic Routes

Create `[param]` folders for dynamic segments:

```
src/app/(protected-pages)/apps/customers/[id]/page.tsx
```

```typescript
type PageProps = {
    params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: PageProps) {
    const { id } = await params
    const customer = await getCustomer(id)
    return <CustomerDetail customer={customer} />
}
```

Register it in routes.config with `dynamicRoute: true` (see above).

---

# Eyris — Server vs Client Components

## Default: Server Component

Every component starts as a Server Component. Add `'use client'` only when the component genuinely needs it.

**Must have `'use client'`:**
- React hooks (`useState`, `useEffect`, `useContext`, etc.)
- Browser APIs (`window`, `document`, `localStorage`)
- Event handlers (`onClick`, `onChange`)
- Zustand stores, SWR, Framer Motion

**Should NOT have `'use client'`:**
- Components that only receive props and render JSX
- Layout components that compose children
- Components that fetch data via Server Actions

## Contagion Warning

Marking a component `'use client'` pulls every import in that file into the client bundle. Never mark a layout or a large wrapper as `'use client'`. Instead, extract the interactive piece into a small leaf component and mark only that.

```typescript
// Wrong — entire layout becomes client bundle
'use client'
export default function DashboardLayout({ children }) { ... }

// Correct — only the interactive piece is a Client Component
// DashboardLayout.tsx — Server Component, no directive
// ThemeToggle.tsx — 'use client', small leaf
```

## Passing Server Data to Client Components

Server Components can pass serializable props to Client Components. They cannot pass functions or class instances.

```typescript
// page.tsx — Server Component
const data = await getFeatureData()
return <FeatureTable data={data} />  // data must be serializable

// FeatureTable.tsx — Client Component
'use client'
const FeatureTable = ({ data }: { data: FeatureItem[] }) => { ... }
```

---

# Eyris — Internationalization (next-intl)

## Usage

Use `getTranslations` in Server Components, `useTranslations` in Client Components.

```typescript
// Server Component
import { getTranslations } from 'next-intl/server'

export default async function MyPage() {
    const t = await getTranslations('namespace')
    return <h4>{t('title')}</h4>
}

// Client Component
'use client'
import { useTranslations } from 'next-intl'

const MyComponent = () => {
    const t = useTranslations('namespace')
    return <span>{t('label')}</span>
}
```

## Message Files

Messages live in `messages/` at the project root (e.g. `messages/en.json`).

```json
{
    "namespace": {
        "title": "Page Title",
        "label": "My Label"
    }
}
```

The `translateKey` field in navigation config (e.g. `nav.apps.yourFeature`) maps to a key path in these files.

## Locale Detection

Locale is detected server-side via `src/i18n/request.ts`. The active locale is stored in a cookie and can be read/set with the `getLocale` / `setLocale` Server Actions in `src/server/actions/locale.ts`.

---

# Create a New Page

Create a new page/view in the Eyris Next.js template. The user will provide a page name and description. Follow these steps exactly.

## Step 1 — Create the page file

Path: `src/app/(protected-pages)/apps/<kebab-case-name>/page.tsx`

Requirements:
- `page.tsx` must be a Server Component — no `'use client'`
- Call a Server Action to get initial data — never fetch in `useEffect` or Zustand
- Page title uses `<h4>` — never h1/h2/h3 for page titles
- Pass data as props to a separate view component

```typescript
import { get<PascalCaseName>Data } from '@/server/actions/<camelCaseName>'

type PageProps = {
    searchParams: Promise<{ search?: string; page?: string }>
}

export default async function <PascalCaseName>Page({ searchParams }: PageProps) {
    const params = await searchParams
    const data = await get<PascalCaseName>Data(params)
    return <<PascalCaseName>View data={data} />
}
```

## Step 2 — Create the view component

Path: `src/app/(protected-pages)/apps/<kebab-case-name>/<PascalCaseName>View.tsx`

Keep the view as a Server Component — it only receives props and renders:

```tsx
type <PascalCaseName>ViewProps = {
    data: YourDataType
}

const <PascalCaseName>View = ({ data }: <PascalCaseName>ViewProps) => {
    return (
        <div>
            <h4>Page Title</h4>
            {/* page content */}
        </div>
    )
}

export default <PascalCaseName>View
```

If the page needs a filter bar or other interactive controls, create a separate `'use client'` component for that piece — do not convert the entire view. The view stays a Server Component receiving data as props.

## Step 3 — Create the Server Action

Path: `src/server/actions/<camelCaseName>.ts`

```typescript
'use server'

import { <camelCaseName>Data } from '@/mock/data/<camelCaseName>Data'

export async function get<PascalCaseName>Data(params?: {
    search?: string
    page?: string
}) {
    // Return mock data or real data from DB / external API
    return <camelCaseName>Data
}
```

## Step 4 — Register the route

File: `src/configs/routes.config/appsRoute.ts` (or create a new route file)

Add to the routes object:

```typescript
'/apps/<kebab-case-name>': {
    key: 'apps.<camelCaseName>',
    authority: [],                    // [] = any authenticated user; ['admin'] = admin only
    meta: {
        pageContainerType: 'default', // 'default' | 'gutterless' | 'contained'
    },
},
```

Then make sure it's exported from `src/configs/routes.config/index.ts` under `protectedRoutes`.

## Step 5 — Add to navigation (optional)

File: `src/configs/navigation.config/index.ts`

```typescript
{
    key: 'apps.<camelCaseName>',           // must match route key
    path: '/apps/<kebab-case-name>',
    title: '<Display Name>',
    translateKey: 'nav.apps.<camelCaseName>',
    icon: '<icon-name>',
    type: NAV_ITEM_TYPE_ITEM,
    authority: [],
    subMenu: [],
}
```

## Step 5b — Add a loading state (optional)

Create a `loading.tsx` alongside `page.tsx` for App Router streaming:

```typescript
// src/app/(protected-pages)/apps/<kebab-case-name>/loading.tsx
export default function Loading() {
    return <div>Loading...</div>  // replace with a skeleton or spinner
}
```

App Router automatically streams this while `page.tsx` awaits the Server Action.

## Step 6 — Add mock API Route (if the page has client-side refetch)

For SWR-based client refetches, create an API Route:

```typescript
// src/app/api/<feature>/route.ts
import { NextResponse } from 'next/server'
import { <camelCaseName>Data } from '@/mock/data/<camelCaseName>Data'

export async function GET() {
    return NextResponse.json(<camelCaseName>Data)
}
```

Then create a service function:

```typescript
// src/services/client/<PascalCaseName>Service.ts
import ApiService from '@/services/client/ApiService'

export async function apiGet<PascalCaseName>Data() {
    return ApiService.fetchDataWithAxios<ResponseType>({
        url: '/api/<feature>',
        method: 'get',
    })
}
```

## Step 7 — Verify

- [ ] Route resolves in the browser at `/apps/<kebab-case-name>`
- [ ] Route config layout reflected in page
- [ ] Navigation highlights the correct item (if added to nav)
- [ ] TypeScript has no errors
