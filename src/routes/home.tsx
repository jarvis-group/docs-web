import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@jarvis/ui'
import { useTranslation } from '@jarvis/shared'
import type { Lang, DocSection } from '@jarvis/shared'
import { docsTranslations } from '../translations'

interface Props {
  lang: Lang
  sections: DocSection[]
}

export default function DocsHome({ lang, sections }: Props) {
  const { t } = useTranslation('jarvis_docs_lang', docsTranslations)
  const navigate = useNavigate()

  // Suppress unused var lint — lang is used as a dependency indicator
  void lang

  return (
    <div className="px-8 py-12 max-w-[900px]">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-2 text-foreground">
          {t('docs.title')}
        </h1>
        <p className="text-foreground-secondary text-lg">
          {t('docs.subtitle')}
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(s => (
          <Card
            key={s.id}
            className="cursor-pointer border-border hover:border-accent transition-all duration-150 hover:-translate-y-0.5"
            onClick={() => { navigate(`/${s.id}`); window.scrollTo(0, 0) }}
          >
            <CardContent className="p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-sm font-bold text-foreground mb-1">{s.heading}</div>
              <div className="text-xs text-foreground-muted leading-relaxed">
                {t(`home.card.${s.id}`)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
