import { Clock, RefreshCw, Undo2 } from 'lucide-react'

const COPY_BY_VARIANT = {
  own: () => 'The DocuSign signing session has opened in a new tab. Review the document and apply the signature to finish.',
  in_person: (signerLabel) =>
    `The DocuSign signing session has opened in a new tab. Hand the screen or device to ${signerLabel} to complete signing.`,
  emailed: (signerLabel) =>
    `A secure DocuSign email has been sent to ${signerLabel}. They'll need to open it and sign electronically.`,
  arrange_done: (signerLabel) =>
    `Every signer (${signerLabel}) has been handled — in person or by secure link. Confirm below once DocuSign reports the envelope as fully signed.`,
}

const TITLE_BY_VARIANT = {
  emailed: 'Sent for signature',
  arrange_done: 'Awaiting confirmation',
}

// onReset is optional — when passed, this is a real signing action still
// awaiting confirmation (solicitor's own signature, or every arrange-kind
// signer handled) and the solicitor needs a way back to the unsigned state if
// it turns out signing wasn't actually completed. Not offered for the
// "emailed" variant — an emailed document has no local signing action to
// undo, it's genuinely just waiting on the recipient.
export default function SigningStatusPanel({ variant = 'own', signerLabel, onCheckUpdate, onReset }) {
  const body = (COPY_BY_VARIANT[variant] || COPY_BY_VARIANT.own)(signerLabel)

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
      <p className="font-sans text-[13px] font-semibold text-ink2">
        {TITLE_BY_VARIANT[variant] || 'Signing session opened'}
      </p>
      <p className="mt-1 font-sans text-xs leading-[18px] text-muted">{body}</p>

      <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
        <p className="font-sans text-[11px] leading-[16px] text-amber-800">
          <span className="font-semibold">Status takes 1–2 minutes to update after signing.</span>{' '}
          If this still shows as pending after refreshing, that&apos;s expected — check again
          shortly.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCheckUpdate}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-sans text-xs font-medium text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Check for update
        </button>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-border1 bg-white px-3 py-1.5 font-sans text-xs font-medium text-ink"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Wasn&apos;t completed — start over
          </button>
        )}
      </div>
    </div>
  )
}
