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
