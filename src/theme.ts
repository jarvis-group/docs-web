export type ThemeMode = 'light' | 'dark' | 'system'

const light: Record<string, string> = {
  '--bg-primary': '#f8fafc', '--bg-secondary': '#f1f5f9', '--bg-tertiary': '#e2e8f0',
  '--bg-input': '#ffffff', '--border': '#cbd5e1', '--border-focus': '#1e56d0',
  '--text-primary': '#0f172a', '--text-secondary': '#475569', '--text-tertiary': '#94a3b8',
  '--accent': '#1e56d0', '--accent-hover': '#1745a8', '--accent-light': 'rgba(30,86,208,0.08)',
  '--danger': '#dc3545', '--success': '#0ea5e9', '--warning': '#f59e0b',
  '--sidebar-bg': '#f1f5f9', '--card-bg': '#ffffff', '--code-bg': '#f1f5f9',
  '--callout-info': 'rgba(30,86,208,0.06)', '--callout-warn': 'rgba(245,158,11,0.06)',
  '--callout-tip': 'rgba(14,165,233,0.06)',
}

const dark: Record<string, string> = {
  '--bg-primary': '#0b1120', '--bg-secondary': '#111827', '--bg-tertiary': '#1e293b',
  '--bg-input': '#1e293b', '--border': '#334155', '--border-focus': '#2b6cf3',
  '--text-primary': '#f1f5f9', '--text-secondary': '#94a3b8', '--text-tertiary': '#64748b',
  '--accent': '#3b82f6', '--accent-hover': '#60a5fa', '--accent-light': 'rgba(59,130,246,0.12)',
  '--danger': '#ef4444', '--success': '#0ea5e9', '--warning': '#f59e0b',
  '--sidebar-bg': '#0f172a', '--card-bg': '#1e293b', '--code-bg': '#0f172a',
  '--callout-info': 'rgba(59,130,246,0.08)', '--callout-warn': 'rgba(245,158,11,0.08)',
  '--callout-tip': 'rgba(14,165,233,0.08)',
}

export function applyTheme(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
  const vars = isDark ? dark : light
  Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v))
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

export function getStoredTheme(): ThemeMode {
  return (localStorage.getItem('jarvis_docs_theme') as ThemeMode) || 'system'
}
export function storeTheme(mode: ThemeMode) { localStorage.setItem('jarvis_docs_theme', mode) }
