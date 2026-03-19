import type { DocSection, Block } from '../content'
import Callout from './Callout'

export default function DocPage({ section }: { section: DocSection }) {
  return (
    <article className="doc-article">
      <h1 className="doc-title">{section.icon} {section.heading}</h1>
      {section.blocks.map((block, i) => <RenderBlock key={i} block={block} />)}
    </article>
  )
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return <p className="doc-p">{block.text}</p>
    case 'h2':
      return <h2 id={block.anchor} className="doc-h2">{block.text}</h2>
    case 'h3':
      return <h3 id={block.anchor} className="doc-h3">{block.text}</h3>
    case 'list':
      return <ul className="doc-list">{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
    case 'table':
      return (
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead><tr>{block.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>{block.rows.map((row, i) => (
              <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      )
    case 'callout':
      return <Callout variant={block.variant} text={block.text} />
    case 'code':
      return <pre className="doc-code"><code>{block.code}</code></pre>
  }
}
