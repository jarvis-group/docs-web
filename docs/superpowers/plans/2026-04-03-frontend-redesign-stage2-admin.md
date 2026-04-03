# Frontend Redesign Stage 2: admin-web Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate admin-web from 872-line monolith with inline styles to Tailwind + @jarvis/ui + React Router, splitting into focused page components.

**Architecture:** admin-web consumes @jarvis/ui and @jarvis/shared from pnpm workspace. App.tsx split into 5 page components + shared layout. Custom admin auth (different endpoint from user-web) with shared API client for data fetching.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind CSS, shadcn/ui (@jarvis/ui), React Router, @jarvis/shared (api, i18n), Vite 8, pnpm workspace

---

## File Structure

### New files
```
admin-web/
├── tailwind.config.ts           # extends @jarvis/ui
├── postcss.config.js
├── src/
│   ├── translations.ts          # admin-specific ru/en translations
│   ├── pages/
│   │   ├── login.tsx            # Admin login page
│   │   ├── tenants.tsx          # Tenant list + detail with tabs
│   │   ├── servers.tsx          # Server management by type
│   │   ├── analytics.tsx        # MRR, subscriptions analytics
│   │   └── settings.tsx         # Role assignment
│   └── App.tsx                  # Rewritten: PageShell + Routes
```

### Modified files
```
admin-web/
├── package.json                 # Add workspace deps, Tailwind, React Router
├── vite.config.ts               # Add path alias
├── tsconfig.app.json            # Add path alias
├── src/main.tsx                 # BrowserRouter + globals.css
```

### Deleted files
```
admin-web/src/App.css            # Replaced by Tailwind
admin-web/src/i18n.ts            # Moved to @jarvis/shared translations
admin-web/src/Logo.tsx           # Use from @jarvis/ui
admin-web/src/index.css          # Replaced by globals.css
```

---

### Task 1: Workspace integration + Tailwind config

**Files:**
- Modify: `admin-web/package.json`
- Create: `admin-web/tailwind.config.ts`
- Create: `admin-web/postcss.config.js`
- Modify: `admin-web/vite.config.ts`
- Modify: `admin-web/tsconfig.app.json`

- [ ] **Step 1: Update package.json**

Replace entire contents with:
```json
{
  "name": "admin-web",
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

- [ ] **Step 2: Create tailwind.config.ts**

Same pattern as docs-web — extend @jarvis/ui config:
```typescript
import baseConfig from '../../packages/ui/tailwind.config'
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

Note: Use relative path to packages/ui/tailwind.config if workspace import doesn't resolve.

- [ ] **Step 3: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 4: Update vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  server: { port: 5174 },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../packages/ui/src'),
    },
  },
})
```

- [ ] **Step 5: Update tsconfig.app.json**

Add paths alias matching vite config:
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
      "@/*": ["../packages/ui/src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Run pnpm install**

Run: `cd /Users/crose/Documents/jarvis-group && pnpm install`

- [ ] **Step 7: Commit**

```bash
cd /Users/crose/Documents/jarvis-group/admin-web
git add package.json tailwind.config.ts postcss.config.js vite.config.ts tsconfig.app.json
git commit -m "feat: integrate pnpm workspace, Tailwind CSS, React Router deps"
```

---

### Task 2: Create translations + App shell + Router

**Files:**
- Create: `admin-web/src/translations.ts`
- Rewrite: `admin-web/src/main.tsx`
- Rewrite: `admin-web/src/App.tsx` (shell only — pages come in later tasks)

- [ ] **Step 1: Create translations.ts**

Read the existing `/Users/crose/Documents/jarvis-group/admin-web/src/i18n.ts` and port ALL translation keys to the @jarvis/shared format. The file has ~140 keys per language. Include all of them. Additionally add keys for the login page (currently hardcoded Russian in LoginPage component).

Structure:
```typescript
import type { Translations } from '@jarvis/shared'

