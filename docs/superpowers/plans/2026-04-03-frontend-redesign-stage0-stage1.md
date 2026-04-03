# Frontend Redesign: Foundation + docs-web Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a shared design system (packages/ui + packages/shared) and migrate docs-web as the first consumer, validating the design system before admin-web and user-web migrations.

**Architecture:** pnpm monorepo with two shared packages — `@jarvis/ui` (Tailwind + shadcn/ui components, Dark Corporate theme) and `@jarvis/shared` (API client, i18n, types, hooks). docs-web is rewritten to consume both packages, with React Router replacing hash-based routing.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind CSS, shadcn/ui, React Router, Vite 8, Vitest, pnpm workspaces

---

## File Structure

### New files (packages/ui)
```
packages/ui/
├── package.json                 # @jarvis/ui package manifest
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Jarvis Dark Corporate theme tokens
├── postcss.config.js            # PostCSS with Tailwind plugin
├── components.json              # shadcn/ui config
├── src/
│   ├── globals.css              # Tailwind base + CSS variables
│   ├── lib/utils.ts             # cn() helper (clsx + tailwind-merge)
│   ├── components/              # shadcn/ui components (via CLI)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── sonner.tsx
│   ├── layout/                  # Custom layout components
│   │   ├── sidebar.tsx          # Collapsible navigation sidebar
│   │   ├── topbar.tsx           # Header with theme/lang/profile
│   │   └── page-shell.tsx       # Layout wrapper (sidebar + topbar + Outlet)
│   ├── feedback/                # Custom feedback components
│   │   ├── empty-state.tsx      # Empty list placeholder
│   │   └── error-boundary.tsx   # React error boundary
│   └── index.ts                 # Re-exports all components
```

### New files (packages/shared)
```
packages/shared/
├── package.json                 # @jarvis/shared package manifest
├── tsconfig.json                # TypeScript config
├── vitest.config.ts             # Test config
├── src/
│   ├── types.ts                 # Shared TypeScript types
│   ├── api.ts                   # Centralized API client
│   ├── i18n.ts                  # Translation system
│   ├── hooks/
│   │   ├── use-auth.ts          # Auth state + token management
│   │   ├── use-sse.ts           # SSE streaming helper
│   │   ├── use-theme.ts         # Dark theme + localStorage
│   │   ├── use-translation.ts   # i18n React hook
│   │   └── index.ts             # Re-exports
│   └── index.ts                 # Re-exports all
└── tests/
    ├── api.test.ts
    ├── i18n.test.ts
    └── hooks.test.ts
```

### New root files
```
jarvis-group/
├── pnpm-workspace.yaml          # Workspace config
├── package.json                 # Root scripts
└── .npmrc                       # pnpm settings
```

### Modified files (docs-web)
```
docs-web/
├── package.json                 # Add workspace deps, Tailwind, React Router
├── vite.config.ts               # Add path aliases
├── tsconfig.app.json            # Add path aliases
├── postcss.config.js            # NEW — PostCSS config
├── tailwind.config.ts           # NEW — extends @jarvis/ui config
├── src/
│   ├── main.tsx                 # Add BrowserRouter
│   ├── App.tsx                  # Rewrite: PageShell + Routes
│   ├── App.css                  # DELETE (replaced by Tailwind)
│   ├── theme.ts                 # DELETE (moved to @jarvis/shared)
│   ├── i18n.ts                  # DELETE (moved to @jarvis/shared)
│   ├── content.ts               # KEEP (docs content data)
│   ├── legal.ts                 # KEEP (legal docs data)
│   ├── routes/                  # NEW
│   │   ├── home.tsx             # Landing page
│   │   └── doc-page.tsx         # Doc section viewer
│   └── components/
│       ├── Sidebar.tsx          # DELETE (use @jarvis/ui)
│       ├── DocsHome.tsx         # DELETE (moved to routes/home.tsx)
│       ├── DocPage.tsx          # DELETE (moved to routes/doc-page.tsx)
│       ├── Callout.tsx          # DELETE (rewritten inline with Tailwind)
│       └── ChatWidget.tsx       # Rewrite with @jarvis/ui + Tailwind
```

---

### Task 1: Root pnpm workspace setup

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `.npmrc`

- [ ] **Step 1: Verify pnpm is installed**

Run: `pnpm --version`
Expected: version number (e.g. `10.x.x`). If not installed, run `npm install -g pnpm`.

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
  - 'user-web'
  - 'admin-web'
  - 'docs-web'
```

- [ ] **Step 3: Create root package.json**

```json
{
  "private": true,
  "name": "jarvis-group",
  "scripts": {
    "dev:docs": "pnpm --filter docs-web dev",
    "dev:admin": "pnpm --filter admin-web dev",
    "dev:user": "pnpm --filter user-web dev",
    "build:docs": "pnpm --filter docs-web build",
    "build:admin": "pnpm --filter admin-web build",
    "build:user": "pnpm --filter user-web build",
    "build": "pnpm -r build",
    "test": "pnpm --filter @jarvis/shared test"
  }
}
```

- [ ] **Step 4: Create .npmrc**

```ini
shamefully-hoist=true
strict-peer-dependencies=false
```

- [ ] **Step 5: Run pnpm install to validate workspace**

Run: `cd /Users/crose/Documents/jarvis-group && pnpm install`
Expected: Installs dependencies for all workspace packages. No errors.

- [ ] **Step 6: Commit**

```bash
git init /Users/crose/Documents/jarvis-group
cd /Users/crose/Documents/jarvis-group
echo "node_modules/" > .gitignore
echo ".superpowers/" >> .gitignore
git add pnpm-workspace.yaml package.json .npmrc .gitignore
git commit -m "feat: init pnpm workspace for monorepo"
```

---

### Task 2: packages/ui — Tailwind + shadcn/ui init

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/tailwind.config.ts`
- Create: `packages/ui/postcss.config.js`
- Create: `packages/ui/src/globals.css`
- Create: `packages/ui/src/lib/utils.ts`

- [ ] **Step 1: Create packages/ui directory**

Run: `mkdir -p /Users/crose/Documents/jarvis-group/packages/ui/src/{components,layout,feedback,lib}`

- [ ] **Step 2: Create package.json**

