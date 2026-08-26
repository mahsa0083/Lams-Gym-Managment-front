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