export const adminTranslations: Translations = {
  ru: {
    // Port ALL keys from current i18n.ts
    // Add login.* keys for login page
    // Add any hardcoded Russian strings from App.tsx
  },
  en: {
    // Port ALL English keys from current i18n.ts
    // Add login.* keys
  },
}
```

- [ ] **Step 2: Rewrite main.tsx**

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

- [ ] **Step 3: Rewrite App.tsx — shell with PageShell + Routes**

The admin has a login gate — if no token, show LoginPage. Otherwise show PageShell with routes.

Key differences from docs-web:
- Admin login uses `/auth/admin/login` endpoint (NOT `/api/auth/login`)
- Token stored via setToken() from @jarvis/shared
- Admin has sidebar sections (Management, Finance, System) with nav items
- Footer in sidebar shows admin name + logout button + language switcher

```tsx
import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { PageShell, Logo, Toaster, type SidebarItem } from '@jarvis/ui'
import { useTranslation, useTheme, configureApi, getToken, setToken, clearToken, fetchJson } from '@jarvis/shared'
import { adminTranslations } from './translations'
import LoginPage from './pages/login'
import TenantsPage from './pages/tenants'
import ServersPage from './pages/servers'
import AnalyticsPage from './pages/analytics'
import SettingsPage from './pages/settings'

const API = import.meta.env.VITE_API_URL || ''

