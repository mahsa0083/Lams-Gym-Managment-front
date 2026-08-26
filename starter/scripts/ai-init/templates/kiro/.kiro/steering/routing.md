---
inclusion: always
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
