---
description: Eyris data fetching and state management — Server Actions, SWR, Zustand, anti-patterns.
alwaysApply: true
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
