import { useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Skeleton } from '@jarvis/ui'
import { useTranslation } from '@jarvis/shared'
import type { Lang, DocSection, Block } from '@jarvis/shared'
import { docsTranslations } from '../translations'

interface Props {
  lang: Lang
  sections: DocSection[]
}

export default function DocPageRoute({ lang, sections }: Props) {
  const { sectionId } = useParams()
  const { t } = useTranslation('jarvis_docs_lang', docsTranslations)

  // Suppress unused var lint
  void lang

  const section = useMemo(
    () => sections.find(s => s.id === sectionId) ?? null,
    [sections, sectionId],
  )

  const toc = useMemo(() => {
    if (!section) return []
    return section.blocks
      .filter((b): b is Block & { type: 'h2'; text: string; anchor?: string } => b.type === 'h2')
      .map(b => ({ text: b.text, anchor: b.anchor ?? '' }))
  }, [section])

  if (!sectionId) return <Navigate to="/" replace />
  if (!section) {
    return (
      <div className="p-8 max-w-[760px]">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    )
  }

  return (
    <div className="flex flex-1">
      {/* Article */}
      <article className="flex-1 max-w-[760px] px-8 py-10">
        <h1 className="text-2xl font-extrabold mb-6 pb-4 border-b border-border">
          {section.icon} {section.heading}
        </h1>
        {section.blocks.map((block, i) => (
          <RenderBlock key={i} block={block} />
        ))}
      </article>

      {/* TOC sidebar */}
      {toc.length > 0 && (
        <nav className="w-[200px] min-w-[200px] px-4 pt-10 sticky top-[52px] self-start max-h-[calc(100vh-52px)] overflow-y-auto hidden lg:block">
          <div className="text-[0.7rem] font-bold uppercase tracking-wide text-foreground-muted mb-3">
            {t('toc.title')}
          </div>
          {toc.map((item, i) => (
            <a
              key={i}
              href={`#${item.anchor}`}
              onClick={e => {
                e.preventDefault()
                document.getElementById(item.anchor)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="block text-xs text-foreground-muted py-0.5 hover:text-accent transition-colors"
            >
              {item.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}

/* ---------- Block renderers ---------- */

const calloutConfig = {
  info: { icon: 'i', label: 'Info', border: 'border-l-accent', bg: 'bg-accent/5', iconBg: 'bg-accent', labelColor: 'text-accent' },
  warning: { icon: '!', label: 'Warning', border: 'border-l-warning', bg: 'bg-warning/5', iconBg: 'bg-warning', labelColor: 'text-warning' },
  tip: { icon: '\u2605', label: 'Tip', border: 'border-l-success', bg: 'bg-success/5', iconBg: 'bg-success', labelColor: 'text-success' },
} as const

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return <p className="text-foreground-secondary mb-4">{block.text}</p>
    case 'h2':
      return (
        <h2 id={block.anchor} className="text-xl font-bold mt-10 mb-3 pt-2 text-foreground">
          {block.text}
        </h2>
      )
    case 'h3':
      return (
        <h3 id={block.anchor} className="text-base font-semibold mt-6 mb-2 text-foreground">
          {block.text}
        </h3>
      )
    case 'list':
      return (
        <ul className="ml-6 mb-4 text-foreground-secondary list-disc marker:text-accent space-y-1">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="overflow-x-auto my-4 rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2.5 bg-sidebar text-foreground-muted font-semibold text-xs uppercase tracking-wide border-b border-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="hover:bg-background-secondary">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 border-b border-border text-foreground-secondary last:[tr:last-child_&]:border-b-0">
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
          <span className={`text-xs font-bold w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white ${cfg.iconBg}`}>
            {cfg.icon}
          </span>
          <div>
            <div className={`font-bold text-xs uppercase tracking-wide mb-0.5 ${cfg.labelColor}`}>
              {cfg.label}
            </div>
            <div className="text-foreground-secondary">{block.text}</div>
          </div>
        </div>
      )
    }
    case 'code':
      return (
        <pre className="bg-background-secondary border border-border rounded-lg p-4 my-4 overflow-x-auto text-xs leading-relaxed font-mono text-foreground-secondary whitespace-pre">
          <code>{block.code}</code>
        </pre>
      )
  }
}
