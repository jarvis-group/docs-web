import type { Lang } from '../i18n'
import { t } from '../i18n'
import type { DocSection } from '../content'

interface Props {
  lang: Lang
  sections: DocSection[]
  onSelect: (id: string) => void
}

export default function DocsHome({ lang, sections, onSelect }: Props) {
  return (
    <div className="docs-home">
      <div className="docs-hero">
        <h1 className="docs-hero-title">{t(lang, 'docs.title')}</h1>
        <p className="docs-hero-sub">{t(lang, 'docs.subtitle')}</p>
      </div>
      <div className="docs-grid">
        {sections.map(s => (
          <button key={s.id} className="docs-card" onClick={() => onSelect(s.id)}>
            <div className="docs-card-icon">{s.icon}</div>
            <div className="docs-card-title">{s.heading}</div>
            <div className="docs-card-desc">{t(lang, `home.card.${s.id}`)}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