export default function App() {
  const { t, lang, toggleLang } = useTranslation('admin_lang', adminTranslations)
  const { icon: themeIcon, cycleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [token, setTokenState] = useState<string | null>(getToken())
  const [adminName, setAdminName] = useState(localStorage.getItem('admin_name') || '')

  const logout = useCallback(() => {
    clearToken()
    localStorage.removeItem('admin_name')
    sessionStorage.removeItem('admin_name')
    setTokenState(null)
    setAdminName('')
  }, [])

  useEffect(() => {
    configureApi({ baseUrl: API, onUnauthorized: logout })
  }, [logout])

  const handleLogin = (newToken: string, name: string) => {
    setTokenState(newToken)
    setAdminName(name)
  }

  if (!token) {
    return <LoginPage onLogin={handleLogin} t={t} />
  }

  // Derive active page from URL
  const pathSegment = location.pathname.split('/')[1] || 'tenants'

  const sidebarItems: SidebarItem[] = [
    { id: 'tenants', icon: '🏢', label: t('nav.tenants') },
    { id: 'servers', icon: '🖥️', label: t('nav.servers') },
    { id: 'analytics', icon: '📊', label: t('nav.analytics') },
    { id: 'settings', icon: '⚙️', label: t('nav.settings') },
  ]

  return (
    <PageShell
      sidebarItems={sidebarItems}
      activeId={pathSegment}
      onNavigate={(id) => { navigate(`/${id}`); window.scrollTo(0, 0) }}
      sidebarHeader={(collapsed) => (
        <div className="cursor-pointer flex items-center gap-2 justify-center" onClick={() => navigate('/tenants')}>
          <Logo size={collapsed ? 36 : 40} />
          {!collapsed && (
            <span className="text-lg font-extrabold bg-gradient-to-r from-accent to-accent-cyan bg-clip-text text-transparent">
              Admin
            </span>
          )}
        </div>
      )}
      topbarLeft={
        <span className="text-sm font-semibold text-foreground-secondary">
          {pathSegment === 'tenants' ? t('nav.tenants') :
           pathSegment === 'servers' ? t('nav.servers') :
           pathSegment === 'analytics' ? t('nav.analytics') : t('nav.settings')}
        </span>
      }
      topbarRight={
        <div className="flex items-center gap-3">
          <button onClick={toggleLang} className="px-3 py-1 text-xs font-semibold border border-border rounded-md text-foreground-secondary hover:border-accent hover:text-accent transition-all">
            {lang === 'ru' ? 'EN' : 'RU'}
          </button>
          <button onClick={cycleTheme} className="px-3 py-1 text-xs font-semibold border border-border rounded-md text-foreground-secondary hover:border-accent hover:text-accent transition-all">
            {themeIcon}
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="text-right">
              <div className="text-xs font-semibold">{adminName}</div>
              <div className="text-[0.65rem] text-foreground-muted">Super Admin</div>
            </div>
            <button onClick={logout} className="px-2 py-1 text-xs border border-border rounded-md text-foreground-secondary hover:text-danger hover:border-danger transition-all">
              {t('logout')}
            </button>
          </div>
        </div>
      }
    >
      <div className="p-6">
        <Routes>
          <Route index element={<TenantsPage t={t} lang={lang} />} />
          <Route path="tenants/*" element={<TenantsPage t={t} lang={lang} />} />
          <Route path="servers" element={<ServersPage t={t} />} />
          <Route path="analytics" element={<AnalyticsPage t={t} />} />
          <Route path="settings" element={<SettingsPage t={t} />} />
        </Routes>
      </div>
      <Toaster />
    </PageShell>
  )
}
```

Note: The page components (LoginPage, TenantsPage, etc.) will be created as stubs first, then fully implemented in subsequent tasks.

- [ ] **Step 4: Create stub pages so the app compiles**

Create minimal stub files for each page:

`src/pages/login.tsx`:
```tsx
export default function LoginPage({ onLogin, t }: { onLogin: (token: string, name: string) => void; t: (k: string) => string }) {
  return <div>Login stub</div>
}
```

Similar stubs for tenants.tsx, servers.tsx, analytics.tsx, settings.tsx — each accepting `{ t: (k: string) => string }` prop (and `lang` for tenants).

- [ ] **Step 5: Delete old files**

```bash
rm -f src/App.css src/i18n.ts src/Logo.tsx src/index.css
```

- [ ] **Step 6: Verify tsc compiles, commit**

---

### Task 3: Migrate LoginPage

**Files:**
- Rewrite: `admin-web/src/pages/login.tsx`

Port the LoginPage from App.tsx lines 22-118. Replace all inline styles with Tailwind classes. Use Button, Input from @jarvis/ui. Use Logo from @jarvis/ui. Use setToken from @jarvis/shared to store the token after login.

Key behavior:
- POST to `/auth/admin/login` with { login, password }
- Remember me: localStorage vs sessionStorage for token
- On success: call `onLogin(token, name)` and store `admin_name`
- Error states: wrong password, server error, server unavailable

The login page should be a full-screen centered form on dark background, matching the Dark Corporate aesthetic.

- [ ] **Step 1: Implement full LoginPage with Tailwind**

Read the current implementation from the old App.tsx (lines 22-118 which are preserved in git history, or reference the plan above) and rewrite with:
- `Logo` from `@jarvis/ui` centered above the form
- `Input` from `@jarvis/ui` for login/password fields
- `Button` from `@jarvis/ui` for submit
- `setToken()` from `@jarvis/shared` for token storage
- All Tailwind classes, zero inline styles

- [ ] **Step 2: Verify login page renders, commit**

---

### Task 4: Migrate TenantsPage

**Files:**
- Rewrite: `admin-web/src/pages/tenants.tsx`

This is the largest page — it has two modes:
1. **Tenant list** — grid of tenant cards with status/plan badges, MRR, quota progress bars, "Add tenant" form
2. **Tenant detail** — overview stats, staff table with "Add staff" form + credentials popup, tabs for leads/deals/knowledge/workflows/emails

Port from App.tsx lines 302-537. Key points:
- Use Card from @jarvis/ui for stat cards and tenant cards
- Use Badge from @jarvis/ui for status/plan/role tags
- Use Dialog from @jarvis/ui for create forms (instead of inline show/hide state)
- Use Button, Input, Select from @jarvis/ui
- Use fetchJson, postJson, patchJson from @jarvis/shared
- Format money with Intl.NumberFormat (existing pattern)
- All Tailwind classes

The tenant detail tabs (leads, deals, knowledge, workflows, emails) use a generic renderTable function — port this as a local helper.

- [ ] **Step 1: Implement tenant list view with Card grid**
- [ ] **Step 2: Implement tenant detail view with tabs**
- [ ] **Step 3: Implement create tenant Dialog**
- [ ] **Step 4: Implement create staff Dialog + credentials popup**
- [ ] **Step 5: Verify all tenant functionality works, commit**

---

### Task 5: Migrate ServersPage

**Files:**
- Rewrite: `admin-web/src/pages/servers.tsx`

Port from App.tsx lines 539-694. Features:
- Server stats cards (total, online, offline, unknown)
- Servers grouped by type (backend, web, inference, training) with color-coded headers
- Each server card: name, status dot, host:port, specs, health endpoint, check/delete buttons
- "Add server" form
- "Check all" button

Use Card, Button, Input, Select, Badge, Dialog from @jarvis/ui. All Tailwind.

- [ ] **Step 1: Implement servers page with grouped cards**
- [ ] **Step 2: Implement add server Dialog**
- [ ] **Step 3: Verify, commit**

---

### Task 6: Migrate AnalyticsPage

**Files:**
- Rewrite: `admin-web/src/pages/analytics.tsx`

Port from App.tsx lines 696-745. Simple page:
- 4 stat cards (Total MRR, Overage revenue, Active subs, Trial subs)
- Subscriptions table with all tenants

Use Card, Badge from @jarvis/ui. All Tailwind.

- [ ] **Step 1: Implement analytics page**
- [ ] **Step 2: Verify, commit**

---

### Task 7: Migrate SettingsPage

**Files:**
- Rewrite: `admin-web/src/pages/settings.tsx`

Port from App.tsx lines 747-807. Features:
- Role assignment form: select tenant → select user → select role → save
- Staff list loads when tenant selected

Use Card, Button, Select from @jarvis/ui. All Tailwind.

- [ ] **Step 1: Implement settings page**
- [ ] **Step 2: Verify, commit**

---

### Task 8: Responsive design + cleanup + verify

**Files:**
- Modify: multiple pages for responsive tweaks

- [ ] **Step 1: Add responsive breakpoints to all pages**

- Stat grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Tables: `overflow-x-auto` wrapper
- Forms: max-w with responsive padding
- Tenant cards: responsive grid

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/crose/Documents/jarvis-group/admin-web && npx tsc --noEmit`

- [ ] **Step 3: Verify production build**

Run: `cd /Users/crose/Documents/jarvis-group/admin-web && npx vite build`

- [ ] **Step 4: Final commit**

```bash
cd /Users/crose/Documents/jarvis-group/admin-web
git add -A
git commit -m "feat: admin-web migration complete — Tailwind + shadcn/ui + React Router"
```

---

## Notes for implementers

### Admin auth flow
- Login endpoint: `POST /auth/admin/login` (NOT `/api/auth/login`)
- Body: `{ login, password }` (NOT `{ email, password }`)
- Response: `{ token, name }`
- Store token via `setToken(token, remember)` from `@jarvis/shared`
- Store admin name in localStorage/sessionStorage as `admin_name`
- The shared `useAuth` hook is NOT used — admin has different login endpoint

### Data fetching
- Use `fetchJson`, `postJson`, `patchJson` from `@jarvis/shared`
- These auto-attach Bearer token from `getToken()`
- 401 → auto-logout via `configureApi({ onUnauthorized: logout })`

### Existing API endpoints (all require admin JWT)
- `GET /admin/tenants` — list tenants
- `POST /admin/tenants` — create tenant
- `GET /admin/tenants/:id/staff` — list staff
- `POST /admin/tenants/:id/staff` — create staff member
- `PATCH /admin/tenants/:id/staff/:uid/role` — change role
- `GET /admin/servers` — list servers
- `POST /admin/servers` — create server
- `POST /admin/servers/:id/check` — health check
- `DELETE /admin/servers/:id` — delete server
