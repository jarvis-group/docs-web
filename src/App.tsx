import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { applyTheme, getStoredTheme, storeTheme, type ThemeMode } from './theme'
import { getStoredLang, storeLang, t, type Lang } from './i18n'
import { getSections } from './content'
import Sidebar from './components/Sidebar'
import DocsHome from './components/DocsHome'
import DocPage from './components/DocPage'

export default function App() {
  const [lang, setLang] = useState<Lang>(getStoredLang())
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme())
  const [currentSection, setCurrentSection] = useState<string | null>(null)

  const sections = useMemo(() => getSections(lang), [lang])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Hash-based routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '')
      if (hash && sections.find(s => s.id === hash)) {
        setCurrentSection(hash)
      } else {
        setCurrentSection(null)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [sections])

  const navigate = (id: string | null) => {
    if (id) {
      window.location.hash = `#/${id}`
    } else {
      window.location.hash = ''
    }
    setCurrentSection(id)
    window.scrollTo(0, 0)
  }

  const toggleLang = () => {
    const next: Lang = lang === 'ru' ? 'en' : 'ru'
    setLang(next)
    storeLang(next)
  }

  const cycleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
    setTheme(next)
    storeTheme(next)
    applyTheme(next)
  }

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '◑'

  const activeSection = sections.find(s => s.id === currentSection) ?? null

  // Table of Contents for current section
  const toc = activeSection
    ? activeSection.blocks
        .filter(b => b.type === 'h2')
        .map(b => ({ text: (b as { text: string }).text, anchor: (b as { anchor?: string }).anchor ?? '' }))
    : []

  return (
    <div className="docs-layout">
      <Sidebar
        sections={sections}
        current={currentSection}
        onSelect={(id) => navigate(id)}
        onHome={() => navigate(null)}
      />

      <div className="docs-main">
        {/* Header */}
        <header className="docs-header">
          <div className="docs-header-left">
            {currentSection && (
              <button className="docs-back" onClick={() => navigate(null)}>
                ← {t(lang, 'back')}
              </button>
            )}
          </div>
          <div className="docs-header-right">
            <button className="header-btn" onClick={toggleLang}>{t(lang, 'lang.switch')}</button>
            <button className="header-btn" onClick={cycleTheme}>{themeIcon}</button>
          </div>
        </header>

        {/* Content */}
        <div className="docs-content-area">
          <div className="docs-content">
            {activeSection ? <DocPage section={activeSection} /> : <DocsHome lang={lang} sections={sections} onSelect={(id) => navigate(id)} />}
          </div>

          {/* TOC */}
          {activeSection && toc.length > 0 && (
            <nav className="docs-toc">
              <div className="toc-title">{lang === 'ru' ? 'На странице' : 'On this page'}</div>
              {toc.map((item, i) => (
                <a key={i} className="toc-link" href={`#${item.anchor}`} onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(item.anchor)?.scrollIntoView({ behavior: 'smooth' })
                }}>{item.text}</a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
