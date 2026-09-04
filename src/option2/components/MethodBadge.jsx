import { Mail, Link2, Printer } from 'lucide-react'
import { METHOD_INFO } from '../data/documents'

const METHOD_ICON = {
  email: Mail,
  embedded: Link2,
  wet: Printer,
}

export default function MethodBadge({ method }) {
  const info = METHOD_INFO[method]
  const Icon = METHOD_ICON[method]
  if (!info) return null

  // Both variants build the pieces (icon, label, separator, sub-label) as
  // separate inline-flex children rather than one wrapping text node — a
  // rounded-full pill whose content wraps to multiple lines balloons into a
  // near-circle (border-radius:9999px against a now-tall box), and a single
  // wrapped text blob makes the icon drift to the vertical center of every
  // line instead of sitting with the first one. Discrete children wrap at
  // natural breaks and keep the icon pinned to line one.
  if (method === 'wet') {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs">
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 font-semibold text-orange-700">
          <Icon className="h-3.5 w-3.5 shrink-0" />
          {info.label}
        </span>
        <span className="text-muted">{info.sub}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 font-sans text-xs text-muted">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="font-medium text-ink2">{info.label}</span>
      <span>&middot; {info.sub}</span>
    </span>
  )
}
