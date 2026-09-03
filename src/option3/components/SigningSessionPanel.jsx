import { useMemo, useState } from 'react'
import { ArrowLeft, Copy, UserCheck } from 'lucide-react'

function randomToken(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// One session, two ways to use it — "sign in person" and "send a link" are
// the same generated session underneath. The access code is required either
// way, so it lives in the same details box as the link (visible before
// picking a path, not hidden inside a "link" sub-view), and one "Copy
// details" action carries both.
export default function SigningSessionPanel({ party, onOpenNow, openingDisabled, onShared, onBack }) {
  const link = useMemo(
    () => `https://sign.pfi-ireland.ie/s/${randomToken(10).toLowerCase()}`,
    [],
  )
  const accessCode = useMemo(() => randomToken(6), [])
  const [copied, setCopied] = useState(false)

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(`${link}\nAccess code: ${accessCode}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — details remain visible/selectable in the panel
    }
    onShared?.()
  }

  return (
    <div>
      <div className="rounded-lg border border-red-200 bg-red-50/60 p-2.5">
        {onBack && (
          <div className="mb-1.5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 font-sans text-[11px] font-medium text-muted"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={openingDisabled}
          onClick={onOpenNow}
          className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1.5 font-sans text-[11px] font-medium text-white disabled:opacity-60"
        >
          <UserCheck className="h-3 w-3" />
          Sign now
        </button>
        <p className="mt-1 font-sans text-[10px] leading-[14px] text-muted">
          {party} signs here, in person — not the solicitor.
        </p>
      </div>

      {/* Secondary method — outside and visually lighter than the primary
          card above, so "Sign now" reads as the default and this reads as
          the fallback, not a second equally-weighted option. */}
      <div className="mt-2 border-t border-border3 pt-2">
        <p className="font-sans text-[10px] leading-[14px] text-muted">
          If not present, share the link and code below instead.
        </p>
        <div className="mt-1.5 rounded border border-border2 bg-[#FAFAF9] p-2">
          <div className="group relative">
            <input
              type="text"
              readOnly
              value={link}
              onMouseDown={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              className="w-full cursor-not-allowed select-none rounded border border-border2 bg-white px-2 py-1 font-sans text-[11px] text-ink2"
            />
            <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 w-max max-w-[240px] rounded-md bg-ink2 px-2 py-1.5 font-sans text-[10px] leading-[14px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Can&apos;t be copied alone — without the code, {party} won&apos;t be able to sign. Use
              Copy details below for both.
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="font-sans text-[11px] text-muted">
              Code:{' '}
              <span className="font-mono font-semibold tracking-wider text-ink2">{accessCode}</span>
            </span>
            <button
              type="button"
              onClick={copyDetails}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border1 bg-white px-2 py-1 font-sans text-[11px] font-medium text-ink"
            >
              <Copy className="h-3 w-3" />
              {copied ? 'Copied' : 'Copy details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
