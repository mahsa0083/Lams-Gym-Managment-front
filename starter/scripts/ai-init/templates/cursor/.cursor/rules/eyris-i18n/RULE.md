---
description: Eyris internationalization — next-intl, getTranslations (server), useTranslations (client), message files.
alwaysApply: false
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