```json
{
  "name": "@jarvis/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./globals.css": "./src/globals.css",
    "./tailwind.config": "./tailwind.config.ts"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0",
    "lucide-react": "^0.500.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "sonner": "^2.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "typescript": "~5.9.3",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Corporate palette
        background: {
          DEFAULT: '#060b18',
          secondary: '#0b1224',
          tertiary: '#111d3a',
          input: '#0d1529',
        },
        foreground: {
          DEFAULT: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        border: {
          DEFAULT: '#1e293b',
          hover: '#334155',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          cyan: '#0ea5e9',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        bubble: {
          user: '#4f46e5',
        },
        sidebar: {
          DEFAULT: '#0b1224',
          hover: '#111d3a',
          active: '#6366f1',
        },
        card: {
          DEFAULT: '#0b1224',
          hover: '#111d3a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['0.9375rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.3)',
        md: '0 4px 12px rgba(0,0,0,0.25)',
        lg: '0 8px 24px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 5: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Create src/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { @apply border-border; }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-size: 15px;
    line-height: 1.6;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { @apply bg-border rounded; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-accent; }
}
```

- [ ] **Step 7: Create src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 8: Install dependencies**

Run: `cd /Users/crose/Documents/jarvis-group && pnpm install`
Expected: All deps installed for packages/ui.

- [ ] **Step 9: Commit**

```bash
cd /Users/crose/Documents/jarvis-group
git add packages/ui/
git commit -m "feat(ui): init @jarvis/ui with Tailwind Dark Corporate theme"
```

---

### Task 3: packages/ui — shadcn/ui components

**Files:**
- Create: `packages/ui/components.json`
- Create: `packages/ui/src/components/button.tsx`
- Create: `packages/ui/src/components/input.tsx`
- Create: `packages/ui/src/components/card.tsx`
- Create: `packages/ui/src/components/badge.tsx`
- Create: `packages/ui/src/components/dialog.tsx`
- Create: `packages/ui/src/components/select.tsx`
- Create: `packages/ui/src/components/textarea.tsx`
- Create: `packages/ui/src/components/skeleton.tsx`
- Create: `packages/ui/src/components/sonner.tsx`

- [ ] **Step 1: Create components.json for shadcn CLI**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/globals.css",
    "baseColor": "slate",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 2: Add shadcn components via CLI**

Run each from `packages/ui/`:

```bash
cd /Users/crose/Documents/jarvis-group/packages/ui
npx shadcn@latest add button input card badge dialog select textarea skeleton sonner --yes
```

Expected: Components generated in `src/components/`. If the CLI asks questions, answer with defaults.

Note: If the shadcn CLI does not work cleanly in the monorepo context (path resolution issues), manually create the components. The key components are small — see shadcn/ui source for reference.

- [ ] **Step 3: Verify generated components exist**

Run: `ls /Users/crose/Documents/jarvis-group/packages/ui/src/components/`
Expected: `button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`, `dialog.tsx`, `select.tsx`, `textarea.tsx`, `skeleton.tsx`, `sonner.tsx`

- [ ] **Step 4: Commit**

```bash
cd /Users/crose/Documents/jarvis-group
git add packages/ui/
git commit -m "feat(ui): add shadcn base components (button, input, card, badge, dialog, select, textarea, skeleton, sonner)"
```

---

### Task 4: packages/ui — layout components

**Files:**
- Create: `packages/ui/src/layout/sidebar.tsx`
- Create: `packages/ui/src/layout/topbar.tsx`
- Create: `packages/ui/src/layout/page-shell.tsx`
- Create: `packages/ui/src/feedback/empty-state.tsx`
- Create: `packages/ui/src/feedback/error-boundary.tsx`
- Create: `packages/ui/src/index.ts`

- [ ] **Step 1: Create sidebar.tsx**

```tsx
import { cn } from '@/lib/utils'

export interface SidebarItem {
  id: string
  icon: React.ReactNode
  label: string
}

interface SidebarProps {
  items: SidebarItem[]
  activeId: string | null
  onSelect: (id: string) => void
  header?: React.ReactNode
  collapsed?: boolean
  className?: string
}

export function Sidebar({ items, activeId, onSelect, header, collapsed, className }: SidebarProps) {
  return (
    <aside className={cn(
      'fixed top-0 bottom-0 z-10 flex flex-col border-r border-border bg-sidebar overflow-y-auto transition-all duration-200',
      collapsed ? 'w-16' : 'w-[260px]',
      className
    )}>
      {header && (
        <div className="px-6 py-5 border-b border-border">
          {header}
        </div>
      )}
      <nav className="flex-1 py-3">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              'flex items-center gap-2.5 w-full px-6 py-2 text-sm text-left transition-all duration-100 border-l-[3px] border-transparent',
              'hover:bg-background hover:text-foreground',
              activeId === item.id && 'text-accent border-l-accent bg-background font-semibold'
            )}
          >
            <span className="w-[22px] text-center flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create topbar.tsx**

```tsx
import { cn } from '@/lib/utils'

interface TopbarProps {
  left?: React.ReactNode
  right?: React.ReactNode
  className?: string
}

export function Topbar({ left, right, className }: TopbarProps) {
  return (
    <header className={cn(
      'h-[52px] border-b border-border flex items-center justify-between px-6 bg-sidebar sticky top-0 z-5',
      className
    )}>
      <div className="flex items-center">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  )
}
```

- [ ] **Step 3: Create page-shell.tsx**

```tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar, type SidebarItem } from './sidebar'
import { Topbar } from './topbar'

interface PageShellProps {
  sidebarItems: SidebarItem[]
  activeId: string | null
  onNavigate: (id: string) => void
  sidebarHeader?: React.ReactNode
  topbarLeft?: React.ReactNode
  topbarRight?: React.ReactNode
  children: React.ReactNode
}

export function PageShell({
  sidebarItems, activeId, onNavigate,
  sidebarHeader, topbarLeft, topbarRight, children,
}: PageShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={sidebarItems}
        activeId={activeId}
        onSelect={onNavigate}
        header={sidebarHeader}
        collapsed={collapsed}
      />
      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-200',
        collapsed ? 'ml-16' : 'ml-[260px]'
      )}>
        <Topbar
          left={
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-foreground-muted hover:text-foreground transition-colors text-lg"
              >
                {collapsed ? '☰' : '✕'}
              </button>
              {topbarLeft}
            </div>
          }
          right={topbarRight}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create empty-state.tsx**

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-4xl mb-4 text-foreground-muted">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-foreground-secondary max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
```

- [ ] **Step 5: Create error-boundary.tsx**

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
          <h2 className="text-xl font-bold text-danger mb-2">Something went wrong</h2>
          <p className="text-sm text-foreground-secondary mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

- [ ] **Step 6: Create index.ts — re-export all components**

```typescript
// shadcn/ui components
export { Button, buttonVariants } from './components/button'
export { Input } from './components/input'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/card'
export { Badge, badgeVariants } from './components/badge'
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/dialog'
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/select'
export { Textarea } from './components/textarea'
export { Skeleton } from './components/skeleton'
export { Toaster } from './components/sonner'

