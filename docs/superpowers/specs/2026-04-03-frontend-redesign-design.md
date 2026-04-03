# Frontend Redesign — Shared Design System + UX Improvements

**Date:** 2026-04-03
**Status:** Approved
**Scope:** All three frontends (user-web, admin-web, docs-web) + shared packages

## Summary

Migrate all three Jarvis frontends from custom inline CSS to a shared design system built on Tailwind CSS + shadcn/ui, organized as a pnpm monorepo. Visual direction: Dark Corporate (indigo/cyan, like Linear/Vercel). Add UX improvements: responsive design, skeleton loaders, toast notifications, SSE push-updates for content pages, React Router.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Visual direction | Dark Corporate | Серьёзный, технологичный стиль для бизнес AI-платформы |
| UI framework | Tailwind CSS + shadcn/ui | De facto стандарт, компоненты копируются в проект (не npm dep), полный контроль |
| Routing | React Router | 19+ страниц, deep links, browser history |
| Monorepo | pnpm workspaces | Один репозиторий уже, packages/ui + packages/shared |
| Design system approach | shadcn/ui в packages/ui | Один источник правды, без drift |
| Migration order | docs-web → admin-web → user-web | От простого к сложному, обкатка design system на маленьком проекте |
| Scope | Visual refresh + UX improvements | Функционал 1:1, улучшенный визуал и UX |

## 1. Monorepo Structure

```
jarvis-group/
├── packages/
│   ├── ui/                    # @jarvis/ui — shared shadcn/ui components
│   │   ├── src/
│   │   │   ├── components/    # Button, Input, Card, Dialog, Table...
│   │   │   ├── lib/           # utils (cn, formatters)
│   │   │   └── index.ts       # re-exports
│   │   ├── tailwind.config.ts # Jarvis Dark Corporate theme
│   │   ├── globals.css        # Tailwind base + CSS variables
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── shared/                # @jarvis/shared — business logic
│       ├── src/
│       │   ├── api.ts         # centralized API client
│       │   ├── i18n.ts        # translations (ru/en)
│       │   ├── types.ts       # shared TypeScript types
│       │   └── hooks/         # useAuth, useSSE, useTheme, useTranslation
│       └── package.json
├── user-web/                  # imports @jarvis/ui, @jarvis/shared
├── admin-web/
├── docs-web/
├── backend/
├── pnpm-workspace.yaml
└── package.json               # root scripts
```

## 2. Design Tokens (Dark Corporate)

### Colors
```
bg-primary:     #060b18     (основной фон)
bg-secondary:   #0b1224     (карточки, sidebar)
bg-tertiary:    #111d3a     (hover, elevated)
bg-input:       #0d1529     (поля ввода)
border:         #1e293b     (границы)
border-hover:   #334155     (границы при hover)
text-primary:   #e2e8f0     (основной текст)
text-secondary: #94a3b8     (вторичный)
text-muted:     #64748b     (приглушённый)
accent:         #6366f1     (indigo — основной акцент)
accent-hover:   #818cf8     (indigo lighter)
accent-cyan:    #0ea5e9     (cyan — вторичный акцент)
success:        #10b981
warning:        #f59e0b
danger:         #ef4444
bubble-user:    #4f46e5     (сообщения пользователя)
```

### Typography
```
font-sans: Inter, system-ui
font-mono: JetBrains Mono, monospace
Scale: xs(12) sm(14) base(15) lg(18) xl(20) 2xl(24)
```

### Border Radius
```
sm: 6px   (badges, tags)
md: 8px   (inputs, buttons)
lg: 12px  (cards, panels)
xl: 16px  (modals, chat bubbles)
```

### Shadows
```
sm: 0 1px 2px rgba(0,0,0,0.3)
md: 0 4px 12px rgba(0,0,0,0.25)
lg: 0 8px 24px rgba(0,0,0,0.3)
```

## 3. Shared Components (packages/ui)

18 компонентов покрывающих все текущие потребности:

