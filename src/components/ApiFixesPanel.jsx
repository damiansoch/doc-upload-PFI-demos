import { AlertTriangle } from 'lucide-react'

// Reference list for the real API changes this prototype has surfaced —
// not solicitor-facing, not part of any option's design. Internal notes for
// whoever picks this up on the backend, kept next to the mock so the context
// (why it matters, where it lives) travels with the finding instead of living
// only in a chat transcript.
const FIXES = [
  {
    title: 'Reuse a still-valid signing URL instead of always generating a new one',
    endpoint: 'POST /api/esign/documents/<id>/generate-signing-url/',
    where: 'esign/views.py: generate_signing_url() → esign/embedded_signing_services.py: generate_embedded_signing_url()',
    wrong:
      'Every call unconditionally requests a brand-new URL from DocuSign\'s create_recipient_view — even if a valid, unused URL was already generated for that same recipient moments earlier. There is no "is there already a valid one?" check anywhere in this path.',
    shouldBe:
      'Before generating, check whether a still-valid, unused URL already exists for that recipient and reuse it. Only call DocuSign again once the existing one has actually expired or been consumed.',
    why:
      'Avoids burning DocuSign API calls unnecessarily, and avoids the confusing case where a solicitor clicks "start signing" more than once for the same person (by accident, or after navigating away and back) and ends up with two different links for them, only one of which is meant to be valid.',
    also:
      'embedded_signing_url / embedded_signing_url_expires_at currently live on the Document — one field, shared across every recipient — so a signer B\'s generated URL overwrites whatever was stored for signer A. There\'s no per-signer place to even check validity against yet, so this needs to move to per-recipient storage (e.g. on EsignRecipientEvent) before "reuse if still valid" can be implemented correctly.',
  },
]

export default function ApiFixesPanel() {
  return (
    <div className="bg-white px-[34px] py-4">
      <p className="font-sans text-xs leading-[18px] text-muted">
        Real backend issues found while building these options — for the team, not solicitor-facing.
        Each one needs an actual API change, not just a frontend fix.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {FIXES.map((fix) => (
          <div key={fix.title} className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
            <p className="flex items-start gap-2 font-sans text-sm font-semibold text-ink2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              {fix.title}
            </p>

            <p className="mt-2 font-sans text-[11px] font-semibold uppercase tracking-wide text-muted">
              Endpoint
            </p>
            <p className="mt-0.5 font-mono text-xs text-ink2">{fix.endpoint}</p>

            <p className="mt-2 font-sans text-[11px] font-semibold uppercase tracking-wide text-muted">
              Where in the code
            </p>
            <p className="mt-0.5 font-mono text-xs text-ink2">{fix.where}</p>

            <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-wide text-red-600">
              What's wrong now
            </p>
            <p className="mt-0.5 font-sans text-xs leading-[18px] text-muted">{fix.wrong}</p>

            <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-wide text-green">
              What it should do instead
            </p>
            <p className="mt-0.5 font-sans text-xs leading-[18px] text-muted">{fix.shouldBe}</p>

            <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-wide text-ink2">
              Why it matters
            </p>
            <p className="mt-0.5 font-sans text-xs leading-[18px] text-muted">{fix.why}</p>

            {fix.also && (
              <p className="mt-3 rounded-md border border-amber-300 bg-white p-2.5 font-sans text-xs leading-[18px] text-amber-800">
                <span className="font-semibold">Also needed: </span>
                {fix.also}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
