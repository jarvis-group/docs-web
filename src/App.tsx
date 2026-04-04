import { useMemo } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { PageShell, Toaster, Logo, ErrorBoundary } from '@jarvis/ui'
import type { SidebarItem } from '@jarvis/ui'
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
  const location = useLocation()

  const sections = useMemo(() => getSections(lang), [lang])

  // Derive current sectionId from URL path
  const sectionId = location.pathname === '/' ? null : location.pathname.replace(/^\//, '')

  const sidebarItems: SidebarItem[] = useMemo(() => [
    { id: '__home__', icon: '🏠', label: t('nav.home') },
    ...sections.map(s => ({ id: s.id, icon: s.icon, label: s.heading })),
  ], [sections, t])

  const handleNavigate = (id: string) => {
    if (id === '__home__') navigate('/')
    else navigate(`/${id}`)
    window.scrollTo(0, 0)
  }

  return (
    <PageShell
      sidebarItems={sidebarItems}
      activeId={sectionId ?? '__home__'}
      onNavigate={handleNavigate}
      sidebarHeader={(collapsed) => (
        <div className="cursor-pointer flex items-center gap-2 justify-center" onClick={() => { window.location.href = '/' }}>
          <Logo size={collapsed ? 36 : 40} />
          {!collapsed && (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold bg-gradient-to-r from-accent to-accent-cyan bg-clip-text text-transparent">JARVIS</span>
              <span className="text-xs font-medium text-foreground-muted">docs</span>
            </div>
          )}
        </div>
      )}
      topbarLeft={
        sectionId ? (
          <button onClick={() => navigate('/')} className="text-sm text-foreground-secondary hover:text-accent transition-colors">
            {t('back')}
          </button>
        ) : undefined
      }
      topbarRight={
        <div className="flex items-center gap-2">
          <button onClick={toggleLang} className="px-3 py-1 text-xs font-semibold border border-border rounded-md text-foreground-secondary hover:border-accent hover:text-accent transition-all">
            {t('lang.switch')}
          </button>
          <button onClick={cycleTheme} className="px-3 py-1 text-xs font-semibold border border-border rounded-md text-foreground-secondary hover:border-accent hover:text-accent transition-all">
            {themeIcon}
          </button>
        </div>
      }
    >
      <ErrorBoundary>
      <Routes>
        <Route index element={<DocsHome lang={lang} sections={sections} />} />
        <Route path=":sectionId" element={<DocPageRoute lang={lang} sections={sections} />} />
        <Route path="*" element={<div className="flex items-center justify-center h-[60vh]"><h1 className="text-2xl text-muted-foreground">{t('page.not_found') || '404 — Page not found'}</h1></div>} />
      </Routes>
      </ErrorBoundary>
      <ChatWidget lang={lang} t={t} />
      <Toaster />
    </PageShell>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<AppContent />} />
    </Routes>
  )
}
