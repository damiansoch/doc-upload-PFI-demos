import { CheckCircle2, Download, ShieldCheck, Upload } from 'lucide-react'
import ChevronButton from './ChevronButton'
import StatusPill from './StatusPill'
import { AML_REQUIREMENT } from '../data/documents'

const ICON_CLASSES_BY_TONE = {
  green: 'bg-green/10 text-green border-green/30',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
}

const STRIPE_CLASSES_BY_TONE = {
  green: 'bg-green',
  purple: 'bg-purple-500',
}

// Card background stays plain white for every tone — status color lives in
// the left stripe (and the status pill), not a tinted card.
const CARD_BG_BY_TONE = {
  green: 'bg-white',
  purple: 'bg-white',
}

export default function AmlPersonItem({ person, uploaded, onUpload, open, onOpenChange }) {
  const tone = uploaded ? 'green' : 'purple'

  return (
    <div
      className={`flex overflow-hidden rounded-lg border border-border2 transition-colors ${CARD_BG_BY_TONE[tone]}`}
    >
      <span className={`w-1.5 shrink-0 ${STRIPE_CLASSES_BY_TONE[tone]}`} />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="flex w-full flex-wrap items-start justify-between gap-x-3 gap-y-2 p-4 text-left"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${ICON_CLASSES_BY_TONE[tone]}`}
            >
              {uploaded ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </span>
            <span>
              <span className="flex flex-wrap items-center gap-2">
                <span
                  className={`font-sans text-[14px] font-semibold leading-[18px] ${
                    uploaded ? 'text-muted' : 'text-ink2'
                  }`}
                >
                  {person.name}
                </span>
                <span className="rounded-full bg-[#F5F5F4] px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-muted">
                  AML / KYC
                </span>
              </span>
              <span className="mt-0.5 block font-sans text-xs text-muted">
                {AML_REQUIREMENT.docType}
              </span>
            </span>
          </div>

          <span className="ml-auto flex shrink-0 items-center gap-3">
            <StatusPill tone={uploaded ? 'green' : 'purple'}>
              {uploaded ? 'Completed' : 'Certification Required'}
            </StatusPill>
            <ChevronButton open={open} />
          </span>
        </button>

        {open && (
          <div className="border-t border-border3 px-4 pb-4 pt-3">
            <p className="font-sans text-xs leading-[18px] text-muted">
              <span className="font-medium text-ink2">Uploaded by: </span>
              Solicitor, directly in the portal
            </p>
            <p className="mt-2 font-sans text-xs leading-[18px] text-muted">
              <span className="font-medium text-ink2">What&apos;s required: </span>
              {AML_REQUIREMENT.docDescription}
            </p>

            <div className="mt-3">
              {uploaded ? (
                <div className="flex flex-col gap-2">
                  <p className="flex items-center gap-1.5 font-sans text-xs font-semibold text-green">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Certification uploaded
                  </p>
                  <button
                    type="button"
                    className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border1 bg-white px-3 py-1.5 font-sans text-xs font-medium text-ink"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download signed document
                  </button>
                </div>
              ) : (
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-sans text-xs font-medium text-white">
                  <Upload className="h-3.5 w-3.5" />
                  Upload certification
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onUpload()
                        onOpenChange(false)
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