// Layout
export { Sidebar, type SidebarItem } from './layout/sidebar'
export { Topbar } from './layout/topbar'
export { PageShell } from './layout/page-shell'

// Feedback
export { EmptyState } from './feedback/empty-state'
export { ErrorBoundary } from './feedback/error-boundary'

// Utils
export { cn } from './lib/utils'
```

Note: The exact export names from shadcn components may vary depending on the version generated by the CLI. After running `npx shadcn add`, check each generated file and adjust the index.ts exports to match the actual export names.

- [ ] **Step 7: Verify TypeScript compiles**

Run: `cd /Users/crose/Documents/jarvis-group/packages/ui && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 8: Commit**

```bash
cd /Users/crose/Documents/jarvis-group
git add packages/ui/
git commit -m "feat(ui): add layout components (Sidebar, Topbar, PageShell) and feedback (EmptyState, ErrorBoundary)"
```

---

### Task 5: packages/shared — types and API client

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/vitest.config.ts`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/api.ts`
- Create: `packages/shared/tests/api.test.ts`

- [ ] **Step 1: Create directory structure**

Run: `mkdir -p /Users/crose/Documents/jarvis-group/packages/shared/{src/hooks,tests}`

- [ ] **Step 2: Create package.json**

```json
{
  "name": "@jarvis/shared",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "~5.9.3",
    "@types/react": "^19.2.14",
    "vitest": "^3.0.0",
    "happy-dom": "^17.0.0"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
})
```

- [ ] **Step 5: Create src/types.ts**

```typescript
// ===== Language =====
export type Lang = 'ru' | 'en'

// ===== Theme =====
export type ThemeMode = 'dark' | 'light' | 'system'

// ===== Docs content types =====
export interface DocSection {
  id: string
  icon: string
  heading: string
  blocks: Block[]
}

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string; anchor?: string }
  | { type: 'h3'; text: string; anchor?: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; variant: 'info' | 'warning' | 'tip'; text: string }
  | { type: 'code'; lang: string; code: string }

// ===== Business entities (for future admin/user-web) =====
export interface Tenant {
  id: string
  company: string
  plan: string
  status: string
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  tenant_id: string
}

export interface Deal {
  id: string
  title: string
  value: number
  stage: string
  created_at: string
}

export interface Lead {
  id: string
  name: string
  source: string
  status: string
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  images?: string[]
  files?: { filename: string; url: string; type: string }[]
}
```

- [ ] **Step 6: Create src/api.ts**

```typescript
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

let baseUrl = ''
let onUnauthorized: (() => void) | null = null

export function configureApi(opts: { baseUrl?: string; onUnauthorized?: () => void }) {
  if (opts.baseUrl !== undefined) baseUrl = opts.baseUrl
  if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized
}

// ===== Token management =====

export function getToken(): string | null {
  return localStorage.getItem('jarvis_token') || sessionStorage.getItem('jarvis_token') || null
}

export function setToken(token: string, remember: boolean) {
  const store = remember ? localStorage : sessionStorage
  store.setItem('jarvis_token', token)
}

export function clearToken() {
  localStorage.removeItem('jarvis_token')
  sessionStorage.removeItem('jarvis_token')
}

// ===== Auth headers =====

function authHeaders(json = false): Record<string, string> {
  const h: Record<string, string> = {}
  const token = getToken()
  if (token) h['Authorization'] = `Bearer ${token}`
  if (json) h['Content-Type'] = 'application/json'
  return h
}

// ===== Core request =====

async function request(method: HttpMethod, path: string, body?: unknown): Promise<Response> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: authHeaders(body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) {
    clearToken()
    onUnauthorized?.()
  }
  return res
}

// ===== Typed helpers =====

export async function fetchJson<T = unknown>(path: string): Promise<T> {
  const res = await request('GET', path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

export async function postJson<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await request('POST', path, body)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

export async function patchJson<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await request('PATCH', path, body)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

export async function deleteResource(path: string): Promise<void> {
  const res = await request('DELETE', path)
  if (res.status !== 204 && !res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function uploadFormData(path: string, formData: FormData): Promise<Response> {
  const h: Record<string, string> = {}
  const token = getToken()
  if (token) h['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${baseUrl}${path}`, { method: 'POST', headers: h, body: formData })
  if (res.status === 401) {
    clearToken()
    onUnauthorized?.()
  }
  return res
}

// ===== SSE streaming =====

export interface SSECallbacks {
  onToken?: (text: string) => void
  onDone?: (messageId: string) => void
  onError?: (error: string) => void
  onFile?: (file: { filename: string; url: string; type: string }) => void
  onImage?: (image: { filename: string; url: string }) => void
  onStatus?: (status: string) => void
}

export async function streamSSE(
  path: string,
  body: unknown,
  callbacks: SSECallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok || !res.body) {
    callbacks.onError?.('server_error')
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let eventType = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim()
      } else if (line.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(line.slice(6))
          switch (eventType) {
            case 'token': callbacks.onToken?.(parsed.text); break
            case 'file': callbacks.onFile?.(parsed); break
            case 'image': callbacks.onImage?.(parsed); break
            case 'status': callbacks.onStatus?.(parsed.status); break
            case 'done': callbacks.onDone?.(parsed.message_id); break
            case 'error': callbacks.onError?.(parsed.error); break
            default:
              if (parsed.text) callbacks.onToken?.(parsed.text)
          }
        } catch { /* skip malformed */ }
      }
    }
  }
}
```

- [ ] **Step 7: Write test for API client**

Create `packages/shared/tests/api.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureApi, getToken, setToken, clearToken, fetchJson, postJson } from '../src/api'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  configureApi({ baseUrl: '' })
})

