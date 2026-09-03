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

  if (method === 'wet') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 font-sans text-xs text-orange-700">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>
          <span className="font-semibold">{info.label}</span> &middot; {info.sub}
        </span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-sans text-xs text-muted">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>
        <span className="font-medium text-ink2">{info.label}</span> &middot; {info.sub}
      </span>
    </span>
  )
}
