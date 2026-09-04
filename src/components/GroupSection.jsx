import { useEffect, useState } from 'react'
import { CheckCircle2, ChevronDown } from 'lucide-react'

const DOT_CLASSES = {
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green',
  grey: 'bg-gray-300',
}

export default function GroupSection({
  tone = 'grey',
  title,
  subtitle,
  count,
  defaultOpen = true,
  complete = false,
  // Opt-out for contexts (e.g. a static reference example) that need to
  // show a completed section's own contents rather than its normal
  // auto-collapsed resting state — mirrors what a solicitor sees after
  // manually reopening one to review it.
  keepOpenWhenComplete = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)

  // Auto-collapse the moment every item in this section becomes complete —
  // mirrors the per-item auto-close behaviour, applied at the section level.
  useEffect(() => {
    if (complete && !keepOpenWhenComplete) setOpen(false)
  }, [complete, keepOpenWhenComplete])

  return (
    <div
      className={`overflow-hidden rounded-lg border transition-colors ${
        complete ? 'border-green/30 bg-green/5' : 'border-border2 bg-white'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 p-4 text-left"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {complete ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green" />
          ) : (
            <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_CLASSES[tone]}`} />
          )}
          <span className="font-sans text-[13px] font-semibold text-ink2">{title}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold ${
              complete ? 'bg-green/10 text-green' : 'bg-[#F5F5F4] text-muted'
            }`}
          >
            {complete ? 'Complete' : count}
          </span>
        </span>
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {subtitle && (
        <p className="-mt-2 px-4 pb-4 font-sans text-xs leading-[17px] text-muted">{subtitle}</p>
      )}
      {open && (
        <div className="flex flex-col gap-2.5 border-t border-border3 p-4">{children}</div>
      )}
    </div>
  )
}