describe('token management', () => {
  it('returns null when no token set', () => {
    expect(getToken()).toBeNull()
  })

  it('stores and retrieves token (remember=true)', () => {
    setToken('test-token', true)
    expect(getToken()).toBe('test-token')
    expect(localStorage.getItem('jarvis_token')).toBe('test-token')
  })

  it('stores and retrieves token (remember=false)', () => {
    setToken('session-token', false)
    expect(getToken()).toBe('session-token')
    expect(sessionStorage.getItem('jarvis_token')).toBe('session-token')
  })

  it('clears token from both stores', () => {
    setToken('t1', true)
    setToken('t2', false)
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe('fetchJson', () => {
  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    await expect(fetchJson('/test')).rejects.toThrow('HTTP 404')
    vi.unstubAllGlobals()
  })

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: () => Promise.resolve({ data: 'hello' }),
    }))
    const result = await fetchJson('/test')
    expect(result).toEqual({ data: 'hello' })
    vi.unstubAllGlobals()
  })
})

describe('postJson', () => {
  it('sends JSON body and returns response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: () => Promise.resolve({ id: 1 }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await postJson('/api/items', { name: 'test' })
    expect(result).toEqual({ id: 1 })

    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/items')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ name: 'test' })
    vi.unstubAllGlobals()
  })
})
```

- [ ] **Step 8: Run tests**

Run: `cd /Users/crose/Documents/jarvis-group && pnpm install && pnpm --filter @jarvis/shared test`
Expected: All tests pass.

- [ ] **Step 9: Commit**

```bash
cd /Users/crose/Documents/jarvis-group
git add packages/shared/
git commit -m "feat(shared): add @jarvis/shared with types, API client, and tests"
```

---

### Task 6: packages/shared — i18n and hooks

**Files:**
- Create: `packages/shared/src/i18n.ts`
- Create: `packages/shared/src/hooks/use-translation.ts`
- Create: `packages/shared/src/hooks/use-theme.ts`
- Create: `packages/shared/src/hooks/use-sse.ts`
- Create: `packages/shared/src/hooks/use-auth.ts`
- Create: `packages/shared/src/hooks/index.ts`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/tests/i18n.test.ts`

- [ ] **Step 1: Create src/i18n.ts**

```typescript
import type { Lang } from './types'

export type TranslationDict = Record<string, string>
export type Translations = Record<Lang, TranslationDict>

let translations: Translations = { ru: {}, en: {} }

export function registerTranslations(appTranslations: Translations) {
  translations = {
    ru: { ...translations.ru, ...appTranslations.ru },
    en: { ...translations.en, ...appTranslations.en },
  }
}

export function translate(lang: Lang, key: string): string {
  return translations[lang]?.[key] ?? key
}

export function getStoredLang(storageKey = 'jarvis_lang'): Lang {
  return (localStorage.getItem(storageKey) as Lang) || 'ru'
}

export function storeLang(lang: Lang, storageKey = 'jarvis_lang') {
  localStorage.setItem(storageKey, lang)
}
```

- [ ] **Step 2: Create src/hooks/use-translation.ts**

```typescript
import { useState, useCallback } from 'react'
import type { Lang } from '../types'
import { translate, getStoredLang, storeLang, type Translations, registerTranslations } from '../i18n'

export function useTranslation(storageKey = 'jarvis_lang', appTranslations?: Translations) {
  if (appTranslations) registerTranslations(appTranslations)

  const [lang, setLangState] = useState<Lang>(() => getStoredLang(storageKey))

  const t = useCallback((key: string) => translate(lang, key), [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    storeLang(next, storageKey)
  }, [storageKey])

  const toggleLang = useCallback(() => {
    setLang(lang === 'ru' ? 'en' : 'ru')
  }, [lang, setLang])

  return { lang, t, setLang, toggleLang }
}
```

- [ ] **Step 3: Create src/hooks/use-theme.ts**

```typescript
import { useState, useEffect, useCallback } from 'react'
import type { ThemeMode } from '../types'

const STORAGE_KEY = 'jarvis_theme'

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'dark'
  })

  const resolved = resolveTheme(mode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    document.documentElement.classList.toggle('light', resolved === 'light')
  }, [resolved])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const cycleTheme = useCallback(() => {
    const next: ThemeMode = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark'
    setMode(next)
  }, [mode, setMode])

  const icon = mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '◑'

  return { mode, resolved, icon, setMode, cycleTheme }
}
```

- [ ] **Step 4: Create src/hooks/use-sse.ts**

```typescript
import { useRef, useCallback } from 'react'
import { streamSSE, type SSECallbacks } from '../api'

export function useSSE() {
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(async (
    path: string,
    body: unknown,
    callbacks: SSECallbacks,
  ) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    try {
      await streamSSE(path, body, callbacks, controller.signal)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        callbacks.onError?.('connection_failed')
      }
    }
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  return { send, stop }
}
```

- [ ] **Step 5: Create src/hooks/use-auth.ts**

```typescript
import { useState, useCallback } from 'react'
import { getToken, setToken, clearToken, configureApi, postJson } from '../api'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const token = getToken()
    return { token, isAuthenticated: !!token }
  })

  const login = useCallback(async (email: string, password: string, remember = false) => {
    const res = await postJson<{ token: string }>('/api/auth/login', { email, password })
    setToken(res.token, remember)
    setState({ token: res.token, isAuthenticated: true })
    return res
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setState({ token: null, isAuthenticated: false })
  }, [])

  // Wire up auto-logout on 401
  configureApi({ onUnauthorized: logout })

  return { ...state, login, logout }
}
```

- [ ] **Step 6: Create src/hooks/index.ts**

```typescript
export { useTranslation } from './use-translation'
export { useTheme } from './use-theme'
export { useSSE } from './use-sse'
export { useAuth } from './use-auth'
```

- [ ] **Step 7: Create src/index.ts — main entry point**

```typescript
// Types
export type { Lang, ThemeMode, DocSection, Block, Tenant, User, Deal, Lead, ChatMessage } from './types'

// API
export { configureApi, getToken, setToken, clearToken, fetchJson, postJson, patchJson, deleteResource, uploadFormData, streamSSE } from './api'
export type { SSECallbacks } from './api'

// i18n
export { registerTranslations, translate, getStoredLang, storeLang } from './i18n'
export type { Translations, TranslationDict } from './i18n'

// Hooks
export { useTranslation } from './hooks/use-translation'
export { useTheme } from './hooks/use-theme'
export { useSSE } from './hooks/use-sse'
export { useAuth } from './hooks/use-auth'
```

- [ ] **Step 8: Write i18n test**

