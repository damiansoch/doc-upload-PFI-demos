import { useMemo, useState } from 'react'
import { ArrowLeft, Copy, UserCheck } from 'lucide-react'

function randomToken(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// One signing session per signer, not two competing flows — "in person" and
// "secure link" both boil down to the same generated session behind the
// scenes (same URL, same access code), so this panel generates it once and
// offers both ways to use it. The access code is required either way, so it
// sits in the same details box as the link — visible up front, not tucked
// away only inside a "generate link" sub-path — and a single "Copy details"
// action carries both instead of the link alone.
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
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
        {onBack && (
          <div className="mb-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 font-sans text-xs font-medium text-muted"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
          </div>
        )}
        <p className="font-sans text-[13px] font-semibold text-ink2">
          Signing session ready for {party}
        </p>
        <p className="mt-1 font-sans text-xs leading-[18px] text-muted">
          An access code is required to complete signing — whether {party} signs in person or via
          the secure link below.
        </p>

        <button
          type="button"
          disabled={openingDisabled}
          onClick={onOpenNow}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-sans text-xs font-medium text-white disabled:opacity-60"
        >
          <UserCheck className="h-3.5 w-3.5" />
          Open now — sign in person
        </button>
      </div>

      {/* Secondary method — deliberately outside and visually lighter than the
          primary card above, so "open now" reads as the default and this
          reads as the fallback, not a second equally-weighted option. */}
      <div className="mt-2.5 border-t border-border3 pt-2.5">
        <p className="font-sans text-[11px] text-muted">
          If {party} is not present, share the link and access code below instead.
        </p>
        <div className="mt-1.5 rounded-lg border border-border2 bg-[#FAFAF9] p-2.5">
          <div className="group relative">
            <input
              type="text"
              readOnly
              value={link}
              onMouseDown={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              className="w-full cursor-not-allowed select-none rounded-md border border-border2 bg-white px-2.5 py-1.5 font-sans text-xs text-ink2"
            />
            <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 w-max max-w-[280px] rounded-md bg-ink2 px-2.5 py-1.5 font-sans text-[11px] leading-[15px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              This link can&apos;t be copied on its own — copying it without the access code would
              leave the signer unable to complete signing. Use Copy details below to include both.
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="font-sans text-xs text-muted">
              Access code:{' '}
              <span className="font-mono text-sm font-semibold tracking-wider text-ink2">
                {accessCode}
              </span>
            </span>
            <button
              type="button"
              onClick={copyDetails}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border1 bg-white px-3 py-1.5 font-sans text-xs font-medium text-ink"
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
