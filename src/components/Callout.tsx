const icons: Record<string, string> = { info: 'i', warning: '!', tip: '★' }
const labels: Record<string, string> = { info: 'Info', warning: 'Warning', tip: 'Tip' }

export default function Callout({ variant, text }: { variant: 'info' | 'warning' | 'tip'; text: string }) {
  return (
    <div className={`callout callout-${variant}`}>
      <span className="callout-icon">{icons[variant]}</span>
      <div>
        <div className="callout-label">{labels[variant]}</div>
        <div>{text}</div>
      </div>
    </div>
  )
}