Create `packages/shared/tests/i18n.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { registerTranslations, translate } from '../src/i18n'

beforeEach(() => {
  registerTranslations({
    ru: { 'hello': 'Привет', 'nav.home': 'Главная' },
    en: { 'hello': 'Hello', 'nav.home': 'Home' },
  })
})

describe('translate', () => {
  it('returns Russian translation', () => {
    expect(translate('ru', 'hello')).toBe('Привет')
  })

  it('returns English translation', () => {
    expect(translate('en', 'hello')).toBe('Hello')
  })

  it('returns key when translation missing', () => {
    expect(translate('ru', 'missing.key')).toBe('missing.key')
  })
})

describe('registerTranslations', () => {
  it('merges new translations', () => {
    registerTranslations({
      ru: { 'goodbye': 'Пока' },
      en: { 'goodbye': 'Bye' },
    })
    expect(translate('ru', 'goodbye')).toBe('Пока')
    expect(translate('ru', 'hello')).toBe('Привет')
  })
})
```

- [ ] **Step 9: Run all tests**

Run: `cd /Users/crose/Documents/jarvis-group && pnpm --filter @jarvis/shared test`
Expected: All tests pass (api + i18n).

- [ ] **Step 10: Commit**

```bash
cd /Users/crose/Documents/jarvis-group
git add packages/shared/
git commit -m "feat(shared): add i18n, useTranslation, useTheme, useSSE, useAuth hooks"
```

---

### Task 7: docs-web — workspace integration + Tailwind

**Files:**
- Modify: `docs-web/package.json`
- Modify: `docs-web/vite.config.ts`
- Modify: `docs-web/tsconfig.app.json`
- Create: `docs-web/postcss.config.js`
- Create: `docs-web/tailwind.config.ts`

- [ ] **Step 1: Update docs-web/package.json**

Add workspace dependencies and Tailwind:

```json
{
  "name": "docs-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.0.0",
    "@jarvis/ui": "workspace:*",
    "@jarvis/shared": "workspace:*"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@types/node": "^24.12.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.57.0",
    "vite": "^8.0.1",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

- [ ] **Step 2: Create docs-web/tailwind.config.ts**

```typescript
import baseConfig from '@jarvis/ui/tailwind.config'
import type { Config } from 'tailwindcss'

const config: Config = {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@jarvis/ui/src/**/*.{ts,tsx}',
  ],
}

export default config
```

- [ ] **Step 3: Create docs-web/postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 4: Update docs-web/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  server: { port: 5175 },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 5: Update docs-web/tsconfig.app.json**

Add path alias:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2023",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Install all deps**

Run: `cd /Users/crose/Documents/jarvis-group && pnpm install`
Expected: Workspace links resolved, react-router-dom installed, Tailwind installed.

- [ ] **Step 7: Verify Tailwind processes**

Run: `cd /Users/crose/Documents/jarvis-group/docs-web && npx tailwindcss --help`
Expected: Tailwind CLI help output, no errors.

- [ ] **Step 8: Commit**

```bash
cd /Users/crose/Documents/jarvis-group/docs-web
git add package.json postcss.config.js tailwind.config.ts vite.config.ts tsconfig.app.json
git commit -m "feat: integrate pnpm workspace, Tailwind CSS, React Router deps"
```

---

### Task 8: docs-web — rewrite App with React Router + PageShell

**Files:**
- Modify: `docs-web/src/main.tsx`
- Rewrite: `docs-web/src/App.tsx`
- Create: `docs-web/src/translations.ts`
- Delete: `docs-web/src/App.css`
- Delete: `docs-web/src/theme.ts`
- Delete: `docs-web/src/i18n.ts`

- [ ] **Step 1: Create src/translations.ts — docs-specific translations**

```typescript
import type { Translations } from '@jarvis/shared'

export const docsTranslations: Translations = {
  ru: {
    'docs.title': 'Документация',
    'docs.subtitle': 'Всё, что нужно знать для работы с платформой Jarvis',
    'docs.search': 'Поиск...',
    'nav.home': 'Главная',
    'nav.getting-started': 'Начало работы',
    'nav.staff': 'Управление сотрудниками',
    'nav.ai': 'AI-ассистент',
    'nav.modules': 'Модули',
    'nav.limits': 'Лимиты и квоты',
    'nav.plans': 'Тарифы',
    'nav.api': 'API',
    'nav.faq': 'FAQ',
    'home.card.getting-started': 'Регистрация, первый вход и обзор интерфейса',
    'home.card.staff': 'Добавление, роли, права и редактирование',
    'home.card.ai': 'Как работает чат, доступ к данным по должности',
    'home.card.modules': 'Лиды, сделки, финансы, маркетинг и другие',
    'home.card.limits': 'Запросы к AI, хранилище, сотрудники по тарифам',
    'home.card.plans': 'Старт, Бизнес, MAX, Enterprise — сравнение',
    'home.card.api': 'REST API для интеграций (MAX/Enterprise)',
    'home.card.faq': 'Ответы на частые вопросы',
    'lang.switch': 'EN',
    'back': '← На главную',
    'toc.title': 'На странице',
    'chat.title': 'Jarvis AI',
    'chat.subtitle': 'Спросите о возможностях Jarvis',
    'chat.placeholder': 'Ваш вопрос...',
    'chat.greeting': 'Привет! Я Jarvis AI. Задайте вопрос о платформе — тарифах, функциях, интеграциях.',
    'chat.error': 'Ошибка сервера',
    'chat.offline': 'Не удалось подключиться',
  },
  en: {
    'docs.title': 'Documentation',
    'docs.subtitle': 'Everything you need to know to work with the Jarvis platform',
    'docs.search': 'Search...',
    'nav.home': 'Home',
    'nav.getting-started': 'Getting Started',
    'nav.staff': 'Staff Management',
    'nav.ai': 'AI Assistant',
    'nav.modules': 'Modules',
    'nav.limits': 'Limits & Quotas',
    'nav.plans': 'Plans',
    'nav.api': 'API',
    'nav.faq': 'FAQ',
    'home.card.getting-started': 'Registration, first login and interface overview',
    'home.card.staff': 'Adding users, roles, permissions and editing',
    'home.card.ai': 'How chat works, data access by position',
    'home.card.modules': 'Leads, deals, finance, marketing and more',
    'home.card.limits': 'AI requests, storage, users per plan',
    'home.card.plans': 'Start, Business, MAX, Enterprise — comparison',
    'home.card.api': 'REST API for integrations (MAX/Enterprise)',
    'home.card.faq': 'Answers to common questions',
    'lang.switch': 'RU',
    'back': '← Back to home',
    'toc.title': 'On this page',
    'chat.title': 'Jarvis AI',
    'chat.subtitle': 'Ask about Jarvis features',
    'chat.placeholder': 'Your question...',
    'chat.greeting': 'Hi! I\'m Jarvis AI. Ask me about the platform — pricing, features, integrations.',
    'chat.error': 'Server error',
    'chat.offline': 'Connection failed',
  },
}
```

- [ ] **Step 2: Rewrite src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@jarvis/ui/globals.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_BASE || '/'}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 3: Rewrite src/App.tsx**

```tsx
import { useMemo } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { PageShell, Toaster, type SidebarItem } from '@jarvis/ui'
import { useTranslation, useTheme, configureApi } from '@jarvis/shared'
import { getSections } from './content'
import { docsTranslations } from './translations'
import DocsHome from './routes/home'
import DocPageRoute from './routes/doc-page'
import ChatWidget from './components/ChatWidget'