### Layout
- `Sidebar` — навигация, collapsible, иконки
- `Topbar` — header, тема, язык, профиль
- `PageShell` — обёртка (sidebar + topbar + main content + Outlet)

### Data Display
- `DataTable` — таблицы с сортировкой, фильтрацией
- `Card` — карточки метрик и контента
- `Badge` — статусы, роли, теги
- `Skeleton` — loading states

### Forms
- `Button`, `Input`, `Select`, `Textarea` — базовые элементы
- `Dialog` — модальные окна
- `Form` — валидация

### Chat
- `ChatBubble` — сообщения (markdown, images, files)
- `ChatInput` — ввод с file/image upload
- `ChatSidebar` — история чатов

### Feedback
- `Toast` — уведомления
- `EmptyState` — пустые списки
- `ErrorBoundary` — обработка ошибок

## 4. Shared Business Logic (packages/shared)

### API Client (api.ts)
- Единый клиент с `VITE_API_URL`
- JWT auth interceptor
- SSE streaming helper
- Типизированные методы: `api.deals.list()`, `api.tenants.create()`
- Error handling → Toast notifications

### i18n (i18n.ts)
- Единая система: common keys + namespace per app
- `useTranslation()` хук вместо пропс-дриллинга `t`
- RU/EN, localStorage persistence

### Types (types.ts)
- `Tenant`, `User`, `Deal`, `Lead`, `Contract`, `Task`, `ChatMessage`

### Hooks
- `useAuth()` — login/logout, token, роль, profile
- `useSSE()` — SSE streaming с reconnect, push-updates для контентных страниц
- `useTheme()` — dark theme + localStorage

## 5. UX Improvements

### Responsive Design
- Mobile-first breakpoints: sm(640) md(768) lg(1024) xl(1280)
- Sidebar → hamburger menu на мобильных
- Таблицы → карточки на маленьких экранах
- Chat на мобильном — полноэкранный

### Loading States
- Skeleton loaders на всех data-страницах
- Optimistic updates для CRUD операций

### Navigation
- React Router с URL paths
- Breadcrumbs на вложенных страницах
- Active state в sidebar по route

### Feedback
- Toast notifications (успех/ошибка/инфо)
- Confirmation dialogs для удалений
- Empty states для пустых списков

### Real-time Updates
- SSE push-updates для контентных страниц (ContentPage, MarketingPage)
- AI закончил адаптацию → toast + контент обновляется без рефреша
- Переиспользует useSSE() хук из packages/shared

### Animations (subtle)
- Page transitions (fade)
- Sidebar collapse/expand
- Toast slide-in
- Skeleton shimmer

## 6. Migration Plan

### Этап 0: Фундамент
- pnpm workspace setup
- packages/ui: Tailwind config, shadcn/ui init, базовые компоненты
- packages/shared: api client, i18n, types, hooks

### Этап 1: docs-web (полигон)
- Мигрируем на @jarvis/ui + @jarvis/shared
- React Router: `/`, `/docs/:section`, `/legal/:doc`, `/chat`
- Sidebar, DocPage, ChatWidget → shared компоненты
- Responsive layout
- Результат: обкатанный design system

### Этап 2: admin-web
- Разбить App.tsx (872 строк) → отдельные страницы
- React Router: `/tenants`, `/staff`, `/servers`, `/analytics`, `/settings`
- DataTable для tenants/staff
- Dialog для создания/редактирования
- Toast вместо inline сообщений

### Этап 3: user-web
- Разбить App.tsx (700 строк) → 19 page-компонентов с роутами
- Chat UI: ChatBubble, ChatInput, ChatSidebar
- SSE push-updates для контентных страниц
- DataTable + Dialog + Form на всех data-страницах
- Mobile-responsive chat
- Skeleton loaders

### Каждый этап
- Функционал 1:1 с текущим
- Визуал обновляется на Dark Corporate
- i18n через @jarvis/shared
- Старый код сохранён в git для сравнения

## Not In Scope
- Command palette / keyboard shortcuts
- Drag & drop
- Offline mode
- Light theme (Dark Corporate only)
- New features or pages beyond current functionality
