import { Loader2 } from 'lucide-react'

// Brief mock "opening the signing session" moment between clicking Sign now
// / Start signing and the real "Check for update" state — makes the mock
// read as an actual signing flow instead of an instant swap. Plain language
// only, no brand name, matching Option 3's copy throughout.
export default function DocuSignProcessingModal({ title, subtitle }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink2/40 p-4">
      <div className="flex w-full max-w-[280px] flex-col items-center gap-3 rounded-xl bg-white px-6 py-7 text-center shadow-xl">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </span>
        <div>
          <p className="font-sans text-sm font-semibold text-ink2">{title}</p>
          {subtitle && (
            <p className="mt-1 font-sans text-xs leading-[16px] text-muted">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