const API = import.meta.env.VITE_API_URL || ''
configureApi({ baseUrl: API })

function AppContent() {
  const { t, lang, toggleLang } = useTranslation('jarvis_docs_lang', docsTranslations)
  const { icon: themeIcon, cycleTheme } = useTheme()
  const navigate = useNavigate()
  const { sectionId } = useParams()

  const sections = useMemo(() => getSections(lang), [lang])

  const sidebarItems: SidebarItem[] = useMemo(() => [
    { id: '__home__', icon: '🏠', label: t('nav.home') },
    ...sections.map(s => ({ id: s.id, icon: s.icon, label: s.heading })),
  ], [sections, t])

  const handleNavigate = (id: string) => {
    if (id === '__home__') {
      navigate('/')
    } else {
      navigate(`/${id}`)
    }
    window.scrollTo(0, 0)
  }

  return (
    <PageShell
      sidebarItems={sidebarItems}
      activeId={sectionId ?? (window.location.pathname === '/' ? '__home__' : null)}
      onNavigate={handleNavigate}
      sidebarHeader={
        <div className="cursor-pointer" onClick={() => window.location.href = '/'}>
          <span className="text-lg font-extrabold bg-gradient-to-r from-accent to-accent-cyan bg-clip-text text-transparent">JARVIS</span>
          <span className="text-xs font-medium text-foreground-muted ml-1.5">docs</span>
        </div>
      }
      topbarLeft={
        sectionId ? (
          <button onClick={() => navigate('/')} className="text-sm text-foreground-secondary hover:text-accent transition-colors">
            {t('back')}
          </button>
        ) : undefined
      }
      topbarRight={
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="px-3 py-1 text-xs font-semibold border border-border rounded-md text-foreground-secondary hover:border-accent hover:text-accent transition-all"
          >
            {t('lang.switch')}
          </button>
          <button
            onClick={cycleTheme}
            className="px-3 py-1 text-xs font-semibold border border-border rounded-md text-foreground-secondary hover:border-accent hover:text-accent transition-all"
          >
            {themeIcon}
          </button>
        </div>
      }
    >
      <Routes>
        <Route index element={<DocsHome lang={lang} sections={sections} />} />
        <Route path=":sectionId" element={<DocPageRoute lang={lang} sections={sections} />} />
      </Routes>
      <ChatWidget lang={lang} t={t} />
      <Toaster />
    </PageShell>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<AppContent />} />
    </Routes>
  )
}
```

- [ ] **Step 4: Delete old files**

```bash
cd /Users/crose/Documents/jarvis-group/docs-web/src
rm -f App.css theme.ts i18n.ts
rm -f index.css
```

- [ ] **Step 5: Verify no import errors**

Run: `cd /Users/crose/Documents/jarvis-group/docs-web && npx tsc --noEmit`
Expected: May have errors from old components not yet migrated — that's ok, we'll fix in next tasks.

- [ ] **Step 6: Commit**

```bash
cd /Users/crose/Documents/jarvis-group/docs-web
git add -A
git commit -m "feat: rewrite App with React Router + PageShell, migrate to @jarvis/shared i18n"
```

---

### Task 9: docs-web — migrate routes (DocsHome + DocPage)

**Files:**
- Create: `docs-web/src/routes/home.tsx`
- Create: `docs-web/src/routes/doc-page.tsx`
- Delete: `docs-web/src/components/DocsHome.tsx`
- Delete: `docs-web/src/components/DocPage.tsx`
- Delete: `docs-web/src/components/Callout.tsx`
- Delete: `docs-web/src/components/Sidebar.tsx`

- [ ] **Step 1: Create src/routes/home.tsx**

```tsx
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@jarvis/ui'
import type { Lang, DocSection } from '@jarvis/shared'
import { translate } from '@jarvis/shared'

interface Props {
  lang: Lang
  sections: DocSection[]
}

