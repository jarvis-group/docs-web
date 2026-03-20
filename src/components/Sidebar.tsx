import type { DocSection } from '../content'

interface Props {
  sections: DocSection[]
  current: string | null
  onSelect: (id: string) => void
  onHome: () => void
}

export default function Sidebar({ sections, current, onSelect, onHome }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => window.location.href = '/'}>
        <span className="logo-text">JARVIS</span>
        <span className="logo-docs">docs</span>
      </div>
      <nav className="sidebar-nav">
        <button className={`sidebar-item ${current === null ? 'active' : ''}`} onClick={onHome}>
          <span className="sidebar-icon">🏠</span> Home
        </button>
        {sections.map(s => (
          <button
            key={s.id}
            className={`sidebar-item ${current === s.id ? 'active' : ''}`}
            onClick={() => onSelect(s.id)}
          >
            <span className="sidebar-icon">{s.icon}</span> {s.heading}
          </button>
        ))}
      </nav>
    </aside>
  )
}
