---
inclusion: manual
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