export default function DocsHome({ lang, sections }: Props) {
  const navigate = useNavigate()
  const t = (key: string) => translate(lang, key)

  return (
    <div className="max-w-[900px] px-12 py-16">
      <div className="mb-12">
        <h1 className="text-[2.2rem] font-extrabold mb-2">{t('docs.title')}</h1>
        <p className="text-foreground-secondary text-lg">{t('docs.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(s => (
          <Card
            key={s.id}
            className="cursor-pointer border-border bg-card hover:border-accent hover:-translate-y-0.5 transition-all duration-150"
            onClick={() => { navigate(`/${s.id}`); window.scrollTo(0, 0) }}
          >
            <CardContent className="p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-[0.95rem] font-bold mb-1">{s.heading}</div>
              <div className="text-sm text-foreground-muted leading-snug">{t(`home.card.${s.id}`)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/routes/doc-page.tsx**

```tsx
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Badge, Skeleton } from '@jarvis/ui'
import type { Lang, DocSection, Block } from '@jarvis/shared'
import { translate } from '@jarvis/shared'

interface Props {
  lang: Lang
  sections: DocSection[]
}

export default function DocPageRoute({ lang, sections }: Props) {
  const { sectionId } = useParams()
  const section = sections.find(s => s.id === sectionId)

  const toc = useMemo(() => {
    if (!section) return []
    return section.blocks
      .filter((b): b is Block & { type: 'h2' } => b.type === 'h2')
      .map(b => ({ text: b.text, anchor: b.anchor ?? '' }))
  }, [section])

  if (!section) {
    return (
      <div className="p-12 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  return (
    <div className="flex flex-1">
      {/* Content */}
      <article className="flex-1 max-w-[760px] px-12 py-10">
        <h1 className="text-3xl font-extrabold mb-8 pb-4 border-b border-border">
          {section.icon} {section.heading}
        </h1>
        {section.blocks.map((block, i) => <RenderBlock key={i} block={block} />)}
      </article>

      {/* TOC */}
      {toc.length > 0 && (
        <nav className="w-[200px] min-w-[200px] px-4 pt-10 sticky top-[52px] self-start max-h-[calc(100vh-52px)] overflow-y-auto hidden lg:block">
          <div className="text-[0.7rem] font-bold uppercase tracking-wide text-foreground-muted mb-3">
            {translate(lang, 'toc.title')}
          </div>
          {toc.map((item, i) => (
            <a
              key={i}
              href={`#${item.anchor}`}
              onClick={e => {
                e.preventDefault()
                document.getElementById(item.anchor)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="block text-sm text-foreground-muted py-0.5 hover:text-accent transition-colors"
            >
              {item.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}

// ===== Block renderer =====

const calloutConfig = {
  info: { icon: 'i', label: 'Info', border: 'border-l-accent', bg: 'bg-accent/[0.08]', iconBg: 'bg-accent', labelColor: 'text-accent' },
  warning: { icon: '!', label: 'Warning', border: 'border-l-warning', bg: 'bg-warning/[0.08]', iconBg: 'bg-warning', labelColor: 'text-warning' },
  tip: { icon: '★', label: 'Tip', border: 'border-l-success', bg: 'bg-success/[0.08]', iconBg: 'bg-success', labelColor: 'text-success' },
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return <p className="text-foreground-secondary mb-4">{block.text}</p>
    case 'h2':
      return <h2 id={block.anchor} className="text-xl font-bold mt-10 mb-3 pt-2">{block.text}</h2>
    case 'h3':
      return <h3 id={block.anchor} className="text-base font-semibold mt-6 mb-2">{block.text}</h3>
    case 'list':
      return (
        <ul className="my-2 mb-4 ml-6 text-foreground-secondary list-disc marker:text-accent">
          {block.items.map((item, i) => <li key={i} className="mb-1">{item}</li>)}
        </ul>
      )
    case 'table':
      return (
        <div className="overflow-x-auto my-4 rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2.5 bg-sidebar text-foreground-muted font-semibold text-xs uppercase tracking-wider border-b border-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="hover:bg-background-secondary">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 border-b border-border text-foreground-secondary last:border-b-0">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'callout': {
      const cfg = calloutConfig[block.variant]
      return (
        <div className={`flex gap-3 p-4 rounded-lg my-4 text-sm leading-relaxed border-l-[3px] ${cfg.border} ${cfg.bg}`}>
          <span className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-white ${cfg.iconBg}`}>
            {cfg.icon}
          </span>
          <div>
            <div className={`font-bold text-xs uppercase tracking-wider mb-0.5 ${cfg.labelColor}`}>{cfg.label}</div>
            <div>{block.text}</div>
          </div>
        </div>
      )
    }
    case 'code':
      return (
        <pre className="bg-sidebar border border-border rounded-lg px-5 py-4 my-4 overflow-x-auto text-sm leading-relaxed font-mono text-foreground-secondary whitespace-pre">
          <code>{block.code}</code>
        </pre>
      )
  }
}
```

- [ ] **Step 3: Delete old components**

```bash
cd /Users/crose/Documents/jarvis-group/docs-web/src
rm -f components/Sidebar.tsx components/DocsHome.tsx components/DocPage.tsx components/Callout.tsx
```

- [ ] **Step 4: Commit**

```bash
cd /Users/crose/Documents/jarvis-group/docs-web
git add -A
git commit -m "feat: migrate DocsHome + DocPage to Tailwind routes, delete old components"
```

---

### Task 10: docs-web — rewrite ChatWidget

**Files:**
- Rewrite: `docs-web/src/components/ChatWidget.tsx`

- [ ] **Step 1: Rewrite ChatWidget with Tailwind + @jarvis/shared**

```tsx
import { useState, useRef, useEffect } from 'react'
import { Button, Input } from '@jarvis/ui'
import { streamSSE } from '@jarvis/shared'
import type { Lang } from '@jarvis/shared'

type Message = { role: 'user' | 'ai'; text: string }

interface Props {
  lang: Lang
  t: (key: string) => string
}

export default function ChatWidget({ lang, t }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'ai', text: t('chat.greeting') }])
    }
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    const history = messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', text: m.text }))
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    let aiText = ''
    setMessages(prev => [...prev, { role: 'ai', text: '' }])

    try {
      await streamSSE('/api/chat/docs', { text, history, lang }, {
        onToken: (token) => {
          aiText += token
          setMessages(prev => {
            const copy = [...prev]
            copy[copy.length - 1] = { role: 'ai', text: aiText }
            return copy
          })
        },
        onError: () => {
          setMessages(prev => {
            const copy = [...prev]
            copy[copy.length - 1] = { role: 'ai', text: t('chat.error') }
            return copy
          })
        },
      })
    } catch {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'ai', text: t('chat.offline') }
        return copy
      })
    }
    setLoading(false)
  }

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-cyan border-none cursor-pointer shadow-lg flex items-center justify-center text-2xl text-white hover:scale-110 transition-transform"
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] rounded-xl bg-background-secondary border border-border shadow-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-gradient-to-r from-accent/10 to-accent-cyan/10">
            <div>
              <div className="font-bold text-[0.95rem]">{t('chat.title')}</div>
              <div className="text-[0.7rem] text-foreground-muted">{t('chat.subtitle')}</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-foreground-muted hover:text-foreground transition-colors text-lg p-1" aria-label="Close">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'self-end bg-gradient-to-br from-accent to-bubble-user text-white'
                    : 'self-start bg-background-tertiary text-foreground'
                }`}
              >
                {msg.text || (loading && i === messages.length - 1 ? '...' : '')}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={t('chat.placeholder')}
              disabled={loading}
              className="flex-1 bg-background border-border text-sm"
            />
            <Button
              onClick={send}
              disabled={loading || !input.trim()}
              size="sm"
              className="bg-accent hover:bg-accent-hover text-white"
            >
              →
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/crose/Documents/jarvis-group/docs-web
git add -A
git commit -m "feat: rewrite ChatWidget with Tailwind + @jarvis/shared SSE"
```

---

### Task 11: docs-web — responsive design + mobile

**Files:**
- Modify: `docs-web/src/App.tsx` (add mobile sidebar toggle)
- Modify: `packages/ui/src/layout/page-shell.tsx` (responsive sidebar)

- [ ] **Step 1: Update PageShell with responsive sidebar**

In `packages/ui/src/layout/page-shell.tsx`, replace the existing component:

```tsx
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar, type SidebarItem } from './sidebar'
import { Topbar } from './topbar'

interface PageShellProps {
  sidebarItems: SidebarItem[]
  activeId: string | null
  onNavigate: (id: string) => void
  sidebarHeader?: React.ReactNode
  topbarLeft?: React.ReactNode
  topbarRight?: React.ReactNode
  children: React.ReactNode
}

export function PageShell({
  sidebarItems, activeId, onNavigate,
  sidebarHeader, topbarLeft, topbarRight, children,
}: PageShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [activeId])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <div className={cn(
        'lg:block',
        mobileOpen ? 'block' : 'hidden'
      )}>
        <Sidebar
          items={sidebarItems}
          activeId={activeId}
          onSelect={(id) => { onNavigate(id); setMobileOpen(false) }}
          header={sidebarHeader}
          collapsed={collapsed}
          className={cn(mobileOpen && 'z-30')}
        />
      </div>

      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-200',
        collapsed ? 'lg:ml-16' : 'lg:ml-[260px]',
        'ml-0' // mobile: no margin
      )}>
        <Topbar
          left={
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden text-foreground-muted hover:text-foreground transition-colors text-lg"
              >
                ☰
              </button>
              {/* Desktop collapse */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block text-foreground-muted hover:text-foreground transition-colors text-lg"
              >
                {collapsed ? '☰' : '✕'}
              </button>
              {topbarLeft}
            </div>
          }
          right={topbarRight}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add responsive tweaks to docs home route**

In `docs-web/src/routes/home.tsx`, update the container padding for mobile:

Change the outer div className from:
```
"max-w-[900px] px-12 py-16"
```
To:
```
"max-w-[900px] px-4 sm:px-8 lg:px-12 py-8 lg:py-16"
```

Change the heading from `text-[2.2rem]` to `text-2xl sm:text-[2.2rem]`.

- [ ] **Step 3: Add responsive tweaks to doc page route**

In `docs-web/src/routes/doc-page.tsx`, update article padding:

Change from:
```
"flex-1 max-w-[760px] px-12 py-10"
```
To:
```
"flex-1 max-w-[760px] px-4 sm:px-8 lg:px-12 py-6 lg:py-10"
```

- [ ] **Step 4: Make ChatWidget responsive**

In `docs-web/src/components/ChatWidget.tsx`, update the chat panel div className:

Change from:
```
"fixed bottom-6 right-6 z-50 w-[380px] h-[520px] rounded-xl ..."
```
To:
```
"fixed z-50 rounded-xl ... bottom-0 right-0 w-full h-[100dvh] sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[520px] sm:rounded-xl"
```

This makes chat fullscreen on mobile, panel on desktop.

- [ ] **Step 5: Verify dev server starts**

Run: `cd /Users/crose/Documents/jarvis-group && pnpm dev:docs`
Expected: Vite starts on port 5175, no errors in console. Open http://localhost:5175 in browser.

- [ ] **Step 6: Commit**

```bash
cd /Users/crose/Documents/jarvis-group/docs-web
git add -A
cd /Users/crose/Documents/jarvis-group
git add packages/ui/
git -C docs-web commit -m "feat: responsive design — mobile sidebar, fullscreen chat"
git commit -m "feat(ui): responsive PageShell with mobile hamburger menu"
```

---

### Task 12: docs-web — cleanup and verify

**Files:**
- Remove: `docs-web/src/index.css` (if not already deleted)
- Verify: all old component files are deleted
- Verify: dev server runs cleanly

- [ ] **Step 1: Clean up remaining old files**

```bash
cd /Users/crose/Documents/jarvis-group/docs-web/src
rm -f index.css
# Verify old components directory is clean
ls components/
# Should only have: ChatWidget.tsx
```

- [ ] **Step 2: Update index.html if needed**

Check `docs-web/index.html` — if it references `index.css`, remove that reference.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/crose/Documents/jarvis-group/docs-web && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Verify dev server runs**

Run: `cd /Users/crose/Documents/jarvis-group && pnpm dev:docs`
Expected: Vite starts, page loads at http://localhost:5175 with Dark Corporate theme.

Verify:
- Sidebar renders with all doc sections
- Clicking a section navigates to `/section-id` URL
- Back button works
- Theme toggle works
- Language toggle works
- ChatWidget opens/closes
- TOC renders on doc pages
- Responsive: resize browser to mobile width, sidebar becomes hamburger menu

- [ ] **Step 5: Verify production build**

Run: `cd /Users/crose/Documents/jarvis-group && pnpm build:docs`
Expected: Build succeeds, output in `docs-web/dist/`.

- [ ] **Step 6: Final commit**

```bash
cd /Users/crose/Documents/jarvis-group/docs-web
git add -A
git commit -m "feat: docs-web migration complete — Tailwind + shadcn/ui + React Router"
```

---

## Self-Review

**Spec coverage check:**
- ✅ pnpm monorepo with packages/ui and packages/shared
- ✅ Dark Corporate theme with all design tokens
- ✅ shadcn/ui components (button, input, card, badge, dialog, select, textarea, skeleton, toast)
- ✅ Layout components (Sidebar, Topbar, PageShell)
- ✅ Feedback components (EmptyState, ErrorBoundary)
- ✅ Shared API client with SSE
- ✅ Shared i18n with useTranslation hook
- ✅ Shared hooks (useAuth, useSSE, useTheme)
- ✅ React Router in docs-web
- ✅ Responsive design with mobile sidebar
- ✅ ChatWidget rewritten with @jarvis/shared SSE
- ✅ docs-web fully migrated as design system test bed

**Not in this plan (separate plans):**
- admin-web migration (Plan 2)
- user-web migration (Plan 3)
- DataTable component (not needed for docs-web, added in Plan 2)
- SSE push-updates for content pages (Plan 3, user-web specific)
