---
inclusion: always
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
